import pytest
import numpy as np
from app.services.diagnostic_engine import DisplacementDiagnosticEngine

def test_systematic_translation_shift():
    engine = DisplacementDiagnosticEngine()
    
    # Generate 30 parcels with a simulated 1.5m uniform shift
    np.random.seed(42)
    coords = [(np.random.uniform(0, 1000), np.random.uniform(0, 1000)) for _ in range(30)]
    
    # Uniform shift + tiny noise
    dx = [1.5 + np.random.normal(0, 0.01) for _ in range(30)]
    dy = [1.5 + np.random.normal(0, 0.01) for _ in range(30)]
    
    res = engine.evaluate_displacement_cluster(coords, dx, dy)
    assert res["diagnosis"] == "SYSTEMATIC_GEODETIC_SHIFT_OR_STATUTORY_SETBACK"

def test_individual_encroachment():
    engine = DisplacementDiagnosticEngine()
    
    # Generate 30 parcels with random noise, except one with a large shift
    np.random.seed(42)
    coords = [(np.random.uniform(0, 1000), np.random.uniform(0, 1000)) for _ in range(30)]
    
    dx = [np.random.normal(0, 0.1) for _ in range(30)]
    dy = [np.random.normal(0, 0.1) for _ in range(30)]
    
    # The anomaly
    dx[15] = 2.0
    dy[15] = 2.0
    
    res = engine.evaluate_displacement_cluster(coords, dx, dy)
    
    assert res["diagnosis"] == "LOCALIZED_INDIVIDUAL_ENCROACHMENT"
    assert res["moran_i_dx"] < 0.30
