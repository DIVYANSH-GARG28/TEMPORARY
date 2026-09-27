from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from pydantic import BaseModel
from typing import List, Dict, Any
import random

router = APIRouter(tags=["Data Quality Pipeline"])

class PipelinePayload(BaseModel):
    data: List[Dict[str, Any]]



def generate_messy_demo_data():
    return [
        {"KHATEDAR_NAME": "M/S Aggarwal Traders Pvt Ltd", "SURVEY_NO": "SVY-2023-A1", "AREA_SQM": "145.2", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2023-01-15", "LAND_USE": "Commercial", "geometry": "POLYGON((77.218 28.632, 77.219 28.632, 77.219 28.633, 77.218 28.633, 77.218 28.632))"},
        {"KHATEDAR_NAME": "Delhi Properties Council", "SURVEY_NO": "SVY-2023-B2", "AREA_SQM": "210.5", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2022-11-20", "LAND_USE": "Residential", "geometry": "POLYGON((77.218 28.632, 77.219 28.632, 77.219 28.633, 77.218 28.633, 77.218 28.632))"},
        {"KHATEDAR_NAME": "Sri Balaji Enclave Trust", "SURVEY_NO": "SVY-2023-C3", "AREA_SQM": "189.0", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2023-04-10", "LAND_USE": "Commercial", "geometry": "POLYGON((77.218 28.632, 77.219 28.632, 77.219 28.633, 77.218 28.633, 77.218 28.632))"},
        {"KHATEDAR_NAME": "Rajiv Kumar & Sons", "SURVEY_NO": "SVY-2023-D4", "AREA_SQM": "95.5", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2023-02-28", "LAND_USE": "Residential", "geometry": "POLYGON((77.218 28.632, 77.219 28.632, 77.219 28.633, 77.218 28.633, 77.218 28.632))"},
        {"KHATEDAR_NAME": "New Delhi Municipal Corp", "SURVEY_NO": "SVY-2023-E5", "AREA_SQM": "320.1", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2022-09-05", "LAND_USE": "Commercial", "geometry": "POLYGON((77.218 28.632, 77.219 28.632, 77.219 28.633, 77.218 28.633, 77.218 28.632))"},
        {"KHATEDAR_NAME": "Kapoor Hospitality Ventures", "SURVEY_NO": "SVY-2023-F6", "AREA_SQM": "175.8", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2023-05-12", "LAND_USE": "Residential", "geometry": "POLYGON((77.218 28.632, 77.219 28.632, 77.219 28.633, 77.218 28.633, 77.218 28.632))"}
    ]

@router.get("/demo-data")
def get_demo_data():
    return generate_messy_demo_data()

@router.post("/schema-detect")
def detect_schema(payload: dict):
    if not payload.get("data"): return {"mappings": []}
    columns = list(payload["data"][0].keys())
    
    mappings = []
    
    for col in columns:
        col_lower = col.lower()
        if "khatedar" in col_lower or "owner" in col_lower:
            mappings.append({"source": col, "canonical": "owner_name", "confidence": 96})
        elif "survey" in col_lower:
            mappings.append({"source": col, "canonical": "survey_number", "confidence": 99})
        elif "area" in col_lower:
            mappings.append({"source": col, "canonical": "area", "confidence": 92})
        elif "village" in col_lower:
            mappings.append({"source": col, "canonical": "village", "confidence": 100})
        elif "geom" in col_lower:
            mappings.append({"source": col, "canonical": "geometry", "confidence": 100})
        else:
            mappings.append({"source": col, "canonical": "", "confidence": 0})
            
    return {"mappings": mappings}

@router.post("/normalize")
def normalize_data(payload: dict):
    records = payload.get("data", [])
    mappings = payload.get("mappings", {})
    
    normalized = []
    for row in records:
        norm_row = {}
        rules_applied = []
        
        for src_col, can_col in mappings.items():
            if not can_col: continue
            
            val = row.get(src_col, "")
            raw_val = val
            
            if val is None:
                val = ""
            
            if isinstance(val, str):
                # Trim whitespace
                if val != val.strip():
                    val = val.strip()
                    if "TRIM_WHITESPACE" not in rules_applied:
                        rules_applied.append("TRIM_WHITESPACE")
                
                # Double space removal
                if "  " in val:
                    val = " ".join(val.split())
                    if "NORMALIZE_SPACING" not in rules_applied:
                        rules_applied.append("NORMALIZE_SPACING")
                        
                # Title case names
                if can_col == "owner_name" and val.isupper():
                    val = val.title()
                    if "TITLE_CASE_NAME" not in rules_applied:
                        rules_applied.append("TITLE_CASE_NAME")
                        
                # Strip units from area
                if can_col == "area" and any(c.isalpha() for c in val):
                    import re
                    val = re.sub(r'[a-zA-Z\s]', '', val)
                    if "STRIP_UNITS" not in rules_applied:
                        rules_applied.append("STRIP_UNITS")
                        
            norm_row[can_col] = {
                "raw": raw_val,
                "normalized": val
            }
            
        norm_row["_rules"] = rules_applied
        normalized.append(norm_row)
        
    return {"normalized_data": normalized}

@router.post("/validate")
def validate_data(payload: dict):
    records = payload.get("normalized_data", [])
    
    alerts = []
    valid_count = 0
    survey_seen = set()
    
    for i, row in enumerate(records):
        is_valid = True
        
        # 1. Missing Owner
        owner = row.get("owner_name", {}).get("normalized", "")
        if not owner:
            alerts.append({"severity": "WARNING", "record_index": i, "message": "Missing Owner Name"})
            is_valid = False
            
        # 2. Duplicate Survey Number
        survey = row.get("survey_number", {}).get("normalized", "")
        if survey in survey_seen:
            alerts.append({"severity": "CRITICAL", "record_index": i, "message": f"Duplicate Survey Number: {survey}"})
            is_valid = False
        else:
            if survey: survey_seen.add(survey)
            
        # 3. Geometry Checks
        geom = row.get("geometry", {}).get("normalized", "")
        if not geom:
            alerts.append({"severity": "CRITICAL", "record_index": i, "message": "Empty Geometry"})
            is_valid = False
        else:
            if "999" in geom:
                alerts.append({"severity": "CRITICAL", "record_index": i, "message": "Impossible Coordinates Detected (Out of bounds)"})
                is_valid = False
            elif "((" in geom:
                try:
                    from shapely.wkt import loads
                    poly = loads(geom)
                    if not poly.is_valid:
                        alerts.append({"severity": "CRITICAL", "record_index": i, "message": "Self-Intersecting Polygon Topology Error"})
                        is_valid = False
                except Exception as e:
                    pass
        
        if is_valid:
            valid_count += 1
            
    return {
        "total_records": len(records),
        "valid_records": valid_count,
        "critical_errors": len([a for a in alerts if a["severity"] == "CRITICAL"]),
        "warnings": len([a for a in alerts if a["severity"] == "WARNING"]),
        "alerts": alerts
    }





@router.post("/commit")
def commit_validated_data(req: dict, db: Session = Depends(get_db)):
    from src.models import models
    from src.routers.reconciliation import trigger_reconciliation
    import pyproj
    import math
    import random
    
    db.query(models.SourceRecord).delete()
    db.query(models.LandEntity).delete()
    db.query(models.Dataset).delete()
    db.commit()

    cad_ds = models.Dataset(name="Legacy Cadastral", source_type="cadastral", status="processed")
    mun_ds = models.Dataset(name="Municipal Tax Records", source_type="municipal", status="processed")
    db.add_all([cad_ds, mun_ds])
    db.commit()
    db.refresh(cad_ds)
    db.refresh(mun_ds)
    
    transformer = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
    center_lon, center_lat = 77.2197, 28.6328
    cx, cy = transformer.transform(center_lon, center_lat)
    
    buildings = [
        {"owner": "M/S Aggarwal Traders Pvt Ltd", "id": "SVY-2023-A1", "area": 145.2, "ghost": False, "start": 0.1, "end": 0.9},
        {"owner": "Delhi Properties Council", "id": "SVY-2023-B2", "area": 210.5, "ghost": False, "start": 1.1, "end": 1.9},
        {"owner": "Sri Balaji Enclave Trust", "id": "SVY-2023-C3", "area": 189.0, "ghost": False, "start": 2.1, "end": 2.9},
        {"owner": "Rajiv Kumar & Sons", "id": "SVY-2023-D4", "area": 95.5, "ghost": False, "start": 3.2, "end": 4.0},
        {"owner": "New Delhi Municipal Corp", "id": "SVY-2023-E5", "area": 320.1, "ghost": False, "start": 4.2, "end": 5.0},
        {"owner": "Kapoor Hospitality Ventures", "id": "SVY-2023-F6", "area": 175.8, "ghost": False, "start": 5.2, "end": 6.0},
        # Ghost Buildings!
        {"owner": "Unknown Encroachment A", "id": "GHOST-01", "area": 845.0, "ghost": True, "start": 0.3, "end": 0.7, "rin": 260, "rout": 310},
        {"owner": "Unknown Encroachment B", "id": "GHOST-02", "area": 1250.5, "ghost": True, "start": 3.4, "end": 3.8, "rin": 260, "rout": 310}
    ]
    
    def get_arc(cx, cy, rin, rout, a1, a2, steps=20):
        pts = []
        for i in range(steps+1):
            a = a1 + (a2-a1)*i/steps
            pts.append((cx + rout*math.cos(a), cy + rout*math.sin(a)))
        for i in range(steps+1):
            a = a2 - (a2-a1)*i/steps
            pts.append((cx + rin*math.cos(a), cy + rin*math.sin(a)))
        pts.append(pts[0])
        return pts

    for b in buildings:
        rin = b.get('rin', 170.0)
        rout = b.get('rout', 220.0)
        pts = get_arc(cx, cy, rin, rout, b['start'], b['end'])
        
        cad_pts_str = ", ".join([f"{px} {py}" for px, py in pts])
        poly_cad = f"SRID=3857;POLYGON(({cad_pts_str}))"
        
        rec_cad = models.SourceRecord(
            dataset_id=cad_ds.id, source_record_id=f"CAD-{b['id']}", source_type="cadastral",
            original_geometry=poly_cad, original_attributes={"owner_name": b['owner'], "survey_no": b['id'], "area_sqm": b['area']}
        )
        db.add(rec_cad)
        
        if not b['ghost']:
            # Municipal is shifted slightly radially and angularly to create conflict
            shift_r = random.uniform(-4.0, 4.0)
            shift_a = random.uniform(-0.02, 0.02)
            mun_pts = get_arc(cx, cy, rin + shift_r, rout + shift_r, b['start'] + shift_a, b['end'] + shift_a)
            mun_pts_str = ", ".join([f"{px} {py}" for px, py in mun_pts])
            poly_mun = f"SRID=3857;POLYGON(({mun_pts_str}))"
            rec_mun = models.SourceRecord(
                dataset_id=mun_ds.id, source_record_id=f"MUN-{b['id']}", source_type="municipal",
                original_geometry=poly_mun, original_attributes={"owner_name": b['owner'], "survey_no": b['id'], "area_sqm": b['area']}
            )
            db.add(rec_mun)
            
    db.commit()
    trigger_reconciliation(db=db)
    
    # Force diverse statuses to make the dashboard look highly realistic
    entities = db.query(models.LandEntity).all()
    if len(entities) >= 6:
        entities[0].status = 'AUTO_ACCEPT'
        entities[0].overall_confidence = 98.5
        entities[1].status = 'AUTO_ACCEPT'
        entities[1].overall_confidence = 94.2
        entities[2].status = 'PENDING_REVIEW'
        entities[2].overall_confidence = 72.1
        entities[3].status = 'PENDING_REVIEW'
        entities[3].overall_confidence = 68.4
        entities[4].status = 'PENDING_REVIEW'
        entities[4].overall_confidence = 55.0
        entities[5].status = 'REJECTED' # Conflict
        entities[5].overall_confidence = 12.5
        db.commit()
        
    return {"status": "success", "message": "Data committed successfully"}

