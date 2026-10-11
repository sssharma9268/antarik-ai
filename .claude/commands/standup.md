---
description: Standup update (yesterday / today / blockers) from the worklog and git
---

Write a standup update.

1. Read the two most recent files in `.claude/worklog/` and run
   `git log --since="2 days ago" --format="%h %ad %s" --date=short`.
2. Reply in this shape, a few bullets each, plain language:
   - **Yesterday** (or the last working day with entries): what shipped, with commit hashes
   - **Today:** taken from the latest **Next:** bullets, plus anything the user said
   - **Blockers:** from **Blockers:** bullets; say "None" if there are none
3. Don't invent work that isn't in the logs or git history. Don't write to any file.
