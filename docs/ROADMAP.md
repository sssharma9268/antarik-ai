# Roadmap

## v0 — scaffold (this commit)
- [x] OpenAI-compatible `/v1/chat/completions` (streaming + non-streaming) and `/v1/models`
- [x] Organizations, teams, users; email/password auth (JWT)
- [x] API keys (hashed), revoke, last-used
- [x] `antarik-auto` rules-based router with recorded route reason
- [x] Per-request metering, monthly team quotas, usage summary
- [x] Canary test: no prompt/completion text stored anywhere
- [x] React site + console (overview, keys, playground, quickstart)

## v0.2 — pilot-ready
- [ ] Alembic migrations; audit-log immutability trigger
- [ ] Redis rate limiting per key / team
- [ ] Admin views: teams, members, quotas, usage by team & cost centre (chargeback export CSV)
- [ ] RBAC enforcement (owner / admin / member) on console routes
- [ ] SSO: OIDC + SAML (Azure AD, Okta, Keycloak)
- [ ] `/v1/embeddings`, `/v1/completions`; Anthropic-compatible `/v1/messages`
- [ ] Status page and model health checks against upstream

## v0.3 — internal knowledge
- [ ] RAG: document upload, chunking, pgvector, citations in answers
- [ ] Connectors: SharePoint, file shares, Confluence
- [ ] Per-org model catalogue and routing policies

## v1 — enterprise
- [ ] Helm chart + air-gapped install bundle
- [ ] Fine-tuning jobs (LoRA) — candidate for Temporal
- [ ] Indian-language evaluation suite and tuned models
- [ ] DPDP compliance pack: data-processing records, retention controls, consent logs

## Later
- [ ] Coding assistant: VS Code / JetBrains plugins, agent mode on private models
- [ ] Desktop and mobile clients
- [ ] Academic tier: campus SSO, per-student quotas, faculty dashboards
