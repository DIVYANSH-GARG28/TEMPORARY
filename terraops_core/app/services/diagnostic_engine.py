import numpy as np
from libpysal.weights import KNN
from esda.moran import Moran

class DisplacementDiagnosticEngine:
    def __init__(self):
        pass

    def evaluate_displacement_cluster(self, coordinates: list[tuple[float, float]], dx_array: list[float], dy_array: list[float]) -> dict:
        """
        Evaluate a spatial cluster of conflict displacements to determine root cause.
        
        Args:
            coordinates: List of (x, y) tuples representing the spatial centroids of the conflicts.
            dx_array: List of displacement scalars in X direction (meters).
            dy_array: List of displacement scalars in Y direction (meters).
            
        Returns:
            dict with diagnostic results, Moran's I, and classification.
        """
        if len(coordinates) < 5:
            # Need sufficient sample size for spatial autocorrelation
            return {
                "diagnosis": "INSUFFICIENT_DATA",
                "reason": f"Sample size {len(coordinates)} too small for Moran's I."
            }

        # Ensure numpy arrays
        pts = np.array(coordinates)
        dx = np.array(dx_array)
        dy = np.array(dy_array)

        # 1. Compute Spatial Weights Matrix (k-nearest neighbors)
        k = min(15, len(coordinates) - 1)
        w = KNN.from_array(pts, k=k)
        w.transform = 'r' # row-standardized

        # 2. Calculate Global Moran's I for dx and dy
        moran_dx = Moran(dx, w)
        moran_dy = Moran(dy, w)

        mean_dx = np.mean(dx)
        mean_dy = np.mean(dy)
        max_displacement = np.max(np.sqrt(dx**2 + dy**2))

        # 3. Diagnostic Decision Engine
        mean_dx = np.mean(dx)
        mean_dy = np.mean(dy)
        max_displacement = np.max(np.sqrt(dx**2 + dy**2))
        
        var_dx = np.var(dx)
        var_dy = np.var(dy)
        
        # If variance is extremely low but mean displacement is high, it's a pure uniform translation
        is_uniform_translation = (var_dx < 0.1 and var_dy < 0.1 and max_displacement > 0.5)

        # High spatial autocorrelation in displacement implies a systematic datum shift or uniform right-of-way shift
        is_systematic_dx = moran_dx.I >= 0.70 and moran_dx.p_norm <= 0.05
        is_systematic_dy = moran_dy.I >= 0.70 and moran_dy.p_norm <= 0.05

        diagnosis = "AMBIGUOUS_SURVEY_ERROR"
        
        if is_uniform_translation or is_systematic_dx or is_systematic_dy:
            diagnosis = "SYSTEMATIC_GEODETIC_SHIFT_OR_STATUTORY_SETBACK"
        elif moran_dx.I < 0.30 and moran_dy.I < 0.30 and max_displacement > 1.0:
            diagnosis = "LOCALIZED_INDIVIDUAL_ENCROACHMENT"

        return {
            "diagnosis": diagnosis,
            "moran_i_dx": float(moran_dx.I),
            "p_value_dx": float(moran_dx.p_norm),
            "moran_i_dy": float(moran_dy.I),
            "p_value_dy": float(moran_dy.p_norm),
            "mean_shift_vector": (float(mean_dx), float(mean_dy)),
            "max_displacement_m": float(max_displacement)
        }
