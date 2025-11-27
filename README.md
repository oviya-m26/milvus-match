## MilvusMatch — PM Internship Scheme Prototype

Front-end prototype demonstrating an AI-based smart allocation engine for the PM Internship Scheme.

### Run locally
1. **Backend**
   ```bash
   cd backend
   python -m venv .venv && .venv\Scripts\activate
   pip install -r requirements.txt
   python -m backend.scripts.load_ingested_data --clean-dir ..\cursor-internship-ingest\data\clean
   flask --app app run
   ```
   Need an admin? `python -m backend.scripts.seed_admin --email admin@example.com`.
2. **Frontend**
   ```bash
   cd frontend/ApplicantAura
   npm install
   set VITE_REACT_APP_BASE_URL=http://localhost:5000/api/v1
   npm run dev
   ```

### Backend API
- Navigate to `backend/` and follow the instructions in `backend/README.md` to start the Flask + Milvus-powered API.
- Define `VITE_REACT_APP_BASE_URL` (e.g. `http://localhost:5000/api/v1`) so the frontend can talk to the backend.
- Architecture + fairness blueprint: `docs/ai_internship_allocator.md`.

### Features
- AI-style matchmaking (skills, sectors, locations, affirmative action, capacity)
- Demo auth (works without backend)
- Indian flag branding (favicon, logo, theme)

### Docker & CI
- Backend image: `docker build -f backend/Dockerfile -t applicantaura-backend .`
- Frontend image: `docker build -f frontend/ApplicantAura/Dockerfile -t applicantaura-frontend .`
- GitHub Actions (`.github/workflows/ci.yml`) runs backend pytest + frontend build on every push/PR.










