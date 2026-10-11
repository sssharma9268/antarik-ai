// Shared helpers for the worklog hooks. Node built-ins only, so hooks work anywhere Node 20+ runs.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function readStdinJson() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function projectDir(input) {
  return process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
}

export function git(dir, args) {
  try {
    // trimEnd only: `git status --porcelain` lines start with a meaningful space
    return execFileSync("git", args, { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trimEnd();
  } catch {
    return "";
  }
}

// Local date/time, not UTC: a worklog day should match the developer's day.
export function today(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function clock(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function worklogDir(dir) {
  const w = join(dir, ".claude", "worklog");
  mkdirSync(w, { recursive: true });
  return w;
}

export function stateDir(dir) {
  const s = join(dir, ".claude", "state", "sessions");
  mkdirSync(s, { recursive: true });
  return s;
}

export function latestWorklog(dir) {
  const w = worklogDir(dir);
  const files = readdirSync(w).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort();
  return files.length ? join(w, files[files.length - 1]) : null;
}

export function dayHeader(date) {
  return `# Worklog ${date}\n\n## Entries\n\n## Auto log\n`;
}

export { existsSync } from "node:fs";
