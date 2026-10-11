# .claude — Claude Code setup for this repo

| Path | What it does | Committed |
|---|---|---|
| `settings.json` | Shared permissions and hooks for everyone working on the repo | yes |
| `settings.local.json` | Your personal overrides (create it if you need it) | no |
| `worklog/YYYY-MM-DD.md` | Daily log of work done | yes |
| `hooks/` | Node scripts the hooks run (no dependencies) | yes |
| `commands/` | Project slash commands | yes |
| `agents/` | Project subagents | yes |
| `state/` | Hook scratch data, e.g. which commit a session started at | no |

## Daily worklog

Each day gets one file, `worklog/YYYY-MM-DD.md`, with two sections:

- **Entries**: written summaries (what was done, decisions, blockers, next steps). Run `/log` after a piece
  of work, or ask Claude to "log this".
- **Auto log**: added automatically when a Claude Code session ends. It lists the session's commits and any
  uncommitted files, so you have a record even if nobody ran `/log`. Sessions that changed nothing add no line.

When a session starts, Claude is shown the latest worklog and the git status, so it can pick up where the
last session stopped.

Commit the worklog along with your other changes.

## Slash commands

| Command | Use it to |
|---|---|
| `/log [note]` | Add a written entry to today's worklog |
| `/standup` | Get a yesterday / today / blockers update from the worklog and git |
| `/check` | Run backend tests and lint, plus the frontend typecheck and build |
| `/dev` | Start the backend and frontend locally and check they respond |

## Agents

- **rules-reviewer**: checks backend changes against the five non-negotiable rules in `CLAUDE.md`. Ask Claude
  to "run the rules-reviewer" before committing changes to the gateway, metering, models, auth or keys.

## Permissions

`settings.json` pre-approves read-only git commands, tests, lint and builds. It blocks Claude from reading
`.env` files and local `.db` files, which hold secrets and local data.

## Hooks need Node

The hooks run `node`, which every developer already has for the frontend. If one fails, Claude Code
reports it and carries on. Review or disable hooks with `/hooks`.
