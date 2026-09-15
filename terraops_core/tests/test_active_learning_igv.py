import pytest
from app.services.active_learning import ActiveLearningGraphOptimizer

def test_igv_prioritization():
    opt = ActiveLearningGraphOptimizer()
    
    # Two parcels sharing an edge. P1 is high conf, P2 is low conf.
    p1 = {
        "id": "A",
        "confidence_score": 0.9,
        "boundary_vertices": [(0,0), (1,0), (1,1), (0,1)]
    }
    p2 = {
        "id": "B",
        "confidence_score": 0.2, # Highly ambiguous
        "boundary_vertices": [(1,0), (2,0), (2,1), (1,1)]
    }
    
    res = opt.prioritize_field_missions([p1, p2], k_missions=2)
    
    # Shared vertices (1,0) and (1,1) should have the highest IGV because 
    # they are connected to both parcels (degree 3) and one has high ambiguity.
    top_coords = [r["coordinate"] for r in res]
    
    assert (1,0) in top_coords or (1,1) in top_coords
    assert res[0]["igv"] > 0
