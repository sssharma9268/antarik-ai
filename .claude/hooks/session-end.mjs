// SessionEnd: append a mechanical record of this session (commits + uncommitted files)
// to today's worklog. Sessions that changed nothing leave no entry.
import { appendFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  clock, dayHeader, existsSync, git, projectDir, readStdinJson, stateDir, today, worklogDir,
} from "./lib.mjs";

const input = readStdinJson();
const dir = projectDir(input);
const sessionId = input.session_id || "unknown";
const statePath = join(stateDir(dir), `${sessionId}.json`);

let state = {};
try {
  state = JSON.parse(readFileSync(statePath, "utf8"));
} catch {
  // No start record (hook added mid-session): still log uncommitted work.
}

const range = state.startSha ? `${state.startSha}..HEAD` : null;
const commits = range
  ? git(dir, ["log", "--reverse", "--format=%h %s", range]).split("\n").filter(Boolean)
  : [];
const dirty = git(dir, ["status", "--porcelain"]).split("\n").filter(Boolean)
  // the worklog itself is always dirty after a session; don't count it
  .filter((l) => !l.includes(".claude/worklog/"));

if (commits.length || dirty.length) {
  const date = today();
  const file = join(worklogDir(dir), `${date}.md`);
  if (!existsSync(file)) writeFileSync(file, dayHeader(date));

  const span = state.startedAt ? `${state.startedAt}–${clock()}` : `ended ${clock()}`;
  const out = [`- **${span}** session \`${sessionId.slice(0, 8)}\` (${input.reason || "ended"})`];
  for (const c of commits) out.push(`  - commit ${c}`);
  if (dirty.length) out.push(`  - ${dirty.length} uncommitted file(s): ${dirty.slice(0, 8).map((l) => l.slice(3)).join(", ")}${dirty.length > 8 ? ", …" : ""}`);
  appendFileSync(file, out.join("\n") + "\n");
}

rmSync(statePath, { force: true });
