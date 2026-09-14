import geopandas as gpd
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os

def calculate_iou(geom1, geom2):
    if not geom1.is_valid:
        geom1 = geom1.buffer(0)
    if not geom2.is_valid:
        geom2 = geom2.buffer(0)
        
    intersection = geom1.intersection(geom2).area
    union = geom1.union(geom2).area
    if union == 0:
        return 0
    return intersection / union

def calculate_centroid_distance(geom1, geom2):
    return geom1.centroid.distance(geom2.centroid)

def main():
    if not os.path.exists('data/cadastral.geojson') or not os.path.exists('data/municipal.geojson'):
        print("Data files not found. Please run generator.py first.")
        return
        
    print("Loading datasets...")
    cadastral = gpd.read_file('data/cadastral.geojson')
    municipal = gpd.read_file('data/municipal.geojson')
    
    print("Generating spatial candidates...")
    # Use sjoin to find intersecting geometries as candidates
    municipal_buffered = municipal.copy()
    # Buffer by 1 meter (since our CRS EPSG:3857 is in meters) to catch nearby parcels
    municipal_buffered['geometry'] = municipal_buffered.geometry.buffer(1.0)
    
    candidates = gpd.sjoin(cadastral, municipal_buffered, how='inner', predicate='intersects')
    
    print(f"Found {len(candidates)} potential candidates.")
    
    results = []
    
    for idx, row in candidates.iterrows():
        cad_geom = cadastral.loc[idx, 'geometry']
        mun_idx = row['index_right']
        mun_geom = municipal.loc[mun_idx, 'geometry']
        
        iou = calculate_iou(cad_geom, mun_geom)
        centroid_dist = calculate_centroid_distance(cad_geom, mun_geom)
        
        # Simple deterministic rule for now
        is_match = iou > 0.5
        confidence = 'HIGH' if iou > 0.8 else ('MEDIUM' if iou > 0.5 else 'LOW')
        
        results.append({
            'cadastral_id': row['cadastral_id'],
            'prop_id': row['prop_id'],
            'iou': iou,
            'centroid_dist': centroid_dist,
            'is_match': is_match,
            'confidence': confidence,
            'cad_gt_id': row['gt_id_left'],
            'mun_gt_id': row['gt_id_right']
        })
        
    results_df = pd.DataFrame(results)
    
    # Filter to best match per cadastral parcel
    results_df = results_df.sort_values('iou', ascending=False).drop_duplicates('cadastral_id')
    
    print("\n--- Matching Results Summary ---")
    print(f"Total Cadastral Parcels: {len(cadastral)}")
    print(f"Total Matches Found: {results_df['is_match'].sum()}")
    print("\nConfidence Breakdown:")
    print(results_df['confidence'].value_counts().to_string())
    
    # Calculate Ground Truth Accuracy
    correct_matches = results_df[results_df['cad_gt_id'] == results_df['mun_gt_id']]
    print(f"\nGround Truth Correct Matches: {len(correct_matches)} / {len(cadastral)}")
    
    results_df.to_csv('data/matching_results.csv', index=False)
    print("Results saved to data/matching_results.csv")
    
    # Plotting
    print("\nGenerating Visualization...")
    fig, ax = plt.subplots(figsize=(10, 10))
    cadastral.plot(ax=ax, facecolor='none', edgecolor='blue', linewidth=1, label='Cadastral')
    municipal.plot(ax=ax, facecolor='none', edgecolor='red', linewidth=1, linestyle='--', label='Municipal')
    plt.title("Cadastral (Blue) vs Municipal (Red) - Spatial Overlap")
    
    # Create a custom legend
    from matplotlib.lines import Line2D
    custom_lines = [Line2D([0], [0], color='blue', lw=2),
                    Line2D([0], [0], color='red', lw=2, linestyle='--')]
    ax.legend(custom_lines, ['Cadastral', 'Municipal'])
    
    plt.savefig('data/overlay.png')
    print("Visualization saved to data/overlay.png")

if __name__ == "__main__":
    main()
