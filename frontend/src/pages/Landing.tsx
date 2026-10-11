import { Link } from "react-router-dom";
import CodeBlock from "../components/CodeBlock";
import Logo from "../components/Logo";

const SNIPPET = `from openai import OpenAI

client = OpenAI(
    base_url="https://ai.yourbank.internal/v1",  # your Antarik gateway
    api_key="ak_live_...",
)

client.chat.completions.create(
    model="antarik-auto",
    messages=[{"role": "user", "content": "Summarise this KYC file"}],
)`;

const PILLARS = [
  {
    k: "01",
    title: "Inference on your hardware",
    body: "GPU-optimised serving with quantisation and autoscaling, on a curated catalogue of open-weight models. Fine-tune and run RAG over internal data that never leaves the building.",
  },
  {
    k: "02",
    title: "A drop-in API gateway",
    body: "OpenAI- and Anthropic-compatible endpoints with SSO, role-based access, rate limits and audit logs. Existing apps move over by changing one URL.",
  },
  {
    k: "03",
    title: "Apps your people actually use",
    body: "Web, desktop and mobile chat clients for staff and students, plus admin consoles for IT — the hosted-AI experience, served from your own racks.",
  },
  {
    k: "04",
    title: "Metering and chargeback",
    body: "Token-level tracking by team, project and cost centre, with quotas and budgets. Finance sees exactly who used what, and IT can prove it.",
  },
];

const MODES = [
  { title: "On-premises", body: "Your data centre, your GPUs. We install, tune and support the stack." },
  { title: "Private cloud", body: "Your VPC or an Indian sovereign cloud region, isolated per tenant." },
  { title: "Air-gapped", body: "No outbound connectivity at all. Offline model updates, signed bundles." },
];

const SEGMENTS = [
  { name: "Banks & NBFCs", note: "RBI outsourcing and data-localisation ready" },
  { name: "Insurance", note: "IRDAI-aligned audit trails for claims and underwriting" },
  { name: "Capital markets", note: "SEBI cyber-resilience controls built in" },
  { name: "Hospitals", note: "Patient records stay inside the hospital network" },
  { name: "Government", note: "Air-gapped deployments for sensitive departments" },
  { name: "Colleges & universities", note: "Campus-wide AI with a low-cost academic tier" },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-line/70 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-ink-2 md:flex">
            <a href="#platform" className="hover:text-ink">Platform</a>
            <a href="#deploy" className="hover:text-ink">Deployment</a>
            <a href="#industries" className="hover:text-ink">Industries</a>
            <a href="#trust" className="hover:text-ink">Trust</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm text-ink-2 hover:text-ink">Sign in</Link>
            <Link to="/register" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-2">
              Start a pilot
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-kesar" /> Sovereign AI for Indian institutions
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Private AI,
            <br />
            <span className="italic text-kesar">inside</span> your perimeter.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Antarik runs production-grade language models on your own infrastructure — with the same APIs and apps
            as a hosted AI service. Your prompts, documents and data never leave your walls.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-2">
              Start a paid pilot
            </Link>
            <a href="#platform" className="rounded-lg border border-line px-5 py-3 text-sm font-medium hover:bg-paper-2">
              See the platform
            </a>
          </div>
          <p className="mt-6 text-sm text-ink-3">DPDP Act · RBI · SEBI · IRDAI — built for the rules you already work under.</p>
        </div>
        <CodeBlock code={SNIPPET} title="app.py — the only change is base_url" />
      </section>

      {/* Platform */}
      <section id="platform" className="border-y border-line bg-paper-2/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            One stack, from GPU to chat window.
          </h2>
          <p className="mt-3 max-w-2xl text-ink-2">
            Everything a hosted AI provider gives you, packaged to install inside a bank, a hospital or a campus.
          </p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div key={p.k} className="bg-paper p-7">
                <span className="font-mono text-xs text-kesar">{p.k}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{p.body}</p>
              </div>
            ))}
          </div>

          {/* Request flow */}
          <div className="mt-14 rounded-2xl border border-line bg-white p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold">How a request moves</h3>
            <p className="mt-1 text-sm text-ink-3">
              Ask for <code className="font-mono text-ink">antarik-auto</code> and the gateway picks the right model
              before generating. Name a model and it is honoured exactly.
            </p>
            <div className="mt-6 grid items-center gap-3 font-mono text-sm md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <FlowBox title="Your apps" items={["Chat client", "Internal tools", "IDE plugin"]} />
              <Arrow />
              <FlowBox title="Antarik gateway" items={["SSO · RBAC", "Router", "Quota check"]} accent />
              <Arrow />
              <FlowBox title="Models on your GPUs" items={["antarik-fast", "antarik-reason", "antarik-code"]} />
            </div>
            <p className="mt-5 text-sm text-ink-2">
              Recorded per request: token counts, latency, time-to-first-token and routing reason.{" "}
              <strong className="font-semibold text-ink">Never the text.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Deployment */}
      <section id="deploy" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Deploy where your data already lives.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {MODES.map((m) => (
            <div key={m.title} className="rounded-2xl border border-line bg-white p-6">
              <h3 className="font-display text-lg font-semibold">{m.title}</h3>
              <p className="mt-2 text-ink-2">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Built for regulated work.</h2>
          <div className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {SEGMENTS.map((s) => (
              <div key={s.name} className="border-t border-white/15 pt-4">
                <h3 className="font-medium">{s.name}</h3>
                <p className="mt-1 text-sm text-paper/65">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Nothing leaves. Everything is accounted for.
          </h2>
          <ul className="space-y-5 text-ink-2">
            <TrustItem title="No content stored by default">
              Prompts and completions are never written to disk. A canary test in our CI proves it on every build.
            </TrustItem>
            <TrustItem title="Append-only audit trail">
              Every key, login and admin change is logged, and the log cannot be edited — enforced by the database.
            </TrustItem>
            <TrustItem title="No lock-in">
              Standard OpenAI-compatible APIs and open-weight models. Your code and your fine-tunes stay portable.
            </TrustItem>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-line bg-paper-2 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-semibold">Run a pilot in your own environment.</h2>
            <p className="mt-1 text-ink-2">Four to six weeks, one team, measurable results.</p>
          </div>
          <Link to="/register" className="rounded-lg bg-kesar px-5 py-3 text-sm font-medium text-white hover:bg-kesar-dark">
            Talk to us
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-ink-3 sm:px-6">
          <Logo />
          <span>© {new Date().getFullYear()} Antarik AI · antarikai.in</span>
        </div>
      </footer>
    </div>
  );
}

function FlowBox({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-kesar/50 bg-kesar/5" : "border-line bg-paper"}`}>
      <div className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-3">{title}</div>
      {items.map((i) => (
        <div key={i} className="py-0.5 text-ink">{i}</div>
      ))}
    </div>
  );
}

function Arrow() {
  return <div className="text-center text-ink-3 md:rotate-0 rotate-90">→</div>;
}

function TrustItem({ title, children }: { title: string; children: string }) {
  return (
    <li className="border-l-2 border-kesar pl-4">
      <div className="font-medium text-ink">{title}</div>
      <p className="mt-1">{children}</p>
    </li>
  );
}
