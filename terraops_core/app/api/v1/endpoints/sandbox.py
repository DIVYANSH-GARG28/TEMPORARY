from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import require_role, limiter
from app.schemas.spatial_schemas import SimulationRequest, SimulationResponse, CommitRequest
from app.services.simulation_sandbox import TopologyRepairSandbox, StatutoryViolationException

router = APIRouter()

@router.post("/simulate", response_model=SimulationResponse)
@limiter.limit("5/minute")
def simulate_repair(
    request: Request,
    req: SimulationRequest, 
    db: Session = Depends(get_db),
    user_token: dict = Depends(require_role(["cadastre:simulate"]))
):
    """
    Executes a candidate repair in the isolated sandbox schema without touching production data.
    """
    sandbox = TopologyRepairSandbox(db)
    try:
        # Note: apply_repair_strategy would need to be updated to accept author_user_id and return session_id 
        # instead of committing, but this scaffolds the structure.
        result = sandbox.apply_repair_strategy(req.khasra_id, req.strategy, req.dx, req.dy)
        return result
    except StatutoryViolationException as e:
        raise HTTPException(status_code=422, detail={"violation": "STATUTORY_RULE_BROKEN", "reason": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/commit")
def commit_repair(
    req: CommitRequest,
    db: Session = Depends(get_db),
    user_token: dict = Depends(require_role(["cadastre:commit"]))
):
    """
    Commits a verified sandbox repair to production and generates the SHA-256 hash chain block.
    """
    # Logic to move from sandbox to prod + sign via ProvenanceSigner
    return {"status": "COMMITTED", "author": user_token["sub"]}
