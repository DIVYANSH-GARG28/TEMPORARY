import pytest
import math
from src.services.engine import MatchScorer, ConflictEngine
from shapely.geometry import Polygon

def test_attribute_similarity_perfect():
    sim = MatchScorer.calculate_attribute_similarity("Amit Sharma", "Amit Sharma")
    assert sim == 1.0

def test_attribute_similarity_typo():
    sim = MatchScorer.calculate_attribute_similarity("Amit Sharma", "A. Sharma")
    assert sim > 0.6  # Should be reasonably high

def test_attribute_similarity_no_match():
    sim = MatchScorer.calculate_attribute_similarity("Amit Sharma", "Rajesh Kumar")
    assert sim < 0.4

def test_attribute_similarity_empty():
    sim = MatchScorer.calculate_attribute_similarity("", "Rajesh Kumar")
    assert sim == 0.0

def test_conflict_detection_high_confidence():
    conflicts = ConflictEngine.detect_conflicts(iou=0.9, centroid_dist=1.0, attr_sim=0.9, has_owners=True)
    assert not conflicts.get("geometry_conflict")
    assert not conflicts.get("centroid_conflict")
    assert not conflicts.get("attribute_conflict")

def test_conflict_detection_geometry_conflict():
    conflicts = ConflictEngine.detect_conflicts(iou=0.5, centroid_dist=1.0, attr_sim=0.9, has_owners=True)
    assert conflicts.get("geometry_conflict") == True
    assert not conflicts.get("centroid_conflict")

def test_conflict_detection_centroid_conflict():
    conflicts = ConflictEngine.detect_conflicts(iou=0.9, centroid_dist=10.0, attr_sim=0.9, has_owners=True)
    assert not conflicts.get("geometry_conflict")
    assert conflicts.get("centroid_conflict") == True

def test_conflict_detection_attribute_conflict():
    conflicts = ConflictEngine.detect_conflicts(iou=0.9, centroid_dist=1.0, attr_sim=0.2, has_owners=True)
    assert not conflicts.get("geometry_conflict")
    assert conflicts.get("attribute_conflict") == True

def test_entity_validator_identification():
    from src.services.engine import EntityValidator
    
    assert EntityValidator.identify_type("Parliament Museum") == "INSTITUTION"
    assert EntityValidator.identify_type("Ministry of Defense") == "GOVERNMENT_BODY"
    assert EntityValidator.identify_type("Reliance Pvt Ltd") == "PRIVATE_COMPANY"
    assert EntityValidator.identify_type("Anjali Sharma") == "PERSON"
    assert EntityValidator.identify_type("") == "UNKNOWN"

def test_entity_validator_compatibility():
    from src.services.engine import EntityValidator
    
    # Same types should be compatible
    assert EntityValidator.is_compatible("PERSON", "PERSON") == True
    assert EntityValidator.is_compatible("INSTITUTION", "INSTITUTION") == True
    
    # UNKNOWN is treated as compatible by default so it falls back to string matching
    assert EntityValidator.is_compatible("PERSON", "UNKNOWN") == True
    
    # Hard conflicts
    assert EntityValidator.is_compatible("PERSON", "INSTITUTION") == False
    assert EntityValidator.is_compatible("GOVERNMENT_BODY", "PRIVATE_COMPANY") == False

def test_conflict_detection_entity_conflict():
    conflicts = ConflictEngine.detect_conflicts(
        iou=0.95, centroid_dist=1.0, attr_sim=0.9, has_owners=True, 
        entity_a_type="PERSON", entity_b_type="INSTITUTION", entity_compatible=False
    )
    
    assert conflicts.get("entity_conflict") == True
    assert conflicts.get("entity_a_type") == "PERSON"
    assert conflicts.get("entity_b_type") == "INSTITUTION"
