from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import models, schemas
import json
from shapely.geometry import shape
from src.services.topology import TopologyQAEngine

router = APIRouter()

@router.post("/", response_model=schemas.DatasetResponse)
async def upload_dataset(
    name: str = Form(...),
    source_type: str = Form(...), # cadastral, municipal, revenue
    version: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    dataset = models.Dataset(name=name, source_type=source_type, version=version)
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    
    contents = await file.read()
    if file.filename.endswith('.geojson'):
        try:
            data = json.loads(contents)
            features = data.get("features", [])
            
            for feat in features:
                raw_props = feat.get("properties", {})
                geom = shape(feat["geometry"])
                
                # Topology QA
                is_valid, explanation, safe_geom = TopologyQAEngine.validate_geometry(geom)
                if not is_valid and safe_geom.geom_type not in ['Polygon', 'MultiPolygon']:
                    # Log invalid geometry and skip or handle
                    print(f"Skipping invalid geometry: {explanation}")
                    continue
                
                # Fallback extraction logic for common fields
                source_id = str(raw_props.get("gt_id") or raw_props.get("cadastral_id") or raw_props.get("prop_id") or "UNKNOWN")
                
                # Determine policy weight based on source_type
                weight = 0.7
                if source_type == 'gnss': weight = 1.0
                elif source_type == 'cadastral': weight = 0.9
                elif source_type == 'revenue': weight = 0.8
                elif source_type == 'municipal': weight = 0.7
                elif source_type == 'drone_ai': weight = 0.6
                
                obs = models.SourceRecord(
                    dataset_id=dataset.id,
                    source_record_id=source_id,
                    source_type=source_type,
                    source_authority_weight=weight,
                    original_attributes=raw_props, # Save the original JSON properties
                    original_geometry=f"SRID=3857;{safe_geom.wkt}" # Format for GeoAlchemy2 using safe_geom
                )
                db.add(obs)
            db.commit()
            
            dataset.status = "processed"
            db.commit()
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Error parsing GeoJSON: {str(e)}")
    
    return dataset

@router.get("/", response_model=list[schemas.DatasetResponse])
def list_datasets(db: Session = Depends(get_db)):
    return db.query(models.Dataset).all()

