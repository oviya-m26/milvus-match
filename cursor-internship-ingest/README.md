# Cursor Internship Ingest

Node.js + TypeScript pipeline that downloads Kaggle internship/job datasets, normalizes them, chunks descriptions/resumes, creates embeddings, and stores them in a FAISS-like vector index plus SQLite.

## Requirements

- Node 18+
- `pnpm` (recommended) or `npm`
- Optional: Kaggle CLI installed and configured

## Environment

1. Copy `.env.example` to `.env`.
2. Fill in `KAGGLE_USERNAME`, `KAGGLE_KEY`, and `OPENAI_API_KEY`.

## Install & Run

```bash
pnpm install
pnpm run ingest:all
```

Individual steps:

```
pnpm run ingest:download
pnpm run ingest:clean
pnpm run ingest:embed
pnpm run ingest:load-db
pnpm run ingest:report
```

## Outputs

- Clean CSVs: `data/clean/*.csv`
- Chunks parquet: `data/clean/chunks.parquet`
- FAISS-like index: `data/vectorstore/index.json`
- SQLite DB: `data/db.sqlite`
- Report: `data/reports/report.json`

### Sync with Flask backend

After running the pipeline, populate the Flask API database with:

```bash
cd backend
python -m backend.scripts.load_ingested_data --clean-dir ../cursor-internship-ingest/data/clean
```

The React dashboard will then read the real internships via `/api/v1/jobs`.

## Querying

```
node scripts/query_vector.js --text "python react internship" --topk 5 --filter country=India
```

## Testing

```
pnpm test
```

## Docker

See `Dockerfile`.

