from celery import Celery
import os
import time

celery_app = Celery(
    "terraops_tasks",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task
def run_morans_i_evaluation(coordinates: list, dx_array: list, dy_array: list):
    """
    Asynchronous task for running Moran's I on the diagnostic engine.
    """
    from app.services.diagnostic_engine import DisplacementDiagnosticEngine
    engine = DisplacementDiagnosticEngine()
    # This might take a few seconds on a huge cluster
    result = engine.evaluate_displacement_cluster(coordinates, dx_array, dy_array)
    return result

@celery_app.task
def compute_active_learning_graph(polygons_geojson: list):
    """
    Asynchronous task for building a NetworkX graph of boundary conflicts.
    """
    from app.services.active_learning import ActiveLearningGraph
    alg = ActiveLearningGraph()
    for feat in polygons_geojson:
        alg.add_cadastral_polygon(feat["id"], feat["geometry"])
        
    return alg.get_prioritized_survey_targets()
