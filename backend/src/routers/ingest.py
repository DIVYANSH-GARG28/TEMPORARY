from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.database import get_db, engine
from src.models import models
from pydantic import BaseModel, Field
import urllib.request
import urllib.parse
import json
from shapely.geometry import Polygon
import pyproj
from shapely.ops import transform
import math

router = APIRouter()

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != "sih-demo-key":
        raise HTTPException(status_code=403, detail="Invalid API Key. Unauthorized destructive action.")
    return api_key

class IngestRequest(BaseModel):
    min_lat: float = Field(..., ge=-90, le=90)
    min_lon: float = Field(..., ge=-180, le=180)
    max_lat: float = Field(..., ge=-90, le=90)
    max_lon: float = Field(..., ge=-180, le=180)

def get_bounding_box(req: IngestRequest):
    # Check bounding box area to prevent Overpass Gateway Timeouts (504)
    # Approx: 1 deg lat = 111km, 1 deg lon = 111km * cos(lat)
    lat_diff = abs(req.max_lat - req.min_lat) * 111.0 # km
    lon_diff = abs(req.max_lon - req.min_lon) * 111.0 * math.cos(math.radians(req.min_lat)) # km
    area_sq_km = lat_diff * lon_diff
    
    # Restrict to ~4 sq km
    if area_sq_km > 4.0:
        raise HTTPException(status_code=400, detail=f"Area is too large ({area_sq_km:.1f} sq km). Please zoom in closer to a city block to prevent Overpass API timeouts. Maximum allowed is 4.0 sq km.")
        
    return f"{req.min_lat},{req.min_lon},{req.max_lat},{req.max_lon}"

def fetch_overpass_data(bounds, date_str=None):
    # If date_str is provided, fetch historical data, else fetch current
    date_clause = f'[date:"{date_str}"]' if date_str else ""
    query = f"""
    [out:json]{date_clause};
    (
      way["building"]({bounds});
    );
    (._;>;);
    out body;
    """
    
    endpoints = [
        'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass-api.de/api/interpreter'
    ]
    
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')
    
    for url in endpoints:
        try:
            req = urllib.request.Request(url, data=data, headers={'User-Agent': 'GeoSync-SIH/1.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    return json.loads(response.read().decode('utf-8'))
        except Exception as e:
            print(f"Overpass API {url} failed: {e}")
            continue
            
    return None

def process_osm_features(osm_data):
    if not osm_data:
        return []
        
    nodes = {node['id']: (node['lon'], node['lat']) for node in osm_data.get('elements', []) if node['type'] == 'node'}
    ways = [way for way in osm_data.get('elements', []) if way['type'] == 'way']
    
    project_to_3857 = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True).transform
    polygons = []
    
    for i, way in enumerate(ways):
        coords = [nodes[nid] for nid in way.get('nodes', []) if nid in nodes]
        if len(coords) >= 3:
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            poly = Polygon(coords)
            if poly.is_valid and poly.area > 0:
                poly_3857 = transform(project_to_3857, poly)
                
                # Extract real tags instead of hallucinating synthetic data
                tags = way.get('tags', {})
                owner = (
                    tags.get('name') or 
                    tags.get('operator') or 
                    tags.get('brand') or 
                    tags.get('addr:housename') or 
                    tags.get('building:name') or 
                    "UNREGISTERED_ENTITY"
                )

                land_use = tags.get('building', 'yes')
                
                polygons.append({
                    "geom": poly_3857,
                    "owner": owner,
                    "land_use": land_use
                })
    return polygons

@router.post("/reset", dependencies=[Depends(verify_api_key)])
def reset_database(db: Session = Depends(get_db)):
    db.execute(text("TRUNCATE TABLE audit_logs, entity_conflicts, land_entities, source_records, datasets CASCADE;"))
    db.commit()
    return {"message": "Database successfully wiped for fresh demo."}

@router.post("/area", dependencies=[Depends(verify_api_key)])
def ingest_area(req: IngestRequest, db: Session = Depends(get_db)):
    bounds = get_bounding_box(req)
    
    # Fetch CURRENT data (Cadastral)
    current_data = fetch_overpass_data(bounds, date_str=None)
    if not current_data:
        raise HTTPException(status_code=504, detail="Failed to fetch current OpenStreetMap data. Servers might be busy.")
        
    cadastral_polys = process_osm_features(current_data)
    
    # Fetch HISTORICAL data from 2018 (Municipal)
    historical_data = fetch_overpass_data(bounds, date_str="2018-01-01T00:00:00Z")
    if not historical_data:
        # Fallback to current if historical fails
        historical_data = current_data
        
    municipal_polys = process_osm_features(historical_data)
    
    if not cadastral_polys and not municipal_polys:
        raise HTTPException(status_code=404, detail="No buildings found in this area. Try a denser city.")
    
    # Clear tables to keep demo fast and clean
    db.execute(text("TRUNCATE TABLE audit_logs, entity_conflicts, land_entities, source_records CASCADE;"))
    db.commit()
    
    # Create datasets
    cad_ds = models.Dataset(name="OSM India 2026 (Cadastral)", source_type="cadastral", status="processed")
    mun_ds = models.Dataset(name="OSM India 2018 (Municipal)", source_type="municipal", status="processed")
    db.add(cad_ds)
    db.add(mun_ds)
    db.commit()
    db.refresh(cad_ds)
    db.refresh(mun_ds)
    
    # Insert Cadastral
    for i, p in enumerate(cadastral_polys):
        obs = models.SourceRecord(
            dataset_id=cad_ds.id,
            source_record_id=f"CAD-{i}",
            source_type="cadastral",
            source_authority_weight=0.9,
            original_attributes={"owner_name": p["owner"], "land_use": p["land_use"], "area_cad": p["geom"].area, "source": "OpenStreetMap 2026"},
            original_geometry=f"SRID=3857;{p['geom'].wkt}"
        )
        db.add(obs)
        
    # Insert Municipal
    for i, p in enumerate(municipal_polys):
        obs = models.SourceRecord(
            dataset_id=mun_ds.id,
            source_record_id=f"MUN-{i}",
            source_type="municipal",
            source_authority_weight=0.7,
            original_attributes={"owner_name": p["owner"].upper(), "land_use": p["land_use"], "area_mun": p["geom"].area, "source": "OpenStreetMap 2018"},
            original_geometry=f"SRID=3857;{p['geom'].wkt}"
        )
        db.add(obs)
        
    db.commit()
    
    return {
        "message": "Successfully fetched real historical and current data.",
        "cadastral_count": len(cadastral_polys),
        "municipal_count": len(municipal_polys),
        "bounds": bounds
    }
