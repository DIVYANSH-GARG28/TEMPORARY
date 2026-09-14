# SIH Gap Analysis: SIH26013 Requirements vs MVP Reality

| Requirement | Current implementation | Evidence in code | Gap | Priority | Recommended implementation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Parcel Entity Resolution** | Hardcoded IoU + Rapidfuzz in a single API route. | `reconciliation.py` L53 | Lacks multi-signal features (neighbourhood, boundary). Not isolated as a scorer. | HIGH | Build `MatchScorer` as a separate domain service with explicit weighting. |
| **Confidence Calibration** | Hardcoded thresholds (`iou > 0.85`). | `reconciliation.py` L53 | Arbitrary thresholds are scientifically weak for an SIH Grandmaster. Needs ML validation. | HIGH | Export features and train a logistic regression model in `models/` to output probability scores. |
| **Topology QA Engine** | Non-existent. Directly ingests GeoJSON. | `datasets.py` L30 | Fails on real-world dirty geometries (self-intersections). | HIGH | Add `shapely.is_valid` checks and a domain service to flag structured topology errors. |
| **Conflict Engine** | Tied tightly into the reconciliation loop as a JSON dict. | `reconciliation.py` L59 | Not a centralized engine. Types are limited. | MED | Extract `ConflictEngine` to generate structured objects (severity, evidence). |
| **Provenance + Audit** | Overwrites/creates `MatchResult` with no history log. | `models.py` L30 | Fails the "legal/authoritative" requirement constraint. No historical trace of human action. | CRITICAL | Create an immutable `AuditLog` table capturing (source, original, chosen, reason, reviewer, timestamp). |
| **Safe Decision Engine** | Inline `if/else`. | `reconciliation.py` L53 | Rules are hidden in code, hard to test boundary conditions. | MED | Extract into `DecisionPolicy` class driven by environment/config thresholds. |
| **n8n Automation** | Docker container runs, but does nothing. | `docker-compose.yml` | "Fake" automation. No exported workflows. | HIGH | Design 3 actual JSON workflows in `n8n/workflows/` (Ingestion, Routing, Temporal). |
| **Temporal Versioning** | Datasets have no timeline or version tracking. | `models.py` L7 | Cannot detect change over time. | MED | Add `version` column, write change detection logic comparing year-over-year overlaps. |
| **Benchmark System** | Synthetic generator produces files, but doesn't output precision/recall metrics automatically. | `generator.py` | Need formal benchmark runner to prove accuracy to judges. | HIGH | Build `benchmark.run` script that calculates F1 and confusion matrices. |
