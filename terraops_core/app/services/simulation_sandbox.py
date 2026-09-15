import uuid
import math
from shapely.wkt import loads as wkt_loads
from shapely.geometry import MultiPolygon, Polygon
from sqlalchemy.orm import Session
from sqlalchemy import text


class StatutoryViolationException(Exception):
    pass

class TopologyRepairSandbox:
    def __init__(self, db_session: Session):
        self.db = db_session

    def _polsby_popper_score(self, geom: Polygon | MultiPolygon) -> float:
        """
        Calculates the Polsby-Popper compactness score: (4 * pi * Area) / (Perimeter^2).
        Scores near 1 are highly compact (circle). Scores near 0 are thin slivers.
        """
        area = geom.area
        perimeter = geom.length
        if perimeter == 0:
            return 0.0
        return (4 * math.pi * area) / (perimeter ** 2)

    def apply_repair_strategy(self, khasra_id: str, strategy: str, dx: float = 0.0, dy: float = 0.0) -> dict:
        """
        Executes a spatial repair inside a SERIALIZABLE transaction on the sandbox schema.
        Rolls back if statutory constraints are violated.
        """
        session_id = str(uuid.uuid4())
        
        try:
            # 1. Start Serializable Transaction
            self.db.execute(text("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE"))
            
            # 2. Copy target parcel and neighbors to sandbox
            # We buffer by a small amount to find topological neighbors
            self.db.execute(text("""
                INSERT INTO cadastre_sandbox.staging_parcels (original_id, geom, legal_area_sqm, session_id)
                SELECT id, geom, legal_area_sqm, :sid
                FROM cadastre_prod.khasra_parcels p1
                WHERE p1.id = :kid OR ST_Intersects(p1.geom, (SELECT ST_Buffer(geom, 10) FROM cadastre_prod.khasra_parcels WHERE id = :kid))
            """), {"sid": session_id, "kid": khasra_id})
            
            # Fetch the original geometry for validation
            original_record = self.db.execute(text("""
                SELECT ST_AsText(geom), legal_area_sqm FROM cadastre_sandbox.staging_parcels 
                WHERE original_id = :kid AND session_id = :sid
            """), {"kid": khasra_id, "sid": session_id}).fetchone()
            
            if not original_record:
                raise ValueError(f"Parcel {khasra_id} not found.")
                
            orig_wkt, legal_area_sqm = original_record
            orig_geom = wkt_loads(orig_wkt)
            
            # 3. Apply Candidate Repair
            if strategy == "AFFINE_UNIFORM_SHIFT":
                # Translate geometry by dx, dy
                self.db.execute(text("""
                    UPDATE cadastre_sandbox.staging_parcels
                    SET geom = ST_Translate(geom, :dx, :dy)
                    WHERE original_id = :kid AND session_id = :sid
                """), {"dx": dx, "dy": dy, "kid": khasra_id, "sid": session_id})
                
            elif strategy == "TOPOLOGICAL_SNAP":
                # Simplified dummy for snapping to drone footprint edges
                pass
            else:
                raise ValueError(f"Unknown strategy {strategy}")
                
            # 4. Validation Pipeline
            repaired_record = self.db.execute(text("""
                SELECT ST_AsText(geom), ST_IsValid(geom), ST_Area(geom) 
                FROM cadastre_sandbox.staging_parcels 
                WHERE original_id = :kid AND session_id = :sid
            """), {"kid": khasra_id, "sid": session_id}).fetchone()
            
            rep_wkt, is_valid, new_area = repaired_record
            rep_geom = wkt_loads(rep_wkt)
            
            from shapely.validation import make_valid
            rep_geom = make_valid(rep_geom)
            
            # Rule A: Must be valid geometry
            if not is_valid:
                raise StatutoryViolationException("Repair resulted in invalid geometry (self-intersection).")
                
            # Rule B: Area delta <= 0.5%
            area_delta = abs(new_area - legal_area_sqm) / legal_area_sqm
            if area_delta > 0.005:
                raise StatutoryViolationException(f"Area delta {area_delta*100:.3f}% exceeds 0.5% statutory limit.")
                
            # Rule C: Polsby-Popper sliver test >= 0.05
            pp_score = self._polsby_popper_score(rep_geom)
            if pp_score < 0.05:
                raise StatutoryViolationException(f"Polsby-Popper score {pp_score:.3f} falls below sliver threshold of 0.05.")
                
            # Rule D: Zero Overlap with neighbors
            overlap_count = self.db.execute(text("""
                SELECT COUNT(*) FROM cadastre_sandbox.staging_parcels p1
                JOIN cadastre_sandbox.staging_parcels p2 ON ST_Overlaps(p1.geom, p2.geom)
                WHERE p1.original_id = :kid AND p2.original_id != :kid AND p1.session_id = :sid AND p2.session_id = :sid
            """), {"kid": khasra_id, "sid": session_id}).scalar()
            
            if overlap_count > 0:
                raise StatutoryViolationException(f"Repair resulted in {overlap_count} topological overlaps with adjacent parcels.")
                
            # 5. Passed all tests. Calculate Hash and Commit.
            transform_matrix = {"strategy": strategy, "dx": dx, "dy": dy}
            justification = f"Area delta: {area_delta*100:.3f}%, Polsby-Popper: {pp_score:.3f}, Overlaps: {overlap_count}"
            
            from app.services.provenance_signer import ProvenanceSigner
            sha_hash = ProvenanceSigner.sign_transaction(
                self.db, str(khasra_id), strategy, orig_wkt, rep_wkt, transform_matrix, "TEST_USER_ID"
            )
            
            # Move to prod
            self.db.execute(text("""
                UPDATE cadastre_prod.khasra_parcels
                SET geom = (SELECT geom FROM cadastre_sandbox.staging_parcels WHERE original_id = :kid AND session_id = :sid),
                    updated_at = NOW()
                WHERE id = :kid
            """), {"kid": khasra_id, "sid": session_id})
            
            # Write Ledger
            self.db.execute(text("""
                INSERT INTO cadastre_prod.audit_ledger (entity_id, change_type, previous_wkt, repaired_wkt, transformation_matrix, statutory_justification, sha256_hash)
                VALUES (:kid, :ctype, :pwkt, :rwkt, :matrix, :just, :hash)
            """), {
                "kid": khasra_id, "ctype": strategy, "pwkt": orig_wkt, "rwkt": rep_wkt,
                "matrix": json.dumps(transform_matrix), "just": justification, "hash": sha_hash
            })
            
            self.db.commit()
            
            return {
                "status": "SUCCESS",
                "sha256_hash": sha_hash,
                "metrics": {
                    "area_delta_percent": area_delta * 100,
                    "polsby_popper": pp_score
                }
            }
            
        except Exception as e:
            self.db.rollback()
            # Log failure to sandbox
            err_payload = json.dumps({"error": str(e)})
            try:
                # We need a new transaction to log the error since the previous one was rolled back
                self.db.execute(text("""
                    INSERT INTO cadastre_sandbox.sandbox_run_logs (session_id, status, error_payload)
                    VALUES (:sid, 'FAILED', :err)
                """), {"sid": session_id, "err": err_payload})
                self.db.commit()
            except:
                self.db.rollback()
                
            if isinstance(e, StatutoryViolationException):
                raise e
            raise RuntimeError(f"Sandbox execution failed: {str(e)}")
            
        finally:
            # Clean up sandbox
            try:
                self.db.execute(text("DELETE FROM cadastre_sandbox.staging_parcels WHERE session_id = :sid"), {"sid": session_id})
                self.db.commit()
            except:
                self.db.rollback()
