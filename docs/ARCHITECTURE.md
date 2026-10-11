# Architecture

## The decision: start simple

**v0 = FastAPI + Postgres + an OpenAI-compatible inference server (vLLM in production, Ollama in dev).**
No agent framework, no Temporal, no Neo4j, no separate vector DB — yet.

| Considered | Verdict for v0 | When it earns its place |
|---|---|---|
| FastAPI + Postgres | **Yes** | Core. Gateway, auth, keys, metering, audit are transactional CRUD + a streaming proxy. |
| MongoDB instead of Postgres | No | Usage/chargeback is relational and aggregate-heavy (sums by team/month). Postgres also gives append-only triggers and row-level security for tenancy. |
| pgvector (Postgres extension) | **Next** (with RAG) | When "RAG over internal data" ships. Keeps one database to install and back up on-prem. |
| Dedicated vector DB (Qdrant, Milvus) | Later | Only if a customer's corpus outgrows pgvector (tens of millions of chunks) or needs hybrid search at scale. |
| Redis | Soon | Rate limiting (token-bucket per key) and caching. Small, standard, easy on-prem. |
| Temporal (durable orchestration) | Later | Long-running jobs: fine-tuning pipelines, bulk document ingestion, multi-step agents that must survive restarts. Not for request/response chat. |
| Agent framework (LangGraph, etc.) | Later | With the coding assistant / agents on the roadmap. Keep it a separate service behind the same gateway. |
| Neo4j / knowledge graph memory | Probably not | Only for a specific customer use case (e.g. entity relationships across case files). Every extra database is something to install and support inside an air-gapped bank. |

The guiding constraint is **on-prem operability**: every component we add is one more thing to install, patch, back up and support inside a customer's data centre. Fewer, boring components win.

## Request flow

```
client (OpenAI SDK / chat app / IDE)
   │  Authorization: Bearer ak_live_…
   ▼
FastAPI gateway  ── auth (API key hash or console JWT)
   │            ── quota check (team monthly token budget)
   │            ── router: antarik-auto → fast | reason | code (rules, records reason)
   ▼
upstream inference (vLLM / SGLang / TGI / Ollama), OpenAI-compatible
   │  streamed SSE back to client unchanged
   ▼
UsageRecord (tokens, TTFT, latency, route reason, status) — never the text
```

## Data model (v0)

- `organizations` → `teams` (cost centres, optional monthly token quota) → `users` (owner/admin/member)
- `api_keys` — SHA-256 hash only; prefix kept for display
- `usage_records` — one row per request, including errors and client disconnects
- `audit_log` — append-only. In production add a Postgres trigger that rejects UPDATE/DELETE:

```sql
CREATE FUNCTION audit_log_immutable() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'audit_log is append-only'; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER audit_log_no_update BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();
```

## Deployment shape (target)

One Helm chart / docker-compose bundle per customer: gateway, console (static React build), Postgres, Redis, vLLM workers on GPU nodes, plus an offline model bundle for air-gapped sites.
