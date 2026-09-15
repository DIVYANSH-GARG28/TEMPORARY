from fastapi import APIRouter
from app.api.v1.endpoints import auth, sandbox, diagnostics, field_edge

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(diagnostics.router, prefix="/conflicts", tags=["Diagnostics"])
api_router.include_router(sandbox.router, prefix="/topology", tags=["Topology Simulator"])
api_router.include_router(field_edge.router, prefix="/edge", tags=["Field Edge Webhooks"])
