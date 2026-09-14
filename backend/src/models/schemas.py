from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# =======================
# Datasets
# =======================
class DatasetBase(BaseModel):
    name: str
    source_type: str
    version: Optional[str] = None

class DatasetCreate(DatasetBase):
    pass

class DatasetResponse(DatasetBase):
    id: int
    uploaded_at: datetime
    status: str

    class Config:
        from_attributes = True

# =======================
# Source Records
# =======================
class SourceRecordResponse(BaseModel):
    id: int
    dataset_id: int
    source_record_id: str
    source_type: str
    source_authority_weight: float
    original_attributes: Dict[str, Any]
    canonical_entity_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# =======================
# Conflicts
# =======================
class EntityConflictResponse(BaseModel):
    id: int
    canonical_entity_id: int
    conflict_type: str
    severity: str
    description: str
    evidence: Dict[str, Any]
    status: str
    recommended_action: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# =======================
# Canonical Entities
# =======================
class LandEntityResponse(BaseModel):
    id: int
    canonical_id: str
    attributes: Dict[str, Any]
    
    spatial_evidence: float
    attribute_evidence: float
    temporal_evidence: float
    overall_confidence: float
    confidence_reason: Optional[str] = None
    
    status: str
    match_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    source_records: List[SourceRecordResponse] = []
    conflicts: List[EntityConflictResponse] = []
    
    class Config:
        from_attributes = True

# =======================
# GeoJSON Input Parsing
# =======================
class GeoJSONFeatureProperties(BaseModel):
    source_id: str = Field(alias="gt_id", default="UNKNOWN")
    owner_name: Optional[str] = Field(alias="owner", default=None)
    land_use: Optional[str] = Field(alias="land_use", default=None)
    recorded_area: Optional[float] = Field(alias="area", default=None)

    class Config:
        populate_by_name = True
        extra = "allow"
