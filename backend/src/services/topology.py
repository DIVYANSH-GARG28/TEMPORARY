from shapely.geometry.base import BaseGeometry
from shapely.validation import explain_validity, make_valid
from typing import Dict, Any, Tuple

class TopologyQAEngine:
    @staticmethod
    def validate_geometry(geom: BaseGeometry) -> Tuple[bool, str, BaseGeometry]:
        """
        Validates a geometry for self-intersections, gaps, and invalid rings.
        Returns:
            is_valid (bool): Whether the original geometry was perfectly valid.
            issue_explanation (str): Human readable string from Shapely if invalid.
            safe_geometry (BaseGeometry): The repaired geometry if possible, else the original.
        """
        if geom.is_valid:
            return True, "Valid Geometry", geom
            
        issue = explain_validity(geom)
        
        # Try to automatically repair safe technical errors
        # make_valid creates valid representations of invalid geometries (e.g. self-intersecting polygons)
        repaired = make_valid(geom)
        
        # We do NOT want to change the geometry type (e.g. Polygon -> MultiLineString) during repair
        # If repair destroys the polygon nature, we reject it entirely.
        if repaired.geom_type not in ['Polygon', 'MultiPolygon']:
            return False, f"CRITICAL: {issue}. Auto-repair failed (resulted in {repaired.geom_type}).", geom
            
        return False, f"REPAIRED: {issue}", repaired
