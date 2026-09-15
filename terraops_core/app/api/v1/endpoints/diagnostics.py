from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from typing import List, Tuple
from app.core.dependencies import require_role, limiter
from app.tasks import run_morans_i_evaluation

router = APIRouter()

class DiagnosticRequest(BaseModel):
    coordinates: List[Tuple[float, float]]
    dx_array: List[float]
    dy_array: List[float]

@router.post("/evaluate")
@limiter.limit("20/minute")
def evaluate_cluster(
    request: Request,
    req: DiagnosticRequest,
    user_token: dict = Depends(require_role(["cadastre:read"]))
):
    # Dispatch asynchronous background task
    task = run_morans_i_evaluation.delay(req.coordinates, req.dx_array, req.dy_array)
    return {"status": "Processing", "task_id": task.id}
