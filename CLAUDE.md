# CLAUDE.md — working on Antarik AI

Antarik AI is a private / on-prem LLM platform for Indian regulated enterprises (BFSI first) and colleges.
Product summary, architecture and roadmap live in `docs/`. Read `docs/ARCHITECTURE.md` before structural changes.

## Layout
- `backend/` — FastAPI app (`app/`), tests in `backend/tests/`.
  - `app/routers/gateway.py` — OpenAI-compatible `/v1/models`, `/v1/chat/completions` (streaming + non-streaming)
  - `app/services/model_router.py` — `antarik-auto` routing (rules-based classifier)
  - `app/services/metering.py` — usage records, quotas, chargeback
  - `app/routers/{auth,keys,usage}.py` — console API under `/api`
  - `app/models.py` — SQLAlchemy models (Organization → Team → User, ApiKey, UsageRecord, AuditLog)
- `frontend/` — React + Vite + TS + Tailwind v4. Pages in `src/pages`, console under `src/pages/console`.
  Design tokens are in `src/index.css` (`@theme`): paper/ink palette with one saffron accent (`kesar`).

## Commands
- Backend: `cd backend && pytest` · `ruff check app tests` · `uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm run dev` · `npm run build` (runs `tsc --noEmit` first)
- Infra: `docker compose up -d` (Postgres on 5432)

## Worklog and Claude Code setup
- Daily log: `.claude/worklog/YYYY-MM-DD.md`. After finishing a meaningful piece of work, add an entry under
  `## Entries` (or run `/log`): done (with commit hashes), decisions, blockers, next. Never edit the
  `## Auto log` lines; a SessionEnd hook writes those.
- Commands: `/log`, `/standup`, `/check`, `/dev`. Agent: `rules-reviewer` (run before committing backend
  changes to gateway, metering, models, auth or keys). Details in `.claude/README.md`.

## Non-negotiable rules
1. **Never store prompt or completion text.** Not in UsageRecord, AuditLog, logs, or exceptions.
   `tests/test_api.py` has a canary test that scans every table — keep it passing and extend it to new tables.
2. **Every gateway request writes exactly one UsageRecord**, including errors and client disconnects.
3. **Stay OpenAI-compatible.** Don't change request/response shapes on `/v1/*`; add Antarik extras as `x-antarik-*` headers.
4. API keys are stored only as SHA-256 hashes; the full key is returned once on creation.
5. The audit log is append-only. Never add update/delete paths for it.

## Conventions
- Python: type hints everywhere, async SQLAlchemy 2.0 style, Pydantic v2 schemas in `app/schemas.py`, line length 100.
- New endpoints get a test. Mock the upstream (`monkeypatch` on `gateway.upstream`) — tests never need a GPU.
- Frontend: function components + hooks, Tailwind classes using the theme tokens (`bg-paper`, `text-ink`, `text-kesar`), no new UI libraries without discussion.
- Schema changes: v0 uses `create_all` on startup. Introduce Alembic before the first customer deployment (see roadmap).
