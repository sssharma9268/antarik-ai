import { useEffect, useState, type FormEvent } from "react";
import CodeBlock from "../../components/CodeBlock";
import { Button, Card, ErrorNote, PageHeader } from "../../components/ui";
import { api, type ApiKey } from "../../lib/api";

export default function Keys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => api<ApiKey[]>("/api/keys").then(setKeys).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const k = await api<ApiKey & { key: string }>("/api/keys", {
        method: "POST",
        body: JSON.stringify({ name: name || "Untitled key" }),
      });
      setFresh(k.key);
      setName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create key");
    }
  };

  const revoke = async (id: string) => {
    await api(`/api/keys/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title="API keys" subtitle="Keys authenticate your apps against the OpenAI-compatible gateway." />
      <ErrorNote message={error} />

      <Card className="mb-6">
        <form onSubmit={create} className="flex flex-wrap gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name, e.g. claims-bot-prod"
            className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <Button type="submit">Create key</Button>
        </form>
        {fresh && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-kesar-dark">
              Copy this key now — it will not be shown again.
            </p>
            <CodeBlock code={fresh} title="new API key" />
          </div>
        )}
      </Card>

      <Card className="p-0">
        {keys.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-3">No keys yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-ink-3">
              <tr>
                <th className="px-5 py-2 font-medium">Name</th>
                <th className="px-5 py-2 font-medium">Key</th>
                <th className="hidden px-5 py-2 font-medium sm:table-cell">Last used</th>
                <th className="px-5 py-2" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-t border-line">
                  <td className="px-5 py-2.5">{k.name}</td>
                  <td className="px-5 py-2.5 font-mono text-ink-2">{k.prefix}…</td>
                  <td className="hidden px-5 py-2.5 text-ink-3 sm:table-cell">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleString("en-IN") : "Never"}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    {k.revoked ? (
                      <span className="text-ink-3">Revoked</span>
                    ) : (
                      <Button variant="danger" className="px-3 py-1" onClick={() => revoke(k.id)}>
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
