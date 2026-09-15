from pydantic import BaseModel, Field, field_validator, ValidationInfo
from typing import List, Tuple
from app.core.config import settings

class GNSSObservation(BaseModel):
    latitude: float
    longitude: float
    fix_quality: int = Field(description="NMEA GPS Fix Quality. 4 = RTK Fixed")
    pdop: float = Field(description="Positional Dilution of Precision")
    
    @field_validator('latitude')
    def validate_indian_latitude(cls, v):
        if not (6.0 <= v <= 38.0):
            raise ValueError("Latitude out of bounds for Indian subcontinent")
        return v
        
    @field_validator('longitude')
    def validate_indian_longitude(cls, v):
        if not (68.0 <= v <= 98.0):
            raise ValueError("Longitude out of bounds for Indian subcontinent")
        return v
        
    @field_validator("fix_quality")
    @classmethod
    def check_fix_quality(cls, v, info: ValidationInfo):
        if v not in [1, 2, 4, 5]:
            raise ValueError("Invalid GPS fix quality. Must be 1 (GPS), 2 (DGPS), 4 (RTK Fix), or 5 (RTK Float).")
        return v
        
    @property
    def uncertainty_radius(self) -> float:
        mapping = {
            4: 0.02,
            5: 0.5,
            2: 1.5,
            1: 5.0
        }
        return mapping.get(self.fix_quality, 10.0)
        
    @field_validator('pdop')
    def require_high_accuracy(cls, v):
        if v > 2.0:
            # We don't raise value error anymore, just return. We handle probabilistic in engine.
            pass
        return v

class GeoJSONPolygon(BaseModel):
    type: str
    coordinates: List[List[Tuple[float, float]]]
    
    @field_validator('type')
    def validate_type(cls, v):
        if v != "Polygon":
            raise ValueError("Only Polygon geometries are supported")
        return v
        
    @field_validator('coordinates')
    def validate_vertices_limit(cls, v):
        total_vertices = sum(len(ring) for ring in v)
        if total_vertices > 5000:
            raise ValueError(f"Geometry rejected. Vertex count {total_vertices} exceeds 5000 limit (Buffer overflow protection).")
        return v

class SimulationRequest(BaseModel):
    khasra_id: str
    strategy: str
    dx: float = 0.0
    dy: float = 0.0

class SimulationResponse(BaseModel):
    status: str
    metrics: dict
    
class CommitRequest(BaseModel):
    khasra_id: str
    session_id: str
    strategy: str
    dx: float
    dy: float
