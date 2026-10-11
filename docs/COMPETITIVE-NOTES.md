# Competitive notes — TokenKey (tokenkey.in)

Reviewed 2026-10-11. TokenKey (built by Loukri AI) is a **hosted** OpenAI-compatible inference API running on their own NVIDIA L40S GPUs in Amaravati, Andhra Pradesh.

## What they offer
- One OpenAI-compatible API (`base_url` swap), keys prefixed `tk_live_`
- `tk-auto` router that classifies each request *before* generating, picking `tk-base` (fast), `tk-reason` (reasoning) or `tk-coder` (code, "coming shortly"); naming a model overrides the router
- Per-request records of token counts, latency/TTFT and route reason — "never the text"; usage is metered even if a client disconnects mid-stream
- No content stored; a canary test sends a marker string and scans every table
- Append-only audit trail enforced by the database; DPDP alignment "coming shortly"
- Use cases pitched: business apps, chatbots, student work, coding
- Site: dark theme, Docs / Download / Status / Changelog / Contact, invite-reviewed registration

## What we adopted (as patterns, in our own words and code)
- OpenAI-compatible gateway as the integration surface
- Classify-before-generate router with a recorded reason (`antarik-auto`)
- Metering that counts abandoned streams; content-free usage records
- Canary test for "no content stored"; append-only audit log

## How Antarik is different — lead with this
| | TokenKey | Antarik |
|---|---|---|
| Where models run | Their GPUs in Amaravati (hosted) | **The customer's own infrastructure** — on-prem, private cloud, or air-gapped |
| Who holds the data | Data stays in India, but leaves the customer | **Data never leaves the customer's perimeter** |
| Buyer | Developers, institutions buying API access | CIO/CISO at banks, insurers, hospitals, government; campus IT |
| Product surface | API (+ download client) | API **plus** chat apps, admin console, SSO/RBAC, chargeback by cost centre |
| Commercial model | Usage-based API | Per-seat or committed-usage licence + deployment/support |

RBI outsourcing rules and many bank security policies prefer, or require, that data stay inside the bank's own environment. A hosted Indian API doesn't meet that requirement; a deployment does.

**Partnership angle:** the two products can complement each other. TokenKey could be the hosted, burstable tier for customers whose rules allow it, and Antarik the in-perimeter tier.

## Look and feel
We deliberately did **not** copy their visual identity (dark background, glowing node imagery). Antarik uses a light "ink on paper" palette with one saffron accent and a serif display face, which reads as institutional and trustworthy to bank and government buyers, and keeps the two brands distinct.
