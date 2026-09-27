from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import models
import google.generativeai as genai
import os
import json
import base64
from PIL import Image
import io

router = APIRouter()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ... [KEEP EXISTING /analyze-fraud ROUTE] ...

@router.post("/vision-analyze/{entity_id}")
async def analyze_property_photo(entity_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    entity = db.query(models.LandEntity).filter(models.LandEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
        
    contents = await file.read()
    
    if not GEMINI_API_KEY:
        return {
            "building_type": "Residential",
            "floor_count": 2,
            "estimated_area": "1200 sqft",
            "discrepancy_found": True,
            "vision_analysis": "API KEY MISSING. Simulated Vision output: Detected a 2-story building which contradicts the cadastral record of 1 floor."
        }
        
    try:
        image = Image.open(io.BytesIO(contents))
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = '''
        You are an AI Property Tax Assessor. Analyze this photo of a property.
        Return ONLY a JSON object with the following keys:
        - "building_type": (e.g., "Commercial", "Residential", "Warehouse")
        - "floor_count": (integer)
        - "estimated_area": (string, e.g. "approx 1500 sqft")
        - "discrepancy_found": (boolean, just guess true or false based on if it looks fully constructed)
        - "vision_analysis": (2 sentences explaining what you see structurally)
        '''
        
        response = model.generate_content([prompt, image])
        
        text = response.text.replace('\\\json', '').replace('\\\', '').strip()
        result = json.loads(text)
        return result
    except Exception as e:
        return {
            "error": str(e),
            "vision_analysis": "Failed to run Vision model. Make sure image is valid."
        }
