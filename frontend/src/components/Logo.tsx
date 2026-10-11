import { Link } from "react-router-dom";

/** Mark: a square perimeter with a saffron core — the model lives inside your walls. */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--color-ink)" />
      <rect x="7" y="7" width="18" height="18" rx="4" fill="none" stroke="var(--color-paper)" strokeWidth="2" />
      <circle cx="16" cy="16" r="4" fill="var(--color-kesar)" />
    </svg>
  );
}

export default function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 text-ink">
      <Mark />
      <span className="font-display text-xl font-semibold tracking-tight">
        Antarik<span className="text-kesar">.</span>
      </span>
    </Link>
  );
}
