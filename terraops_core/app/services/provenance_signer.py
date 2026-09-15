import json
import hashlib
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.services.web3_anchor import Web3Anchor

class ProvenanceSigner:
    def __init__(self):
        self.web3_anchor = Web3Anchor()

    @staticmethod
    def _fetch_previous_hash(db: Session) -> str:
        """
        Retrieves the previous block's hash from the audit ledger.
        If genesis block, returns 64 zeros.
        """
        res = db.execute(text("""
            SELECT sha256_hash FROM cadastre_prod.audit_ledger 
            ORDER BY created_at DESC LIMIT 1
        """)).scalar()
        
        return res if res else "0" * 64

    def sign_transaction(self, db: Session, entity_id: str, change_type: str, previous_wkt: str, 
                         repaired_wkt: str, transform_matrix: dict, author_user_id: str) -> str:
        """
        Constructs an immutable hash chain compliant with Section 65B of the Indian Evidence Act.
        Computes H_current = SHA-256(H_prev + CanonicalPayload)
        """
        h_prev = self._fetch_previous_hash(db)
        
        # Canonicalize payload for deterministic hashing
        canonical_payload = json.dumps({
            "entity_id": str(entity_id),
            "change_type": change_type,
            "previous_wkt": previous_wkt,
            "repaired_wkt": repaired_wkt,
            "transform_matrix": transform_matrix,
            "author_user_id": author_user_id,
        }, sort_keys=True, separators=(',', ':'))
        
        # Combine H_prev with canonical payload
        combined_string = h_prev + canonical_payload
        
        # Compute H_current
        h_current = hashlib.sha256(combined_string.encode('utf-8')).hexdigest()
        
        # Anchor to Polygon Smart Contract
        try:
            self.web3_anchor.anchor_to_polygon([h_current])
        except Exception as e:
            # We log but do not fail the transaction if RPC is down
            print(f"Web3 Anchoring failed: {str(e)}")

        return h_current
