---
description: Write a summary of the work just done into today's worklog
argument-hint: "[optional focus or note]"
---

Add an entry to today's worklog at `.claude/worklog/YYYY-MM-DD.md` (local date).

1. Work out what was done since the last entry: this conversation, plus `git log --oneline` for today's
   commits and `git status --short` for uncommitted work. Extra note from the user: $ARGUMENTS
2. If the file doesn't exist, create it with this skeleton:
   ```
   # Worklog YYYY-MM-DD

   ## Entries

   ## Auto log
   ```
3. Insert a new `### <short title>` section at the end of `## Entries`, **above** `## Auto log`
   (the SessionEnd hook appends below that heading — never edit or remove those lines). Use only the
   bullets that apply:
   - **Done:** what changed and why, with commit hashes
   - **Decisions:** choices made and the reason, so nobody re-litigates them
   - **Blockers:** what's stuck and on whom
   - **Next:** concrete next steps
4. Keep it short and factual. Never paste prompt/completion text, secrets, API keys or `.env` values.
5. Show the user the entry you added. Don't commit unless they ask.
