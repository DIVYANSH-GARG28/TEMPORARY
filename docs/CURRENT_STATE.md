# GeoSync Current State

## Architecture
The system employs a modular monolith architecture using FastAPI as the backend, PostgreSQL + PostGIS as the spatial database, and a React + Vite + MapLibre frontend. Orchestration is handled via Docker Compose, which also spins up an n8n instance.

## Existing Modules
1. **Synthetic Data Generator** (`src/generator.py`): Generates perturbed GeoJSON and CSV datasets representing Cadastral, Municipal, and Revenue sources.
2. **Spatial Math Engine** (`src/matcher.py`): Python-level GeoPandas and Shapely implementations for IoU and centroid distance.
3. **Database** (`backend/src/models/models.py`): SQLAlchemy + GeoAlchemy2 schemas for `Dataset`, `ParcelObservation`, `MatchResult`, and `ReviewTask`.
4. **Backend API** (`backend/src/routers/`):
   - `/api/datasets/` - Handles GeoJSON file ingestion and writes directly to `parcel_observations`.
   - `/api/reconciliation/` - Contains the `trigger` logic pushing `ST_Intersection` and `ST_Distance` to PostGIS and applies hardcoded fuzzy logic (`rapidfuzz`) and thresholds.
5. **Frontend UI** (`frontend/src/`): React dashboard with a Data Workspace (file upload), Dashboard (stats), Reconciliation Map (MapLibre), and Human Review Queue.

## Current Tests
- `tests/test_core.py` (6 tests total).
- Passes perfectly, but only validates the pure python mathematical functions (IoU, centroid, string perturbation, and fuzzy ratio). No DB tests, no API integration tests.

## Gaps & Technical Debt
- **Fake Metrics**: The `trigger` endpoint hardcodes rules (`iou > 0.85 and attr_sim > 0.8`) inside the API router instead of a configuration-driven Decision Engine.
- **Incomplete Provenance**: There is no audit log or historical tracing of human decisions. `MatchResult` just overwrites or adds basic status strings.
- **Missing n8n Real Workflows**: n8n container is running but completely empty (no workflows exported/configured).
- **Missing Topology QA**: The system blindly ingests GeoJSON geometry without validating self-intersections or overlaps.
- **Ingestion Validation Gap**: Upload route assumes a perfect schema (`props.get("gt_id")`). Missing attributes silently fall back to `"UNKNOWN"`.
- **Review Queue**: UI allows accepting/rejecting, but the frontend buttons are not wired to backend mutations (only the fetch is wired).
- **No Temporal Features**: No versioning of datasets.
