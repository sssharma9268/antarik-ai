import { useRef, useState, type FormEvent } from "react";
import { Button, ErrorNote } from "../../components/ui";
import { streamChat, type ChatMessage } from "../../lib/api";

const MODELS = ["antarik-auto", "antarik-fast", "antarik-reason", "antarik-code"];

export default function Playground() {
  const [model, setModel] = useState(MODELS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [route, setRoute] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setError(null);
    abort.current = new AbortController();
    try {
      const r = await streamChat(
        model,
        history,
        (delta) =>
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + delta };
            return copy;
          }),
        abort.current.signal,
      );
      setRoute(r);
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-4xl flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Playground</h1>
        <div className="flex items-center gap-3 text-sm">
          {route && <span className="font-mono text-xs text-ink-3">route: {route}</span>}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 font-mono text-sm"
          >
            {MODELS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <Button variant="ghost" className="py-1.5" onClick={() => { setMessages([]); setRoute(null); }}>
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-line bg-white p-5">
        {messages.length === 0 && (
          <p className="text-sm text-ink-3">
            Send a message. With <span className="font-mono">antarik-auto</span>, the gateway picks the model and shows
            you why.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-[15px] leading-relaxed ${
                m.role === "user" ? "bg-ink text-paper" : "bg-paper-2 text-ink"
              }`}
            >
              {m.content || (busy && i === messages.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}
      </div>

      <ErrorNote message={error} />
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something…"
          className="flex-1 rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
        />
        {busy ? (
          <Button type="button" variant="ghost" onClick={() => abort.current?.abort()}>Stop</Button>
        ) : (
          <Button type="submit">Send</Button>
        )}
      </form>
    </div>
  );
}
