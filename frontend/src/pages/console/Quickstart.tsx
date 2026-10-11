import CodeBlock from "../../components/CodeBlock";
import { PageHeader } from "../../components/ui";

const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

const PY = `from openai import OpenAI

client = OpenAI(base_url="${origin}/v1", api_key="ak_live_...")

stream = client.chat.completions.create(
    model="antarik-auto",
    messages=[{"role": "user", "content": "Explain UPI settlement in 3 lines"}],
    stream=True,
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")`;

const CURL = `curl ${origin}/v1/chat/completions \\
  -H "Authorization: Bearer ak_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"model": "antarik-auto", "messages": [{"role": "user", "content": "hello"}]}'`;

const MODELS = [
  ["antarik-auto", "Router. Picks a tier per request and records why."],
  ["antarik-fast", "Short, high-volume work: tagging, extraction, quick chat."],
  ["antarik-reason", "Multi-step reasoning, analysis and long documents."],
  ["antarik-code", "Code generation, review and debugging."],
];

export default function Quickstart() {
  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="Quickstart"
        subtitle="Any OpenAI SDK works. Point it at your Antarik gateway and use a key from the API keys page."
      />
      <section className="space-y-3">
        <h2 className="font-medium">Python</h2>
        <CodeBlock code={PY} title="quickstart.py" />
      </section>
      <section className="space-y-3">
        <h2 className="font-medium">cURL</h2>
        <CodeBlock code={CURL} title="shell" />
      </section>
      <section>
        <h2 className="mb-3 font-medium">Models</h2>
        <div className="divide-y divide-line rounded-xl border border-line bg-white">
          {MODELS.map(([id, desc]) => (
            <div key={id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:gap-6">
              <span className="w-40 shrink-0 font-mono text-sm">{id}</span>
              <span className="text-sm text-ink-2">{desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
