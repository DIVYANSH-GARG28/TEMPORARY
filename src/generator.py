import os
import random
import geopandas as gpd
import pandas as pd
from shapely.geometry import Polygon
from shapely.affinity import translate, rotate
from faker import Faker

fake = Faker('en_IN') # Using Indian names for realism

def generate_grid_parcels(rows=10, cols=10, size=20.0):
    parcels = []
    for i in range(rows):
        for j in range(cols):
            # Create a 20x20 polygon
            minx = j * size
            miny = i * size
            maxx = minx + size
            maxy = miny + size
            poly = Polygon([(minx, miny), (maxx, miny), (maxx, maxy), (minx, maxy)])
            
            parcel = {
                'gt_id': f"GT-{i}-{j}",
                'owner': fake.name(),
                'land_use': random.choice(['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Vacant']),
                'geometry': poly,
                'true_area': poly.area
            }
            parcels.append(parcel)
    return gpd.GeoDataFrame(parcels, crs="EPSG:3857")

def perturb_geometry(poly, translation_std=0.5, rotation_std=2.0, vertex_noise_std=0.2):
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
        if idx == len(coords) - 1: # Close the polygon
            new_coords.append(new_coords[0])
            continue
        nx = x + random.gauss(0, vertex_noise_std)
        ny = y + random.gauss(0, vertex_noise_std)
        new_coords.append((nx, ny))
    
    try:
        new_poly = Polygon(new_coords)
        if not new_poly.is_valid:
            new_poly = new_poly.buffer(0) # Attempt to fix
        return new_poly
    except:
        return poly # Fallback

def perturb_string(s, prob=0.1):
    if not isinstance(s, str):
        return s
    if random.random() > prob:
        return s
    
    # Simple perturbations
    options = [
        lambda x: x.upper(),
        lambda x: x.lower(),
        lambda x: x.replace('a', 'e').replace('A', 'E'),
        lambda x: x.split(' ')[0] # just first name
    ]
    return random.choice(options)(s)

def create_cadastral(gt_gdf):
    df = gt_gdf.copy()
    # Cadastral might have high spatial accuracy but sparse attributes
    df['geometry'] = df['geometry'].apply(lambda p: perturb_geometry(p, translation_std=0.2, vertex_noise_std=0.1))
    df['cadastral_id'] = df['gt_id'].apply(lambda x: x.replace('GT-', 'CAD-'))
    df['area_cad'] = df['geometry'].area
    return df[['cadastral_id', 'geometry', 'area_cad', 'gt_id']]

def create_municipal(gt_gdf):
    df = gt_gdf.copy()
    # Municipal might have slightly worse geometry but rich attributes with typos
    df['geometry'] = df['geometry'].apply(lambda p: perturb_geometry(p, translation_std=1.0, vertex_noise_std=0.5))
    df['prop_id'] = df['gt_id'].apply(lambda x: x.replace('GT-', 'MUN-'))
    df['owner_name'] = df['owner'].apply(lambda x: perturb_string(x, 0.3))
    df['land_use_type'] = df['land_use'].apply(lambda x: perturb_string(x, 0.2))
    df['area_mun'] = df['geometry'].area
    return df[['prop_id', 'owner_name', 'land_use_type', 'geometry', 'area_mun', 'gt_id']]

def create_revenue(gt_gdf):
    df = gt_gdf.copy()
    # Revenue is usually non-spatial tabular data
    df['khasra_no'] = df['gt_id'].apply(lambda x: x.replace('GT-', 'REV-'))
    df['owner_rev'] = df['owner'].apply(lambda x: perturb_string(x, 0.4))
    df['land_type'] = df['land_use']
    # 5% random error in area
    df['recorded_area'] = df['true_area'] * [random.uniform(0.95, 1.05) for _ in range(len(df))]
    return df[['khasra_no', 'owner_rev', 'land_type', 'recorded_area', 'gt_id']]

def main():
    os.makedirs('data', exist_ok=True)
    
    print("Generating Ground Truth (100 parcels)...")
    gt = generate_grid_parcels(10, 10, 20.0) 
    gt.to_file('data/ground_truth.geojson', driver='GeoJSON')
    
    print("Generating Cadastral dataset...")
    cadastral = create_cadastral(gt)
    cadastral.to_file('data/cadastral.geojson', driver='GeoJSON')
    
    print("Generating Municipal dataset...")
    municipal = create_municipal(gt)
    municipal.to_file('data/municipal.geojson', driver='GeoJSON')
    
    print("Generating Revenue dataset...")
    revenue = create_revenue(gt)
    pd.DataFrame(revenue.drop(columns=['geometry'], errors='ignore')).to_csv('data/revenue.csv', index=False)
    
    print("Generation complete. Files saved to data/")

if __name__ == "__main__":
    main()
