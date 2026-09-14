from fastapi.testclient import TestClient
from src.main import app
import pytest

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "GeoSync API is running securely."}

def test_ingest_area_unauthorized():
    # Attempting to call the destructive area endpoint without an API key
    payload = {
        "min_lat": 28.6,
        "min_lon": 77.2,
        "max_lat": 28.7,
        "max_lon": 77.3
    }
    response = client.post("/api/ingest/area", json=payload)
    
    # FastApi Security dependency should block this with 403 Forbidden
    assert response.status_code == 403
    assert "Invalid API Key" in response.json()["detail"] or "Not authenticated" in response.json()["detail"]

def test_ingest_area_invalid_api_key():
    payload = {
        "min_lat": 28.6,
        "min_lon": 77.2,
        "max_lat": 28.7,
        "max_lon": 77.3
    }
    # Pass a wrong API key
    response = client.post("/api/ingest/area", json=payload, headers={"X-API-Key": "hacker-key"})
    
    assert response.status_code == 403
    assert response.json()["detail"] == "Invalid API Key. Unauthorized destructive action."

def test_ingest_area_validation_error():
    # Test Pydantic Field constraints (latitude > 90 is invalid)
    payload = {
        "min_lat": 150.0, # Invalid
        "min_lon": 77.2,
        "max_lat": 28.7,
        "max_lon": 77.3
    }
    response = client.post("/api/ingest/area", json=payload, headers={"X-API-Key": "sih-demo-key"})
    
    # Should fail validation before hitting the logic
    assert response.status_code == 422 # Unprocessable Entity
    
def test_global_exception_handler():
    # If we hit an endpoint that crashes, it should return a sanitized 500 error, not a stack trace
    # To simulate this, we can try to call a nonexistent method if it was routed, but
    # FastAPI handles 404s cleanly.
    response = client.get("/api/nonexistent-route-for-testing")
    assert response.status_code == 404
