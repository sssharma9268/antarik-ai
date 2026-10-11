import { useState } from "react";

export default function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-ink/80 bg-ink text-paper shadow-[0_1px_0_rgba(0,0,0,.04)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-xs text-paper/60">
        <span>{title ?? "example"}</span>
        <button onClick={copy} className="rounded px-2 py-0.5 hover:bg-white/10 hover:text-paper">
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}
