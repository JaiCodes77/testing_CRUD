# FastAPI + React CRUD Starter

## Structure
- `backend/` FastAPI API with SQLite
- `frontend/` React UI (Vite)

## Backend setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API runs on `http://localhost:8000`.

## Frontend setup
```bash
cd frontend
npm install
npm run dev
```
UI runs on `http://localhost:5173`.

## Notes
- SQLite file is `backend/app.db`.
- Update CORS origins in `backend/app/main.py` if your frontend runs elsewhere.
