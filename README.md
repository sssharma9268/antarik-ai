# Antarik AI

**Private AI, inside your perimeter.** Antarik deploys production-grade LLMs inside an organization's own infrastructure, with the same APIs and apps as a hosted AI service, so sensitive data never leaves.

This repo is a monorepo:

| Folder | What it is | Stack |
|---|---|---|
| `backend/` | API gateway: OpenAI-compatible `/v1`, auth, API keys, model router, metering | Python 3.11+, FastAPI, SQLAlchemy (async), Postgres |
| `frontend/` | Marketing site + admin/user console + chat playground | React 19, Vite, TypeScript, Tailwind v4 |
| `docs/` | Architecture, roadmap, competitive notes | Markdown |

## Run it locally (Windows / macOS / Linux)

**Prerequisites:** Python 3.11+, Node 20+, Docker Desktop (for Postgres), and [Ollama](https://ollama.com) as the local stand-in for GPU inference.

```bash
# 1. Database
docker compose up -d

# 2. A local model (any OpenAI-compatible server works; Ollama is easiest for dev)
ollama pull llama3.2:3b

# 3. Backend  (http://localhost:8000, docs at /docs)
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -e ".[dev]"
copy .env.example .env         # macOS/Linux: cp .env.example .env
uvicorn app.main:app --reload

# 4. Frontend  (http://localhost:5173)
cd ../frontend
npm install
npm run dev
```

Open http://localhost:5173, create an organization, then use **Playground** or create an **API key** and call the gateway with any OpenAI SDK.

> If you only pulled one model, point every entry in `MODEL_MAP` (in `backend/.env`) at it, e.g. all three at `llama3.2:3b`.

## Tests

```bash
cd backend && pytest        # uses SQLite + a mocked upstream; no Postgres or GPU needed
cd frontend && npm run build
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for design decisions and [`docs/ROADMAP.md`](docs/ROADMAP.md) for what comes next.
