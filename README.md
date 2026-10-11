# Antarik AI

**Private AI, inside your perimeter.** Antarik deploys production-grade LLMs inside an organization's own infrastructure, with the same APIs and apps as a hosted AI service, so sensitive data never leaves.

This repo is a monorepo:

| Folder | What it is | Stack |
|---|---|---|
| `backend/` | API gateway: OpenAI-compatible `/v1`, auth, API keys, model router, metering | Python 3.11+, FastAPI, SQLAlchemy (async), Postgres |
| `frontend/` | Marketing site + admin/user console + chat playground | React 19, Vite, TypeScript, Tailwind v4 |
| `docs/` | Architecture, roadmap, competitive notes | Markdown |

## Run it locally (Windows / macOS / Linux)

**Prerequisites:** Python 3.11+, Node 20+, [Ollama](https://ollama.com) as the local stand-in for GPU inference,
and Docker Desktop for Postgres (optional, see [No Docker?](#no-docker-use-sqlite)).

You need three things running: the database, the backend on port 8000 and the frontend on port 5173.
Use a separate terminal for the backend and the frontend.

### 1. Database (Postgres in Docker)

From the repo root:

```bash
docker compose up -d     # starts Postgres 16 on localhost:5432 (user/password/db: antarik)
docker compose ps        # the postgres service should show as running (healthy)
```

Data lives in the `pgdata` Docker volume. `docker compose down` stops it; `docker compose down -v` also wipes the data.

### 2. A local model

Any OpenAI-compatible server works; Ollama is the easiest for dev.

```bash
ollama pull llama3.2:3b
ollama list              # note the exact model name, e.g. llama3.2:3b or llama3.2:latest
```

### 3. Backend (http://localhost:8000, API docs at http://localhost:8000/docs)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate         # Windows   (macOS/Linux: source .venv/bin/activate)
pip install -e ".[dev]"
copy .env.example .env         # Windows   (macOS/Linux: cp .env.example .env)
uvicorn app.main:app --reload
```

Before starting, edit `backend/.env`:

- **`JWT_SECRET`**: set a long random string.
- **`MODEL_MAP`**: every value must be a model that `ollama list` shows. If you pulled only one model,
  point all three at it, e.g.
  `MODEL_MAP={"antarik-fast":"llama3.2:3b","antarik-reason":"llama3.2:3b","antarik-code":"llama3.2:3b"}`

Tables are created automatically on startup; there are no migrations to run yet.

### 4. Frontend (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

In dev, Vite proxies `/api` and `/v1` to the backend on port 8000, so leave `VITE_API_URL` unset.

### 5. Try it

Open http://localhost:5173, create an organization, then use **Playground**, or create an **API key** and call the
gateway with any OpenAI SDK (`base_url="http://localhost:8000/v1"`).

To check the whole path from the command line (PowerShell):

```powershell
$b = "http://localhost:5173"
$reg = @{ org_name="Dev Org"; full_name="Dev"; email="dev@example.com"; password="devpassword1" } | ConvertTo-Json
$tok = (Invoke-RestMethod "$b/api/auth/register" -Method Post -Body $reg -ContentType "application/json" -DisableKeepAlive).access_token
$key = (Invoke-RestMethod "$b/api/keys" -Method Post -Body '{"name":"dev"}' -ContentType "application/json" -Headers @{Authorization="Bearer $tok"} -DisableKeepAlive).key
$chat = '{"model":"antarik-auto","messages":[{"role":"user","content":"Reply with just: pong"}]}'
Invoke-RestMethod "$b/v1/chat/completions" -Method Post -Body $chat -ContentType "application/json" -Headers @{Authorization="Bearer $key"} -DisableKeepAlive
```

The equivalent with curl (macOS/Linux):

```bash
TOK=$(curl -s localhost:5173/api/auth/register -H 'Content-Type: application/json' \
  -d '{"org_name":"Dev Org","full_name":"Dev","email":"dev@example.com","password":"devpassword1"}' | jq -r .access_token)
KEY=$(curl -s localhost:5173/api/keys -H "Authorization: Bearer $TOK" -H 'Content-Type: application/json' \
  -d '{"name":"dev"}' | jq -r .key)
curl -s localhost:5173/v1/chat/completions -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -d '{"model":"antarik-auto","messages":[{"role":"user","content":"Reply with just: pong"}]}'
```

The response includes an `x-antarik-route` header showing which model `antarik-auto` picked.

### No Docker? Use SQLite

For local dev you can skip Postgres. `aiosqlite` comes with the dev dependencies (the tests use it too).
In `backend/.env`, replace the `DATABASE_URL` line with:

```
DATABASE_URL=sqlite+aiosqlite:///./antarik-dev.db
```

The database file is created in `backend/` and is gitignored. Use Postgres for anything beyond local dev.

### Troubleshooting

| Symptom | Fix |
|---|---|
| `docker compose up` hangs with no output | The Docker engine is not ready. Wait for Docker Desktop to say "Engine running", or restart it. Meanwhile, use SQLite (above). |
| Chat returns an upstream error | Ollama isn't running, or a `MODEL_MAP` value doesn't match `ollama list` exactly. |
| PowerShell: "connection that was expected to be kept alive was closed" | A Windows PowerShell 5.1 quirk with the Vite proxy. Add `-DisableKeepAlive` to `Invoke-RestMethod`. |
| Frontend gets 401 after a backend restart | `JWT_SECRET` changed, which invalidates existing logins. Log in again. |

## Tests

```bash
cd backend && pytest        # uses SQLite + a mocked upstream; no Postgres or GPU needed
cd frontend && npm run build
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for design decisions and [`docs/ROADMAP.md`](docs/ROADMAP.md) for what comes next.
