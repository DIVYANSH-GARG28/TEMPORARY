from fastapi import APIRouter, Depends, HTTPException, Request, Header
from app.schemas.spatial_schemas import GNSSObservation
from app.core.security import verify_webhook_signature

router = APIRouter()

@router.post("/surveyor-observation")
async def ingest_gnss_observation(
    request: Request,
    observation: GNSSObservation,
    x_terraops_signature: str = Header(None)
):
    """
    Webhook target for n8n or Telegram Bots. Requires HMAC-SHA256 signature verification.
    """
    # Verify HMAC signature
    body = await request.body()
    if not verify_webhook_signature(body, x_terraops_signature):
        raise HTTPException(status_code=401, detail="Invalid Webhook Signature")
        
    # The Pydantic model automatically enforced RTK fix_quality, PDOP limits, and Indian Bounding Box limits.
    
    # Process observation
    return {"status": "INGESTED", "observation": observation.dict()}
