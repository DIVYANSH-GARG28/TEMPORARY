import os
import json
import random
import urllib.request
import urllib.parse
import geopandas as gpd
from shapely.geometry import Polygon
from shapely.affinity import translate, rotate
from faker import Faker

fake = Faker('en_IN')

# Connaught Place bounding box
BOUNDS = "28.625, 77.21, 28.635, 77.225"

query = f"""
[out:json];
(
  way["building"]({BOUNDS});
);
(._;>;);
out body;
"""

def fetch_osm_data():
    print("Fetching real building footprints for Connaught Place, New Delhi...")
    url = 'https://overpass-api.de/api/interpreter'
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'User-Agent': 'GeoSync-SIH/1.0'})

    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                return data
            else:
                print('Failed:', response.status)
                return None
    except Exception as e:
        print('Error:', str(e))
        return None

def build_polygons(osm_data):
    nodes = {node['id']: (node['lon'], node['lat']) for node in osm_data.get('elements', []) if node['type'] == 'node'}
    ways = [way for way in osm_data.get('elements', []) if way['type'] == 'way']
    
    parcels = []
    for i, way in enumerate(ways):
        try:
            coords = [nodes[nid] for nid in way['nodes'] if nid in nodes]
            if len(coords) >= 3:
                # Ensure closed polygon
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                poly = Polygon(coords)
                if poly.is_valid and poly.area > 0:
                    parcel = {
                        'gt_id': f"GT-{i}",
                        'owner': fake.name(),
                        'land_use': random.choice(['Commercial', 'Government', 'Retail', 'Mixed Use', 'Office']),
                        'geometry': poly,
                        'true_area': poly.area
                    }
                    parcels.append(parcel)
        except Exception as e:
            continue
    print(f"Constructed {len(parcels)} valid building polygons.")
    return gpd.GeoDataFrame(parcels, crs="EPSG:4326")

def perturb_geometry(poly, translation_std=0.00005, rotation_std=1.0, vertex_noise_std=0.00001):
    # translate
    dx = random.gauss(0, translation_std)
    dy = random.gauss(0, translation_std)
    poly = translate(poly, xoff=dx, yoff=dy)
    
    # rotate
    angle = random.gauss(0, rotation_std)
    poly = rotate(poly, angle, origin='centroid')
    
    # vertex noise
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
        return new_poly
    except:
        return poly

def perturb_string(s, prob=0.1):
    if not isinstance(s, str):
        return s
    if random.random() > prob:
        return s
    options = [
        lambda x: x.upper(),
        lambda x: x.lower(),
        lambda x: x.replace('a', 'e').replace('A', 'E'),
        lambda x: x.split(' ')[0]
    ]
    return random.choice(options)(s)

def create_cadastral(gt_gdf):
    df = gt_gdf.copy()
    # Cadastral is ground truth with slight jitter (high accuracy)
    df['geometry'] = df['geometry'].apply(lambda p: perturb_geometry(p, translation_std=0.00001, vertex_noise_std=0.000005))
    df['cadastral_id'] = df['gt_id'].apply(lambda x: x.replace('GT-', 'CAD-'))
    df['area_cad'] = df['geometry'].area
    return df[['cadastral_id', 'geometry', 'area_cad', 'gt_id']]

def create_municipal(gt_gdf):
    df = gt_gdf.copy()
    # Municipal has worse geometry to trigger engine reconciliation (lower accuracy)
    df['geometry'] = df['geometry'].apply(lambda p: perturb_geometry(p, translation_std=0.0002, vertex_noise_std=0.00005))
    df['prop_id'] = df['gt_id'].apply(lambda x: x.replace('GT-', 'MUN-'))
    df['owner_name'] = df['owner'].apply(lambda x: perturb_string(x, 0.3))
    df['land_use_type'] = df['land_use'].apply(lambda x: perturb_string(x, 0.2))
    df['area_mun'] = df['geometry'].area
    return df[['prop_id', 'owner_name', 'land_use_type', 'geometry', 'area_mun', 'gt_id']]

def main():
    os.makedirs('data', exist_ok=True)
    osm_data = fetch_osm_data()
    if osm_data:
        gt = build_polygons(osm_data)
        if len(gt) > 0:
            print("Generating Cadastral dataset...")
            cadastral = create_cadastral(gt)
            cadastral.to_file('data/cadastral.geojson', driver='GeoJSON')
            
            print("Generating Municipal dataset...")
            municipal = create_municipal(gt)
            municipal.to_file('data/municipal.geojson', driver='GeoJSON')
            
            print("India datasets successfully generated in 'data/' folder!")
        else:
            print("No valid polygons could be constructed.")

if __name__ == "__main__":
    main()
