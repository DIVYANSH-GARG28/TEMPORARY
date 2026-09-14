from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import models, schemas
import datetime

router = APIRouter()

@router.get("/queue", response_model=list[schemas.EntityConflictResponse])
def get_review_queue(db: Session = Depends(get_db)):
    # The review queue is now driven by EntityConflicts that are UNRESOLVED
    return db.query(models.EntityConflict).filter(models.EntityConflict.status == "UNRESOLVED").all()

@router.post("/{conflict_id}/resolve", response_model=schemas.EntityConflictResponse)
def resolve_conflict(conflict_id: int, action: str, notes: str = "", db: Session = Depends(get_db)):
    if action not in ["RESOLVED_AUTO", "RESOLVED_MANUAL"]:
        raise HTTPException(status_code=400, detail="Action must be 'RESOLVED_AUTO' or 'RESOLVED_MANUAL'")
        
    conflict = db.query(models.EntityConflict).filter(models.EntityConflict.id == conflict_id).first()
    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict not found")
        
    conflict.status = action
    
    # Check if all conflicts for the canonical entity are resolved
    entity = db.query(models.LandEntity).filter(models.LandEntity.id == conflict.canonical_entity_id).first()
    if entity:
        unresolved = db.query(models.EntityConflict).filter(
            models.EntityConflict.canonical_entity_id == entity.id,
            models.EntityConflict.status == "UNRESOLVED"
        ).count()
        
        if unresolved == 0:
            entity.status = "AUTO_ACCEPT" if action == "RESOLVED_AUTO" else "MANUAL_REVIEWED"
            
    db.commit()
    db.refresh(conflict)
    return conflict
