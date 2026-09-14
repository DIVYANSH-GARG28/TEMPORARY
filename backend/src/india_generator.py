import os
import random
import string
import geopandas as gpd
from shapely.geometry import Polygon
from shapely.affinity import translate, rotate
import numpy as np

def generate_random_name():
    first_names = ["Rajesh", "Amit", "Priya", "Sneha", "Vikram", "Neha", "Rahul", "Anjali", "Suresh"]
    last_names = ["Sharma", "Singh", "Patel", "Kumar", "Gupta", "Das", "Verma", "Reddy"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def generate_grid_parcels(rows=5, cols=6, size=0.0002):
    # Center of Connaught Place, New Delhi
    start_lng = 77.215
    start_lat = 28.630
    
    parcels = []
    for i in range(rows):
        for j in range(cols):
            minx = start_lng + (j * size * 1.5)
            miny = start_lat + (i * size * 1.5)
            maxx = minx + size
            maxy = miny + size
            poly = Polygon([(minx, miny), (maxx, miny), (maxx, maxy), (minx, maxy)])
            
            parcel = {
                'gt_id': f"GT-{i}-{j}",
                'owner': generate_random_name(),
                'land_use': random.choice(['Residential', 'Commercial', 'Government', 'Mixed Use']),
                'geometry': poly,
                'true_area': poly.area,
                'type': 'normal'
            }
            parcels.append(parcel)
            
    # Inject Specific Adversarial Cases
    
    # Case 1: Split (1 Cadastral -> 2 Municipal)
    p = parcels[0]
    p['type'] = 'split'
    
    # Case 2: Merge (2 Cadastral -> 1 Municipal)
    p1 = parcels[1]
    p2 = parcels[2]
    p1['type'] = 'merge_part1'
    p2['type'] = 'merge_part2'
    
    # Case 3: Semantic Mismatch (Same Geometry, Wrong Owner Entity Type)
    p3 = parcels[3]
    p3['type'] = 'semantic_mismatch'
    
    # Case 4: Missing Polygon
    p4 = parcels[4]
    p4['type'] = 'missing_municipal'

    return gpd.GeoDataFrame(parcels, crs="EPSG:4326")

def perturb_geometry(poly, translation_std=0.00005, rotation_std=1.0, vertex_noise_std=0.00001, shift_x=0.0, shift_y=0.0):
    dx = random.gauss(0, translation_std) + shift_x
    dy = random.gauss(0, translation_std) + shift_y
    poly = translate(poly, xoff=dx, yoff=dy)
    angle = random.gauss(0, rotation_std)
    poly = rotate(poly, angle, origin='centroid')
    
    if poly.geom_type == 'MultiPolygon':
        # Simplify by just taking the convex hull if it's a multipolygon from merge
        poly = poly.convex_hull
    
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
    if not isinstance(s, str): return s
    if random.random() > prob: return s
    options = [
        lambda x: x.upper(),
        lambda x: x.lower(),
        lambda x: x.replace('a', 'e').replace('A', 'E'),
        lambda x: x.split(' ')[0]
    ]
    return random.choice(options)(s)

def split_polygon_vertical(poly):
    minx, miny, maxx, maxy = poly.bounds
    midx = (minx + maxx) / 2
    poly1 = Polygon([(minx, miny), (midx, miny), (midx, maxy), (minx, maxy)])
    poly2 = Polygon([(midx, miny), (maxx, miny), (maxx, maxy), (midx, maxy)])
    return poly1, poly2

def create_cadastral(gt_gdf):
    records = []
    for idx, row in gt_gdf.iterrows():
        # Cadastral represents the "legal" original baseline
        geom = perturb_geometry(row['geometry'], translation_std=0.00001, vertex_noise_std=0.000005)
        records.append({
            'cadastral_id': row['gt_id'].replace('GT-', 'CAD-'),
            'geometry': geom,
            'area_cad': geom.area,
            'owner_name': row['owner'],
            'land_use': row['land_use'],
            'gt_id': row['gt_id'],
            'type': row['type']
        })
    return gpd.GeoDataFrame(records, crs="EPSG:4326")

def create_municipal(gt_gdf):
    records = []
    # Systematic CRS Shift for Municipal
    shift_x = 0.00005 
    shift_y = 0.00005

    for idx, row in gt_gdf.iterrows():
        t = row['type']
        
        if t == 'missing_municipal':
            continue # Drop it
            
        elif t == 'split':
            # Subdivided property
            p1, p2 = split_polygon_vertical(row['geometry'])
            p1 = perturb_geometry(p1, shift_x=shift_x, shift_y=shift_y)
            p2 = perturb_geometry(p2, shift_x=shift_x, shift_y=shift_y)
            
            records.append({
                'prop_id': row['gt_id'].replace('GT-', 'MUN-') + '-A',
                'geometry': p1, 'area_mun': p1.area,
                'owner_name': row['owner'], 'land_use_type': row['land_use'], 'gt_id': row['gt_id']
            })
            records.append({
                'prop_id': row['gt_id'].replace('GT-', 'MUN-') + '-B',
                'geometry': p2, 'area_mun': p2.area,
                'owner_name': generate_random_name(), 'land_use_type': row['land_use'], 'gt_id': row['gt_id']
            })
            
        elif t == 'merge_part1':
            pass # We will handle merge when we hit merge_part2
            
        elif t == 'merge_part2':
            # Merge part1 and part2 together
            prev = gt_gdf.iloc[idx-1]
            merged_geom = row['geometry'].union(prev['geometry'])
            merged_geom = perturb_geometry(merged_geom, shift_x=shift_x, shift_y=shift_y)
            
            records.append({
                'prop_id': row['gt_id'].replace('GT-', 'MUN-MERGED'),
                'geometry': merged_geom, 'area_mun': merged_geom.area,
                'owner_name': row['owner'], 'land_use_type': row['land_use'], 'gt_id': f"{prev['gt_id']},{row['gt_id']}"
            })
            
        elif t == 'semantic_mismatch':
            geom = perturb_geometry(row['geometry'], shift_x=shift_x, shift_y=shift_y)
            records.append({
                'prop_id': row['gt_id'].replace('GT-', 'MUN-'),
                'geometry': geom, 'area_mun': geom.area,
                'owner_name': "Parliament Museum", # Entity Mismatch
                'land_use_type': "Government", 
                'gt_id': row['gt_id']
            })
            
        else:
            geom = perturb_geometry(row['geometry'], shift_x=shift_x, shift_y=shift_y)
            records.append({
                'prop_id': row['gt_id'].replace('GT-', 'MUN-'),
                'geometry': geom, 'area_mun': geom.area,
                'owner_name': perturb_string(row['owner'], 0.3),
                'land_use_type': perturb_string(row['land_use'], 0.2),
                'gt_id': row['gt_id']
            })

    return gpd.GeoDataFrame(records, crs="EPSG:4326")

def main():
    print("Generating Adversarial Synthetic India Data (Phase 15)...")
    gt = generate_grid_parcels(5, 6) # Smaller set for clear demo (30 records)
    
    cadastral = create_cadastral(gt)
    cadastral.to_file('cadastral.geojson', driver='GeoJSON')
    
    municipal = create_municipal(gt)
    municipal.to_file('municipal.geojson', driver='GeoJSON')
    
    print("Files 'cadastral.geojson' and 'municipal.geojson' created successfully in the src/ directory.")
    print("Included Cases: 1:N Split, N:1 Merge, Semantic Mismatch, Missing Entity, Systematic CRS Shift.")

if __name__ == "__main__":
    main()
