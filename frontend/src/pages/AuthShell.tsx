import type { ReactNode } from "react";
import Logo from "../components/Logo";

export default function AuthShell({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-7">
        <h1 className="mb-5 font-display text-2xl font-semibold">{title}</h1>
        {children}
      </div>
      <div className="mt-5 text-sm text-ink-3">{footer}</div>
    </div>
  );
}
