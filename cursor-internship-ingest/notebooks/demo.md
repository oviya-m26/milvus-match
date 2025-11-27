# Demo Notebook (Markdown)

## Setup

```bash
cp .env.example .env
pnpm install
```

## Run Pipeline

```bash
pnpm run ingest:download
pnpm run ingest:clean
pnpm run ingest:embed
pnpm run ingest:load-db
pnpm run ingest:report
```

`pnpm run ingest:all` executes the full sequence.

## Query Example

```
node scripts/query_vector.js --text "I know Python, React, and want ML internships" --topk 10 --filter country=India
```

Sample output:

```json
[
  {
    "record": {
      "chunk_id": "L1-0",
      "metadata": {
        "title": "Machine Learning Intern",
        "company_name": "DataPulse",
        "skills": "[\"Python\",\"Machine Learning\"]",
        "location_city": "New Delhi"
      }
    },
    "score": 0.91
  }
]
```



