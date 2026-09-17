import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.routers import datasets, reconciliation, review, audit, ingest, telegram, citizen, pipeline

app = FastAPI(title="GeoSync API", version="1.0.0")

# Restrict CORS to known origins
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global Exception Handler to prevent stack trace leakage
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )

# Removed vision import to fix backend crash
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(reconciliation.router, prefix="/api/reconciliation", tags=["Reconciliation"])
app.include_router(review.router, prefix="/api/review", tags=["Human Review"])
app.include_router(audit.router, prefix="/api/audit", tags=["Provenance"])
app.include_router(ingest.router, prefix="/api/ingest", tags=["Ingest"])
app.include_router(telegram.router, prefix="/api/telegram", tags=["Telegram Integration"])
app.include_router(citizen.router, prefix="/api/citizen", tags=["Citizen Portal"])
app.include_router(pipeline.router, prefix="/api/pipeline", tags=["Pipeline"])

@app.get("/")
def read_root():
    return {"message": "GeoSync API is running securely."}
