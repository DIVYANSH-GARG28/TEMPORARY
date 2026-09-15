-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create Schemas
CREATE SCHEMA IF NOT EXISTS cadastre_prod;
CREATE SCHEMA IF NOT EXISTS cadastre_sandbox;

-- 1. Production Khasra Parcels (Authoritative)
CREATE TABLE IF NOT EXISTS cadastre_prod.khasra_parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    khasra_no VARCHAR(50) NOT NULL,
    village_code VARCHAR(50) NOT NULL,
    geom GEOMETRY(MultiPolygon, 32643) NOT NULL,
    legal_area_sqm DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_khasra_geom ON cadastre_prod.khasra_parcels USING GIST (geom);

-- 2. Physical Drone Footprints
CREATE TABLE IF NOT EXISTS cadastre_prod.drone_footprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id VARCHAR(50),
    geom GEOMETRY(MultiPolygon, 32643) NOT NULL,
    ground_elevation_m FLOAT,
    eave_height_m FLOAT,
    source_flight_id VARCHAR(50)
);
CREATE INDEX idx_drone_geom ON cadastre_prod.drone_footprints USING GIST (geom);

-- 3. Conflicts Engine
CREATE TABLE IF NOT EXISTS cadastre_prod.conflict_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    khasra_id UUID REFERENCES cadastre_prod.khasra_parcels(id),
    footprint_id UUID REFERENCES cadastre_prod.drone_footprints(id),
    iou_score FLOAT,
    displacement_vector GEOMETRY(Point, 32643),
    status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_conflict_khasra ON cadastre_prod.conflict_records (khasra_id);
CREATE INDEX idx_conflict_footprint ON cadastre_prod.conflict_records (footprint_id);

-- 4. Audit Ledger for Statutory Immutability
CREATE TABLE IF NOT EXISTS cadastre_prod.audit_ledger (
    id BIGSERIAL PRIMARY KEY,
    entity_id UUID NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    previous_wkt TEXT,
    repaired_wkt TEXT,
    transformation_matrix JSONB,
    statutory_justification TEXT,
    sha256_hash CHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sandbox Transient Tables (Used inside SERIALIZABLE transactions)
CREATE TABLE IF NOT EXISTS cadastre_sandbox.staging_parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_id UUID,
    geom GEOMETRY(MultiPolygon, 32643),
    legal_area_sqm DOUBLE PRECISION,
    session_id VARCHAR(100) NOT NULL
);
CREATE INDEX idx_staging_geom ON cadastre_sandbox.staging_parcels USING GIST (geom);

CREATE TABLE IF NOT EXISTS cadastre_sandbox.sandbox_run_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    status VARCHAR(50),
    error_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
