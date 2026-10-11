---
description: Run every check (backend tests + lint, frontend typecheck + build) and report
---

Run all checks from the repo root and report the results. Run the backend and frontend checks in
parallel when you can.

- Backend tests: `backend/.venv/Scripts/python -m pytest -q` in `backend/` (on macOS/Linux:
  `.venv/bin/python`)
- Backend lint: `backend/.venv/Scripts/python -m ruff check app tests` in `backend/`
- Frontend: `npm run build` in `frontend/` (runs `tsc --noEmit` first)

Report one line per check: pass/fail and the counts. For each failure, give the first relevant error with
`file:line`. Don't fix anything unless the user asks. If the venv or `node_modules` is missing, say so and
point at the README setup steps instead of installing.
