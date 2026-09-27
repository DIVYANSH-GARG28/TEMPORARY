import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.routers import datasets, reconciliation, review, audit, ingest, telegram, citizen, pipeline, ai_agent

app = FastAPI(title="GeoSync API", version="1.0.0")

import time
from collections import defaultdict

# Hackathon: Allow all origins so local network devices (phones, judge laptops) can access the frontend
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Security Headers Middleware (OWASP recommended)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# 2. Basic DDoS / Rate Limiting Middleware
request_counts = defaultdict(list)
RATE_LIMIT = 1000  # Max requests per minute per IP

@app.middleware("http")
async def rate_limiter(request: Request, call_next):
    client_ip = request.client.host
    now = time.time()
    
    # Filter out requests older than 60 seconds
    request_counts[client_ip] = [t for t in request_counts[client_ip] if now - t < 60]
    
    if len(request_counts[client_ip]) >= RATE_LIMIT:
        return JSONResponse(status_code=429, content={"detail": "Too Many Requests - DDoS Protection Triggered"})
        
    request_counts[client_ip].append(now)
    return await call_next(request)

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
app.include_router(ai_agent.router, prefix="/api/ai", tags=["AI Fraud Detection"])

@app.get("/")
def read_root():
    return {"message": "GeoSync API is running securely."}
