---
description: Start the local stack (backend :8000 + frontend :5173) and verify it responds
---

Start the local dev stack, following README "Run it locally".

1. Check prerequisites: `backend/.venv`, `backend/.env` and `frontend/node_modules` exist. If one is
   missing, stop and say which README step to run.
2. Read `DATABASE_URL` in `backend/.env` (only that line). If it's Postgres, check port 5432 answers; if it
   doesn't, suggest `docker compose up -d` or the SQLite fallback. Don't change `.env` without asking.
3. Check Ollama at `http://localhost:11434/api/tags` and warn if it's down or a `MODEL_MAP` model is missing.
4. Start both servers as background tasks:
   - `backend/.venv/Scripts/python -m uvicorn app.main:app --reload --port 8000` in `backend/`
   - `npm run dev` in `frontend/`
5. Confirm `http://localhost:8000/docs` and `http://localhost:5173` return 200, then give the user both URLs.
