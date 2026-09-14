import pytest
from shapely.geometry import Polygon
from src.matcher import calculate_iou, calculate_centroid_distance
from rapidfuzz import fuzz
from src.generator import perturb_string

def test_calculate_iou_perfect_match():
    poly1 = Polygon([(0, 0), (10, 0), (10, 10), (0, 10)])
    poly2 = Polygon([(0, 0), (10, 0), (10, 10), (0, 10)])
    assert calculate_iou(poly1, poly2) == 1.0

def test_calculate_iou_partial_match():
    poly1 = Polygon([(0, 0), (10, 0), (10, 10), (0, 10)]) # Area = 100
    poly2 = Polygon([(5, 0), (15, 0), (15, 10), (5, 10)]) # Area = 100
    # Intersection = 5x10 = 50
    # Union = 100 + 100 - 50 = 150
    # IoU = 50 / 150 = 1/3 = 0.3333
    assert abs(calculate_iou(poly1, poly2) - (50/150)) < 0.001

def test_calculate_iou_no_match():
    poly1 = Polygon([(0, 0), (10, 0), (10, 10), (0, 10)])
    poly2 = Polygon([(20, 20), (30, 20), (30, 30), (20, 30)])
    assert calculate_iou(poly1, poly2) == 0.0

def test_centroid_distance():
    poly1 = Polygon([(0, 0), (10, 0), (10, 10), (0, 10)]) # Centroid: 5, 5
    poly2 = Polygon([(10, 0), (20, 0), (20, 10), (10, 10)]) # Centroid: 15, 5
    assert calculate_centroid_distance(poly1, poly2) == 10.0

def test_fuzzy_matching_logic():
    # Simulate the logic from reconciliation.py
    owner_cad = "Amit Sharma"
    owner_mun = "A. Sharma"
    
    score = fuzz.ratio(owner_cad.lower(), owner_mun.lower())
    assert score > 60 # Rapidfuzz should give it a decent score
    
    # Complete typo
    owner_cad2 = "Vikram Singh"
    owner_mun2 = "Rahul Verma"
    score2 = fuzz.ratio(owner_cad2.lower(), owner_mun2.lower())
    assert score2 < 40 # Poor match

def test_perturb_string_safety():
    # Ensure perturb_string doesn't crash on None
    assert perturb_string(None) is None
    assert perturb_string(123) == 123
    
    # Test valid string
    res = perturb_string("Hello", prob=1.0)
    assert isinstance(res, str)
