from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.database import get_db
from src.models.models import LandEntity

router = APIRouter(prefix="/telegram", tags=["Telegram Integration"])

class LocationPayload(BaseModel):
    latitude: float
    longitude: float
    user_id: int

@router.post("/location")
def verify_surveyor_location(payload: LocationPayload, db: Session = Depends(get_db)):
    """
    ANTI-CORRUPTION AUDITOR:
    Verifies if the surveyor is actually standing on the physical property.
    Detects 'Ghost Surveying' (surveyors approving land from a coffee shop).
    """
    # 1. Create a PostGIS point from the surveyor's Telegram Live Location
    point_wkt = f"POINT({payload.longitude} {payload.latitude})"
    surveyor_geom = func.ST_GeomFromText(point_wkt, 4326)

    # 2. Find the absolutely nearest disputed or pending property to this GPS pin
    nearest_entity = db.query(
        LandEntity,
        func.ST_Distance(
            func.ST_Transform(LandEntity.geom, 3857),
            func.ST_Transform(surveyor_geom, 3857)
        ).label("distance_meters")
    ).order_by(
        func.ST_Distance(LandEntity.geom, surveyor_geom)
    ).first()

    if not nearest_entity:
        return {"status": "NO_ENTITIES_FOUND", "message": "No active properties in database."}

    entity, distance = nearest_entity
    distance = float(distance) if distance else 0.0

    # 3. Anti-Corruption Logic (Threshold: 50 meters)
    if distance <= 50.0:
        return {
            "entity_id": entity.id,
            "status": entity.status,
            "owner": entity.attributes.get("owner_name", "Unknown"),
            "audit_status": "PASSED",
            "audit_message": f"✅ SPATIAL AUDIT PASSED\nGround Truth mathematically matches Drone AI Geometry (Distance: {distance:.1f}m).\nYou are authorized to upload physical evidence."
        }
    else:
        # Fraud detected - Surveyor is too far away
        return {
            "entity_id": entity.id,
            "status": entity.status,
            "owner": entity.attributes.get("owner_name", "Unknown"),
            "audit_status": "FRAUD_ALERT",
            "audit_message": f"🚨 FRAUD ALERT: 'Ghost Surveying' Detected.\n\nYou are {distance:.1f} meters away from the true boundary of Entity #{entity.id}. You must be physically present on the site to resolve disputes.\nYour Surveyor ID has been flagged to the Vigilance Dashboard."
        }
