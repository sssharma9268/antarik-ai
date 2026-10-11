import { useEffect, useState } from "react";
import { Card, ErrorNote, PageHeader } from "../../components/ui";
import { api, type UsageSummary } from "../../lib/api";

const fmt = (n: number) => n.toLocaleString("en-IN");

export default function Overview() {
  const [data, setData] = useState<UsageSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<UsageSummary>("/api/usage/summary").then(setData).catch((e) => setError(e.message));
  }, []);

  const month = data
    ? new Date(data.period_start).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="max-w-5xl">
      <PageHeader title="Overview" subtitle={month ? `Usage for ${month}, across your organization` : undefined} />
      <ErrorNote message={error} />

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Requests" value={fmt(data.requests)} />
            <Stat label="Input tokens" value={fmt(data.prompt_tokens)} />
            <Stat label="Output tokens" value={fmt(data.completion_tokens)} />
            <Stat label="Avg latency" value={data.avg_latency_ms != null ? `${Math.round(data.avg_latency_ms)} ms` : "—"} />
          </div>

          <Card className="mt-6 p-0">
            <div className="border-b border-line px-5 py-3 text-sm font-medium">By model</div>
            {data.by_model.length === 0 ? (
              <p className="px-5 py-8 text-sm text-ink-3">
                No requests yet this month. Try the Playground or create an API key.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-ink-3">
                  <tr>
                    <th className="px-5 py-2 font-medium">Model</th>
                    <th className="px-5 py-2 text-right font-medium">Requests</th>
                    <th className="px-5 py-2 text-right font-medium">Input</th>
                    <th className="px-5 py-2 text-right font-medium">Output</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_model.map((m) => (
                    <tr key={m.model} className="border-t border-line">
                      <td className="px-5 py-2.5 font-mono">{m.model}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums">{fmt(m.requests)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums">{fmt(m.prompt_tokens)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums">{fmt(m.completion_tokens)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <div className="text-sm text-ink-3">{label}</div>
      <div className="mt-1 font-display text-3xl font-semibold tabular-nums">{value}</div>
    </Card>
  );
}
