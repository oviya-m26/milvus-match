## ApplicantAura – AI Internship Allocation Blueprint

### 1. Objective
Create a nationwide internship exchange for India that automatically matches students to opportunities while honoring regional preferences and affirmative-action quotas. The system ingests public internship feeds (Kaggle/Data.gov.in), Skill India competency tags, uploaded resumes, and NSS socio-economic targets to recommend roles, enforce reservations, and expose the matching pipeline for audits.

### 2. Data Sources
- **Government + verified portals**: `cursor-internship-ingest` cleans Data.gov.in, NCS, and internship Kaggle dumps and writes `data/clean/listings.csv`.
- **Candidate resumes**: handled through `/auth/register`, `/auth/updateUser`, and `/applications` APIs; resumes are embedded via SBERT and stored for semantic search.
- **Skill India catalogue**: normalized into `skills_required` tags during ingestion.
- **NSS socio-economic survey**: distilled into `backend/data/reservation_targets.json`, providing state-wise reservation ratios and regional uplift factors that power the `QuotaService`.

### 3. Technical Framework
| Layer | Implementation |
| --- | --- |
| Backend | Flask 3 + SQLAlchemy. Pandas powers data loading scripts; Sentence-BERT (`all-mpnet-base-v2`) encodes jobs/resumes. |
| Vector DB | Zilliz Milvus Cloud via `pymilvus`. Jobs are upserted with embeddings; candidate vectors query Milvus for top-K semantic matches. |
| Frontend | React + Vite app in `frontend/ApplicantAura`, with role-based dashboards (students, employers, admins). |
| Auth | JWT (PyJWT) + Flask-Bcrypt hashing; `token_required` decorator gates RBAC. |
| Containerization | Dockerfiles (to be generated per service) run on Conda/virtualenv-managed environments. |

### 4. Functional Highlights
- **Secure REST APIs**: `/auth`, `/jobs`, `/applications`, `/matching`. Employers post roles, students manage profiles + apply, admins audit.
- **SBERT + Milvus recommendations**: `MatchingService` builds embeddings, runs Milvus similarity, and post-processes results with quota + region bonuses.
- **Dynamic quotas**: `QuotaService` compares each job’s reservation map (or NSS defaults) against live allocations and adjusts scores to prioritize under-served categories; excess allocations incur penalties.
- **Regional fairness**: NSS-derived `regionBonus` uplifts candidates from under-represented regions (North East, Aspirational districts, etc.).
- **Audit trail**: every recommendation is logged to `allocation_audits` via `AuditService`, capturing score, reasons, vector diagnostics, and quota snapshot.
- **Admin tooling**: `/matching/audit/summary` surfaces compliance KPIs; `/matching/audit/logs` streams detailed traces for replay or export.

### 5. Deployment
1. **Backend**: `conda create -n applicant-aura python=3.11 && conda activate applicant-aura`; `pip install -r backend/requirements.txt`. Run `flask --app backend.app run`.
2. **Milvus**: create Zilliz cluster, set `MILVUS_URI`, `MILVUS_TOKEN`, `MILVUS_COLLECTION`.
3. **Frontend**: `cd frontend/ApplicantAura && npm install && npm run dev`. Set `VITE_REACT_APP_BASE_URL`.
4. **Docker**: build multi-stage images (`backend/Dockerfile`, `frontend/Dockerfile`) and compose with Milvus + Postgres for cloud deployments.

### 6. Performance Metrics
- **User satisfaction**: NPS >= 60, captured via frontend surveys tied to recommendation sessions.
- **Fairness**: <5% deviation from NSS quota targets per state + category; measured through `AuditService.summary()`.
- **Latency**: SBERT encode <120 ms (cached), Milvus query <50 ms, API P95 <150 ms.

### 7. Testing & Validation
- **Unit tests**: quota math (`QuotaService`), JWT utils, schema validation, ingestion parsers.
- **Integration tests**: SBERT → Milvus → `/matching/recommendations`, end-to-end `/applications` flow.
- **Load tests**: k6/Gatling scripts to verify 500 RPS on recommendation endpoint with warm cache.
- **User acceptance**: pilot with universities across regions (North East, South, Tier-2 cities) to validate UX + fairness controls.

### 8. Documentation
- **API reference**: auto-generated via Flasgger or Docusaurus (planned) describing payloads/responses.
- **Data model catalog**: covers `users`, `jobs`, `applications`, `allocation_audits`.
- **Operations runbook**: outlines Milvus index rebuilds, SBERT model refresh, rotating JWT secrets, monitoring (Prometheus/Grafana).

This blueprint aligns the ingestion pipeline, ML layer, and React experience while embedding affirmative-action compliance and auditability into the core allocation loop.








