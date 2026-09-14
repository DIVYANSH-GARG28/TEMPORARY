# GeoSync Implementation Plan

This plan transforms the MVP into a legally defensible, SIH Grandmaster-winning system by prioritizing provenance, topology QA, and benchmark reproducibility before flashy features.

## Dependency Order

1. **Phase 1: Foundation (Data Model & Schema)**
   - Implement `AuditLog` table for immutable provenance.
   - Refactor `MatchResult` and `ParcelObservation` to support temporal versioning.

2. **Phase 2: Robust Ingestion & Topology QA**
   - Add Pydantic validation for GeoJSON ingestion (replacing loose `dict.get()`).
   - Create `TopologyQAEngine` to validate geometries (self-intersections, overlaps).

3. **Phase 3: Upgraded Parcel Resolution Engine**
   - Separate `reconciliation.py` logic into `MatchScorer`, `ConflictEngine`, and `DecisionPolicy` domain services.
   - Expand features: boundary similarity, area similarity.

4. **Phase 4: ML Confidence Calibration & Benchmark**
   - Build formal benchmark runner `benchmark/run.py`.
   - Train and serialize a lightweight logistic regression model to replace hardcoded confidence thresholds.

5. **Phase 5: n8n Real Automation**
   - Build and export 3 actual `.json` workflows for ingestion, routing, and temporal monitoring.

6. **Phase 6: Frontend Wiring & Polish**
   - Connect frontend action buttons (Accept/Reject) to backend endpoints writing to the new `AuditLog`.
   - Add "Provenance / History" timeline view to the React app.

## Estimated Engineering Difficulty
- **High**: Phase 4 (ML calibration and benchmark reproducibility without overfitting to synthetic data).
- **Medium**: Phase 3 (Refactoring the fast PostGIS integration into clean Domain Driven Design patterns without losing the performance of `ST_Intersection`).
- **Low**: Phase 1 & 2 (Standard SQLAlchemy and FastAPI Pydantic work).

## Risk
- **Performance Degradation**: Moving from a pure `ST_Intersection` SQL query to a multi-signal `MatchScorer` might slow down the system. We must retain PostGIS for candidate generation and only apply Python scoring to candidates.
- **Scope Creep**: Getting distracted by Aerial/ORI CV models before the core data model (Provenance) is rock solid.

## Acceptance Criteria
- [ ] No hardcoded `iou > 0.85` thresholds exist in the API layer.
- [ ] Every human review action creates a row in the `AuditLog` table.
- [ ] Running `pytest` passes an expanded suite covering Topology QA and Conflict Generation.
- [ ] `benchmark/run.py` outputs a structured precision/recall JSON report.

## Tests Required
- `test_topology_qa.py`: Testing valid vs invalid polygons.
- `test_decision_policy.py`: Testing boundary thresholds (e.g. `iou=0.849` vs `iou=0.851`).
- `test_audit_log.py`: Ensuring mutations correctly record the actor and original state.
