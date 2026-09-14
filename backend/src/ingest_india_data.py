import urllib.request
import urllib.parse
import json
import random
from sqlalchemy.orm import Session
from src.database import engine, Base
from src.models import models
from shapely.geometry import Polygon
from shapely.affinity import translate, rotate
import pyproj
from shapely.ops import transform

def generate_random_name():
    first_names = ["Rajesh", "Amit", "Priya", "Sneha", "Vikram", "Neha", "Rahul", "Anjali"]
    last_names = ["Sharma", "Singh", "Patel", "Kumar", "Gupta", "Das", "Verma"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"

# Connaught Place bounding box - small enough to not timeout, large enough for ~50 buildings
BOUNDS = "28.630, 77.215, 28.634, 77.220"

query = f"""
[out:json];
(
  way["building"]({BOUNDS});
);
(._;>;);
out body;
"""

endpoints = [
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/cgi/interpreter',
    'https://overpass-api.de/api/interpreter'
]

data = urllib.parse.urlencode({'data': query}).encode('utf-8')

def fetch_data():
    for url in endpoints:
        print(f"Trying {url}...")
        req = urllib.request.Request(url, data=data, headers={'User-Agent': 'GeoSync-SIH/1.0'})
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                if response.status == 200:
                    result = json.loads(response.read().decode('utf-8'))
                    print("Success!")
                    return result
        except Exception as e:
            print('Error:', str(e))
    return None

def perturb_geometry(poly, translation_std=0.00005, rotation_std=1.0, vertex_noise_std=0.00001):
    dx = random.gauss(0, translation_std)
    dy = random.gauss(0, translation_std)
    poly = translate(poly, xoff=dx, yoff=dy)
    angle = random.gauss(0, rotation_std)
    poly = rotate(poly, angle, origin='centroid')
    coords = list(poly.exterior.coords)
    new_coords = []
    for idx, (x, y) in enumerate(coords):
        if idx == len(coords) - 1:
            new_coords.append(new_coords[0])
            continue
        nx = x + random.gauss(0, vertex_noise_std)
        ny = y + random.gauss(0, vertex_noise_std)
        new_coords.append((nx, ny))
    try:
        new_poly = Polygon(new_coords)
        if not new_poly.is_valid:
            new_poly = new_poly.buffer(0)
        
        if new_poly.geom_type == 'MultiPolygon':
            # Extract the largest polygon if it split
            new_poly = max(new_poly.geoms, key=lambda p: p.area)
        
        return new_poly if new_poly.geom_type == 'Polygon' else poly
    except:
        return poly

def ingest_data():
    osm_data = fetch_data()
    if not osm_data:
        print("Failed to fetch data.")
        return

    nodes = {node['id']: (node['lon'], node['lat']) for node in osm_data.get('elements', []) if node['type'] == 'node'}
    ways = [way for way in osm_data.get('elements', []) if way['type'] == 'way']
    
    print("Clearing old data from database...")
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        # Clear existing tables (cascade will fail if we just delete, but we can delete in order)
        db.query(models.AuditLog).delete()
        db.query(models.ReviewTask).delete()
        db.query(models.MatchResult).delete()
        db.query(models.ParcelObservation).delete()
        db.query(models.Dataset).delete()
        db.commit()

        # Create new datasets
        cad_ds = models.Dataset(name="Real Cadastral India", source_type="cadastral", status="processed")
        mun_ds = models.Dataset(name="Real Municipal India", source_type="municipal", status="processed")
        db.add(cad_ds)
        db.add(mun_ds)
        db.commit()
        db.refresh(cad_ds)
        db.refresh(mun_ds)

        project_to_3857 = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True).transform
        count = 0
        for i, way in enumerate(ways):
            coords = [nodes[nid] for nid in way['nodes'] if nid in nodes]
            if len(coords) >= 3:
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                poly = Polygon(coords)
                if poly.is_valid and poly.area > 0:
                    owner = generate_random_name()
                    land_use = random.choice(['Commercial', 'Government', 'Retail', 'Mixed Use', 'Office'])
                    
                    # Create Cadastral Observation (Ground Truth with tiny jitter)
                    cad_poly = perturb_geometry(poly, translation_std=0.00001, vertex_noise_std=0.000005)
                    cad_poly_3857 = transform(project_to_3857, cad_poly)
                    cad_obs = models.ParcelObservation(
                        dataset_id=cad_ds.id,
                        source_id=f"CAD-{i}",
                        owner_name=owner,
                        land_use=land_use,
                        recorded_area=cad_poly_3857.area,
                        attributes={"source": "cadastral"},
                        geom=f"SRID=3857;{cad_poly_3857.wkt}"
                    )
                    db.add(cad_obs)
                    
                    # Create Municipal Observation (with higher error to trigger reconciliation matches)
                    mun_poly = perturb_geometry(poly, translation_std=0.0002, vertex_noise_std=0.00005)
                    mun_poly_3857 = transform(project_to_3857, mun_poly)
                    mun_obs = models.ParcelObservation(
                        dataset_id=mun_ds.id,
                        source_id=f"MUN-{i}",
                        owner_name=owner.upper() if random.random() > 0.5 else owner,
                        land_use=land_use,
                        recorded_area=mun_poly_3857.area,
                        attributes={"source": "municipal"},
                        geom=f"SRID=3857;{mun_poly_3857.wkt}"
                    )
                    db.add(mun_obs)
                    count += 1

        db.commit()
        print(f"Successfully ingested {count} REAL building pairs into the database!")

if __name__ == "__main__":
    ingest_data()
