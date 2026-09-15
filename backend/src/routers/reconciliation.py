from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.database import get_db
from src.models import models, schemas
from src.services.engine import MatchScorer, ConflictEngine, EntityValidator

router = APIRouter()

@router.post("/trigger")
def trigger_reconciliation(db: Session = Depends(get_db)):
    """
    PHASE 4 & 5: ROBUST CANDIDATE GENERATION & MULTI-EVIDENCE MATCH ENGINE
    Uses spatial bounding box logic (ST_DWithin) to find 1:1, 1:N, and N:M candidates,
    then evaluates spatial, topological, and attribute evidence.
    """
    # 1. Fetch Candidates using Bounding Box + Proximity (Handling Splits/Merges implicitly)
    query = text("""
        SELECT 
            c.id as cad_id,
            m.id as mun_id,
            c.original_attributes->>'owner_name' as cad_owner,
            m.original_attributes->>'owner_name' as mun_owner,
            ST_Area(ST_Intersection(c.original_geometry, m.original_geometry)) / ST_Area(ST_Union(c.original_geometry, m.original_geometry)) as iou,
            ST_Distance(ST_Centroid(c.original_geometry), ST_Centroid(m.original_geometry)) as centroid_dist,
            c.source_authority_weight as cad_weight,
            m.source_authority_weight as mun_weight
        FROM 
            source_records c
        JOIN 
            source_records m 
        ON 
            ST_DWithin(c.original_geometry, m.original_geometry, 15.0) -- Candidates within proximity (15 meters)
        WHERE 
            c.source_type = 'cadastral' AND m.source_type = 'municipal'
            AND c.canonical_entity_id IS NULL AND m.canonical_entity_id IS NULL
    """)
    
    results = db.execute(query).fetchall()
    
    entities_created = 0
    new_entities = []
    new_conflicts = []
    
    for row in results:
        cad_id, mun_id, cad_owner, mun_owner, iou, centroid_dist, cad_weight, mun_weight = row
        
        iou = float(iou) if iou else 0.0
        centroid_dist = float(centroid_dist) if centroid_dist else 0.0
        has_owners = bool(cad_owner and mun_owner)
        
        # 2. Entity Validator (Phase 6)
        entity_a_type = EntityValidator.identify_type(cad_owner)
        entity_b_type = EntityValidator.identify_type(mun_owner)
        entity_compatible = EntityValidator.is_compatible(entity_a_type, entity_b_type)
        
        # 3. Evidence Scoring (Phase 12)
        spatial_evidence = iou * 100.0
        attribute_evidence = MatchScorer.calculate_attribute_similarity(cad_owner, mun_owner) * 100.0
        overall_confidence = (spatial_evidence * 0.7) + (attribute_evidence * 0.3)
        
        # 4. Match Type Classification (Phase 7)
        match_type = "SAME_ENTITY"
        if iou > 0.1 and iou < 0.6: 
            # Very loose proxy for splits/merges for now, could be refined
            match_type = "POSSIBLE_SPLIT_OR_MERGE"
            
        status = "PENDING_REVIEW"
        reason = f"Spatial Overlap: {spatial_evidence:.1f}%. Attribute Match: {attribute_evidence:.1f}%."
        
        if not entity_compatible:
            status = "REJECTED"
            match_type = "ATTRIBUTE_CONFLICT"
            reason = f"Semantic entity mismatch: {entity_a_type} vs {entity_b_type}."
            overall_confidence = 0.0
        elif overall_confidence > 85.0:
            status = "AUTO_ACCEPT"
            
        # Create Canonical Entity
        entity = models.LandEntity(
            canonical_id=f"CANON-{cad_id}-{mun_id}",
            attributes={"owner_name": cad_owner, "municipal_owner": mun_owner},
            spatial_evidence=spatial_evidence,
            attribute_evidence=attribute_evidence,
            overall_confidence=overall_confidence,
            confidence_reason=reason,
            status=status,
            match_type=match_type
        )
        db.add(entity)
        db.flush() # Get entity ID
        
        # Log AI Decision to Blockchain Ledger
        audit = models.AuditLog(
            entity_id=entity.id,
            action=f"AI_GENERATED_{status}",
            actor="GeoAI_Match_Engine",
            reason=reason,
            details={"spatial_evidence": spatial_evidence, "attribute_evidence": attribute_evidence}
        )
        db.add(audit)

        
        # Link source records
        db.execute(text("UPDATE source_records SET canonical_entity_id = :eid WHERE id IN (:cid, :mid)"), {"eid": entity.id, "cid": cad_id, "mid": mun_id})
        
        # Create Conflicts if needed
        if not entity_compatible:
            conflict = models.EntityConflict(
                canonical_entity_id=entity.id,
                conflict_type="ENTITY_TYPE_CONFLICT",
                severity="HIGH",
                description=f"Owner types conflict. Cadastral claims {entity_a_type}, Municipal claims {entity_b_type}.",
                evidence={"cad_owner": cad_owner, "mun_owner": mun_owner},
                status="UNRESOLVED",
                recommended_action="FIELD_VERIFICATION"
            )
            db.add(conflict)
        elif iou < 0.8 and iou > 0:
            conflict = models.EntityConflict(
                canonical_entity_id=entity.id,
                conflict_type="GEOMETRY_CONFLICT",
                severity="MEDIUM",
                description=f"Partial spatial overlap detected ({iou*100:.1f}%). Possible subdivision or boundary shift.",
                evidence={"iou": iou, "centroid_dist": centroid_dist},
                status="UNRESOLVED",
                recommended_action="REVIEW"
            )
            db.add(conflict)
            
        entities_created += 1
        
    db.commit()
        
    return {"message": f"Reconciliation triggered. Generated {entities_created} canonical entities."}

@router.get("/results", response_model=list[schemas.LandEntityResponse])
def get_results(db: Session = Depends(get_db)):
    # Return Canonical Entities instead of matches
    return db.query(models.LandEntity).all()

@router.get("/geojson")
def get_geojson(db: Session = Depends(get_db)):
    import json
    # Join LandEntities to their SourceRecords to send to frontend
    # 1. Mapped Canonical Entities
    query = text("""
        SELECT 
            e.id, e.status, e.match_type, e.overall_confidence,
            ST_AsGeoJSON(ST_Transform(c.original_geometry, 4326)) as cad_geom,
            ST_AsGeoJSON(ST_Transform(m.original_geometry, 4326)) as mun_geom
        FROM land_entities e
        LEFT JOIN source_records c ON c.canonical_entity_id = e.id AND c.source_type = 'cadastral'
        LEFT JOIN source_records m ON m.canonical_entity_id = e.id AND m.source_type = 'municipal'
    """)
    results = db.execute(query).fetchall()
    features = []
    
    for row in results:
        props = {"id": row[0], "status": row[1], "match_type": row[2], "confidence": row[3]}
        if row[4]:
            p = props.copy()
            p["source"] = "cadastral"
            features.append({"type": "Feature", "properties": p, "geometry": json.loads(row[4])})
        if row[5]:
            p = props.copy()
            p["source"] = "municipal"
            features.append({"type": "Feature", "properties": p, "geometry": json.loads(row[5])})

    # 2. Unmapped Source Records
    unmapped_query = text("""
        SELECT 
            id, source_type, ST_AsGeoJSON(ST_Transform(original_geometry, 4326)) as geom
        FROM source_records
        WHERE canonical_entity_id IS NULL
    """)
    unmapped_results = db.execute(unmapped_query).fetchall()
    for row in unmapped_results:
        if row[2]:
            props = {"id": f"unmapped-{row[0]}", "status": "PENDING_REVIEW", "source": row[1], "confidence": 0}
            features.append({"type": "Feature", "properties": props, "geometry": json.loads(row[2])})
            
    return {"type": "FeatureCollection", "features": features}

@router.get("/financials")
def get_financials(db: Session = Depends(get_db)):
    """
    Calculates estimated property tax leakage based on SourceRecords.
    """
    query = text("""
        SELECT COUNT(c.id), COALESCE(SUM((c.original_attributes->>'area_cad')::float), 0)
        FROM source_records c
        LEFT JOIN land_entities e ON c.canonical_entity_id = e.id
        WHERE c.source_type = 'cadastral' AND e.id IS NULL
    """)
    result = db.execute(query).fetchone()
    
    unregistered_buildings = result[0] if result else 0
    unregistered_area = result[1] if result else 0
    
    base_tax = unregistered_buildings * 1200
    area_tax = unregistered_area * 50
    total_leakage = base_tax + area_tax

    # Get conflict stats
    stats_query = text("""
        SELECT status, COUNT(id) FROM land_entities GROUP BY status
    """)
    stats_result = db.execute(stats_query).fetchall()
    stats_dict = {row[0]: row[1] for row in stats_result}
    
    pending_conflicts = stats_dict.get("PENDING_REVIEW", 0)
    
    return {
        "ghost_buildings_identified": unregistered_buildings,
        "potential_revenue_recovered": total_leakage,
        "pending_conflicts": pending_conflicts,
        "stats": {
            "auto_harmonized": stats_dict.get("AUTO_ACCEPT", 0),
            "manual_review": stats_dict.get("PENDING_REVIEW", 0),
            "entity_type_conflict": stats_dict.get("REJECTED", 0)
        }
    }
