import pytest
from app.schemas.spatial_schemas import GNSSObservation, GeoJSONPolygon
from app.core.security import verify_webhook_signature, WEBHOOK_SECRET

def test_indian_bounding_box_validation():
    # Valid NMEA RTK
    obs = GNSSObservation(latitude=28.6, longitude=77.2, fix_quality=4, pdop=1.5)
    assert obs.latitude == 28.6
    
    # Invalid Latitude (Europe)
    with pytest.raises(ValueError, match="Latitude out of bounds"):
        GNSSObservation(latitude=50.0, longitude=77.2, fix_quality=4, pdop=1.5)
        
    # Invalid Fix Quality (Not RTK)
    with pytest.raises(ValueError, match="prevent GPS spoofing"):
        GNSSObservation(latitude=28.6, longitude=77.2, fix_quality=1, pdop=1.5)

def test_max_vertices_buffer_overflow():
    # Create a malicious geometry with 6000 vertices
    malicious_coords = [[(float(i), float(i)) for i in range(6000)]]
    
    with pytest.raises(ValueError, match="exceeds 5000 limit"):
        GeoJSONPolygon(type="Polygon", coordinates=malicious_coords)

def test_webhook_hmac_signature():
    payload = b'{"test": "payload"}'
    import hmac, hashlib
    
    # Correct signature
    correct_mac = hmac.new(WEBHOOK_SECRET.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    assert verify_webhook_signature(payload, correct_mac) is True
    
    # Spoofed signature
    assert verify_webhook_signature(payload, "invalid_signature") is False
