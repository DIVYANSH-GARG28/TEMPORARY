import pytest
from app.services.geodetic_engine import GeodeticTransformService

def test_indian_bounds_validation():
    svc = GeodeticTransformService()
    assert svc.validate_bounds(77.2090, 28.6139) == True  # New Delhi (Valid)
    assert svc.validate_bounds(10.0, 50.0) == False       # Europe (Invalid)

def test_helmert_transformation():
    svc = GeodeticTransformService()
    x, y, z = 1000.0, 2000.0, 3000.0
    new_x, new_y, new_z = svc.helmert_everest_to_wgs84(x, y, z)
    
    # Just verify translations were added
    assert new_x == x + 283.0
    assert new_y == y + 682.0
    assert new_z == z + 231.0
