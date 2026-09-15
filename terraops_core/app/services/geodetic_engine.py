from pyproj import CRS, Transformer
import numpy as np

class GeodeticTransformService:
    def __init__(self):
        # Base Transformers for WGS84 to UTM 43N/44N (India)
        self.wgs84_to_utm43n = Transformer.from_crs("EPSG:4326", "EPSG:32643", always_xy=True)
        self.utm43n_to_wgs84 = Transformer.from_crs("EPSG:32643", "EPSG:4326", always_xy=True)
        
        self.wgs84_to_utm44n = Transformer.from_crs("EPSG:4326", "EPSG:32644", always_xy=True)
        self.utm44n_to_wgs84 = Transformer.from_crs("EPSG:32644", "EPSG:4326", always_xy=True)

        # 7-Parameter Helmert datum shift parameters for Everest 1956 to WGS84
        # [Tx, Ty, Tz, Rx, Ry, Rz, Scale]
        # Note: In production, these parameters need to be calibrated for the specific local grid
        self.helmert_params = {
            'tx': 283.0, 'ty': 682.0, 'tz': 231.0, # Translations in meters
            'rx': 0.0, 'ry': 0.0, 'rz': 0.0,       # Rotations in arc-seconds (simplified)
            's': 0.0                               # Scale factor difference in ppm
        }

    def validate_bounds(self, lon: float, lat: float) -> bool:
        """Validate if coordinate falls within Indian territorial bounds"""
        if not (8.0 <= lat <= 37.0):
            return False
        if not (68.0 <= lon <= 97.0):
            return False
        return True

    def wgs84_to_utm(self, lon: float, lat: float, zone: int = 43) -> tuple[float, float]:
        """Convert WGS84 (lon, lat) to UTM (x, y) in meters"""
        if not self.validate_bounds(lon, lat):
            raise ValueError(f"Coordinates ({lon}, {lat}) out of India bounds.")
        
        if zone == 43:
            return self.wgs84_to_utm43n.transform(lon, lat)
        elif zone == 44:
            return self.wgs84_to_utm44n.transform(lon, lat)
        else:
            raise ValueError(f"Unsupported UTM zone {zone}. Supported: 43, 44")

    def helmert_everest_to_wgs84(self, x: float, y: float, z: float) -> tuple[float, float, float]:
        """
        Apply custom 7-parameter Helmert transformation.
        [X, Y, Z]_WGS84 = [Tx, Ty, Tz] + (1 + s) * R * [X, Y, Z]_Everest
        Simplified here for translational shift.
        """
        # Translation
        new_x = x + self.helmert_params['tx']
        new_y = y + self.helmert_params['ty']
        new_z = z + self.helmert_params['tz']
        
        # Note: full rotation and scale matrix multiplication goes here for 3D rigor
        
        return new_x, new_y, new_z
