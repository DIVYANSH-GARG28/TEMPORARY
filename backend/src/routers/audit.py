from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from src.database import get_db
from src.models import models
from pydantic import BaseModel
import datetime
import httpx

router = APIRouter()

class ReviewAction(BaseModel):
    action: str 
    reviewer: str = "SIH_Judge"
    reason: str = "Manual review override"

def send_telegram_alert(entity_id: int, action: str, reviewer: str, reason: str):
    webhook_url = "https://divyansh67.app.n8n.cloud/webhook-test/sih-alert"
    payload = {
        "entity_id": entity_id,
        "action": action,
        "reviewer": reviewer,
        "message": f"GeoSync topology engine registered a ledger update.\n*Reason:* {reason}"
    }
    try:
        with httpx.Client() as client:
            client.post(webhook_url, json=payload, timeout=5.0)
    except Exception as e:
        print(f"n8n webhook failed: {e}")

@router.post("/entity/{entity_id}/review")
def review_entity(entity_id: int, action: ReviewAction, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    entity = db.query(models.LandEntity).filter(models.LandEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
        
    entity.status = action.action # AUTO_ACCEPT, REJECTED, etc.
    
    # Resolve conflicts
    conflicts = db.query(models.EntityConflict).filter(models.EntityConflict.canonical_entity_id == entity_id).all()
    for conflict in conflicts:
        conflict.status = "RESOLVED_MANUAL"
        
    audit = models.AuditLog(
        entity_id=entity_id,
        action=action.action,
        actor=action.reviewer,
        reason=action.reason,
        details={"confidence": entity.overall_confidence}
    )
    db.add(audit)
    db.commit()
    
    # Fire Telegram webhook silently in the background
    background_tasks.add_task(send_telegram_alert, entity_id, action.action, action.reviewer, action.reason)
    
    return {"message": f"Successfully recorded {action.action} to provenance ledger."}

@router.get("/entity/{entity_id}/history")
def get_entity_history(entity_id: int, db: Session = Depends(get_db)):
    logs = db.query(models.AuditLog).filter(models.AuditLog.entity_id == entity_id).order_by(models.AuditLog.created_at.asc()).all()
    return logs

@router.get("/ledger")
def get_global_ledger(db: Session = Depends(get_db)):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(100).all()
    return logs

@router.post("/entity/{entity_id}/topology")
def correct_topology(entity_id: int, db: Session = Depends(get_db)):
    entity = db.query(models.LandEntity).filter(models.LandEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
        
    # Example logic for repairing geometry of canonical entity based on sources
    # In reality, this would do ST_MakeValid on the union of its sources
    query = text(f"""
        UPDATE land_entities 
        SET geometry = (
            SELECT ST_MakeValid(ST_Union(original_geometry)) 
            FROM source_records 
            WHERE canonical_entity_id = {entity_id}
        )
        WHERE id = {entity_id}
    """)
    db.execute(query)
    
    entity.status = "AUTO_ACCEPT"
    
    audit = models.AuditLog(
        entity_id=entity_id,
        action="TOPOLOGY_MERGED",
        actor="GeoAI_Topology_Engine",
        reason="Automated boundary union applied to resolve geometry conflict",
        details={"match_type": entity.match_type}
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Topology successfully corrected and unified."}
