// SessionStart: remember where HEAD was (so SessionEnd can list this session's commits)
// and give Claude the latest worklog + git state as context.
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import {
  clock, existsSync, git, latestWorklog, projectDir, readStdinJson, stateDir, today,
} from "./lib.mjs";

const input = readStdinJson();
const dir = projectDir(input);
const sessionId = input.session_id || "unknown";

const statePath = join(stateDir(dir), `${sessionId}.json`);
if (!existsSync(statePath)) {
  writeFileSync(statePath, JSON.stringify({ startSha: git(dir, ["rev-parse", "HEAD"]), startedAt: clock() }));
}

const lines = [`Today is ${today()}. Worklog: .claude/worklog/${today()}.md`];

const branch = git(dir, ["branch", "--show-current"]);
const dirty = git(dir, ["status", "--porcelain"]).split("\n").filter(Boolean).length;
lines.push(`Git: branch ${branch || "(detached)"}, ${dirty} uncommitted file(s).`);

const latest = latestWorklog(dir);
if (latest) {
  const tail = readFileSync(latest, "utf8").trim().split("\n").slice(-40).join("\n");
  lines.push(`\nMost recent worklog (${basename(latest)}, last 40 lines):\n${tail}`);
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: lines.join("\n") },
}));
