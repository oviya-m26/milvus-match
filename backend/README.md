# ApplicantAura Backend

Flask-based API for AI-powered internship allocation. Provides:

- JWT auth with applicant/employer roles
- Job CRUD with SBERT + Milvus embeddings
- Quota-aware matching + recommendation API
- Application tracking (statuses, match scores)

## Setup

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
flask --app app run
```

Configure `.env` (see `config.py`) for DB, JWT, Milvus.

## Load cleaned datasets

After running the Node ingestion pipeline, sync the cleaned CSVs into the Flask database:

```bash
cd backend
python -m backend.scripts.load_ingested_data --clean-dir ..\cursor-internship-ingest\data\clean
```

This command creates/updates employer + job records so `/api/v1/jobs` and matchmaking endpoints serve the ingested internships.

## Fairness, Quotas & Audit APIs

- `GET /api/v1/matching/recommendations` – returns SBERT + Milvus matches with quota diagnostics; each response is persisted to `allocation_audits` for replay.
- `GET /api/v1/matching/audit/summary` (admin JWT) – aggregates category/region shares against NSS reservation targets.
- `GET /api/v1/matching/audit/logs?jobId=<id>&category=sc&limit=50` – streams raw pipeline events for compliance reviews.

`backend/data/reservation_targets.json` captures NSS-derived reservation ratios and regional uplift factors per state. `QuotaService` uses these values when a job does not define explicit quotas, ensuring the allocation engine dynamically respects affirmative-action policy.

## Seed an administrator

```bash
cd backend
python -m backend.scripts.seed_admin --email admin@example.com --name "PM Admin"
```

You will be prompted for a password (or pass `--password`). The user is promoted to `role=admin` so audit APIs are accessible.

## Docker

Build the API container from the repo root:

```bash
docker build -f backend/Dockerfile -t applicantaura-backend .
docker run --env-file backend/.env -p 5000:5000 applicantaura-backend
```

Set `MILVUS_URI`, `DATABASE_URL`, and `JWT_SECRET_KEY` via the env file or individual `-e` flags.

## Tests & CI

```bash
cd backend
pip install -r requirements.txt
pytest
```

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs these tests and the frontend build on every push/PR targeting `main`.
