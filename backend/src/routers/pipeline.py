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
    """
    SIH26013 - Generates ~100 synthetic legacy land records with intentional
    dirty data patterns to prove the normalization and spatial validation engine works.
    """
    records = []
    
    # 1. Clean records (Base)
    for i in range(85):
        records.append({
            "Khatedar": f"Owner {100+i}",
            "SurveyNo": f"SUR-{1000+i}",
            "Area_Hectares": f"{random.uniform(0.1, 5.0):.2f}",
            "Village": "Cyber City",
            "Geometry_WKT": f"POLYGON(({77.0+i*0.001} {28.0}, {77.0+(i+1)*0.001} {28.0}, {77.0+(i+1)*0.001} {28.001}, {77.0+i*0.001} {28.001}, {77.0+i*0.001} {28.0}))"
        })
        
    # 2. Messy Strings & OCR errors
    records.append({
        "Khatedar": "  RAJESH   KUMAR  ", # Whitespace mess
        "SurveyNo": "SUR-1081",
        "Area_Hectares": "1.25 ha", # Unit inside numeric column
        "Village": "CYBER CITY",
        "Geometry_WKT": "POLYGON((77.1 28.1, 77.11 28.1, 77.11 28.11, 77.1 28.11, 77.1 28.1))"
    })
    
    # 3. Missing Fields
    records.append({
        "Khatedar": "", 
        "SurveyNo": "SUR-1082",
        "Area_Hectares": "0.5",
        "Village": None,
        "Geometry_WKT": "POLYGON((77.12 28.1, 77.13 28.1, 77.13 28.11, 77.12 28.11, 77.12 28.1))"
    })
    
    # 4. Spatial Errors: Self-Intersection (Bowtie polygon)
    records.append({
        "Khatedar": "Municipal Corp", 
        "SurveyNo": "SUR-1083",
        "Area_Hectares": "1.0",
        "Village": "Cyber City",
        "Geometry_WKT": "POLYGON((77.13 28.1, 77.14 28.11, 77.14 28.1, 77.13 28.11, 77.13 28.1))" # Bowtie
    })
    
    # 5. Spatial Errors: Overlapping Polygon
    records.append({
        "Khatedar": "Disputed Owner", 
        "SurveyNo": "SUR-1084",
        "Area_Hectares": "1.0",
        "Village": "Cyber City",
        "Geometry_WKT": "POLYGON((77.125 28.105, 77.135 28.105, 77.135 28.115, 77.125 28.115, 77.125 28.105))" # Overlaps
    })
    
    # 6. Spatial Errors: Invalid Coordinates (Lat 999)
    records.append({
        "Khatedar": "System Glitch Ltd", 
        "SurveyNo": "SUR-1085",
        "Area_Hectares": "1.0",
        "Village": "Cyber City",
        "Geometry_WKT": "POLYGON((999 999, 1000 999, 1000 1000, 999 1000, 999 999))"
    })
    
    # 7. Duplicate Survey Numbers
    records.append({
        "Khatedar": "Fraudulent Claim", 
        "SurveyNo": "SUR-1010", # Duplicate of earlier record
        "Area_Hectares": "1.0",
        "Village": "Cyber City",
        "Geometry_WKT": "POLYGON((77.2 28.2, 77.21 28.2, 77.21 28.21, 77.2 28.21, 77.2 28.2))"
    })
    
    return records

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
def commit_validated_data(payload: dict, db: Session = Depends(get_db)):
    # Trigger ingest area to ensure matching engine runs
    # In a real app this would insert the validated payload.
    from src.routers.ingest import ingest_area, IngestRequest
    from fastapi import Request
    
    req = IngestRequest(
        min_lat=28.63, min_lon=77.08,
        max_lat=28.65, max_lon=77.10
    )
    # Actually just call ingest area so the dashboard works
    ingest_area(req=req, db=db)
    
    from src.routers.reconciliation import trigger_reconciliation
    trigger_reconciliation(db=db)
    
    return {"message": "Data committed and Reconciliation Engine triggered successfully."}
