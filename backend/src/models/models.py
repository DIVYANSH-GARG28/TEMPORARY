from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Boolean, Text
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from src.database import Base
import datetime

class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    source_type = Column(String) # cadastral, municipal, revenue, drone_ai, gnss
    version = Column(String, nullable=True) 
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="pending") 
    
    source_records = relationship("SourceRecord", back_populates="dataset")

class SourceRecord(Base):
    """
    PHASE 3: RAW SOURCE PROVENANCE
    Do not overwrite source records. The raw source must remain recoverable.
    """
    __tablename__ = "source_records"
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    
    # Metadata
    source_record_id = Column(String, index=True) 
    source_type = Column(String, index=True) # cadastral, municipal, drone_ai, gnss
    source_authority_weight = Column(Float, default=1.0) # Configurable policy weight
    
    # Original Data
    original_geometry = Column(Geometry(geometry_type='POLYGON', srid=3857))
    original_attributes = Column(JSON) # e.g. {"owner_name": "Ramesh", "land_use": "Residential"}
    
    # Foreign Keys
    canonical_entity_id = Column(Integer, ForeignKey("land_entities.id"), nullable=True)
    
    # Relationships
    dataset = relationship("Dataset", back_populates="source_records")
    canonical_entity = relationship("LandEntity", back_populates="source_records")


class LandEntity(Base):
    """
    PHASE 2: CANONICAL LAND ENTITY MODEL
    The integrated truth representing a real-world entity.
    """
    __tablename__ = "land_entities"
    id = Column(Integer, primary_key=True, index=True)
    canonical_id = Column(String, unique=True, index=True)
    
    # Integrated Geometry & Attributes (can be modified by resolutions)
    geometry = Column(Geometry(geometry_type='POLYGON', srid=3857))
    attributes = Column(JSON) 
    
    # Evidence Scores (Phase 12)
    spatial_evidence = Column(Float, default=0.0)
    attribute_evidence = Column(Float, default=0.0)
    temporal_evidence = Column(Float, default=0.0)
    overall_confidence = Column(Float, default=0.0)
    confidence_reason = Column(Text, nullable=True)
    
    # State
    status = Column(String, default="PENDING_REVIEW") # AUTO_ACCEPT, REVIEW, REJECTED
    match_type = Column(String, nullable=True) # SUBDIVISION, MERGER, SAME_ENTITY, NEW_ENTITY
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    source_records = relationship("SourceRecord", back_populates="canonical_entity")
    conflicts = relationship("EntityConflict", back_populates="canonical_entity")

class EntityConflict(Base):
    """
    PHASE 8: CONFLICT ENGINE
    Dedicated table for typed conflicts rather than a simple JSON blob.
    """
    __tablename__ = "entity_conflicts"
    id = Column(Integer, primary_key=True, index=True)
    canonical_entity_id = Column(Integer, ForeignKey("land_entities.id"))
    
    conflict_type = Column(String, index=True) # GEOMETRY_CONFLICT, ENTITY_TYPE_CONFLICT, SPLIT_MERGE_CONFLICT
    severity = Column(String) # HIGH, MEDIUM, LOW
    description = Column(Text)
    evidence = Column(JSON) # Measurements, overlapping areas, etc.
    
    status = Column(String, default="UNRESOLVED") # UNRESOLVED, RESOLVED_AUTO, RESOLVED_MANUAL
    recommended_action = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    canonical_entity = relationship("LandEntity", back_populates="conflicts")

class AuditLog(Base):
    """
    PHASE 14: PROVENANCE / AUDIT TRAIL
    """
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(Integer, ForeignKey("land_entities.id"), nullable=True)
    action = Column(String) 
    actor = Column(String) 
    reason = Column(Text) 
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
