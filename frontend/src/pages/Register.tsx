import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ErrorNote, Field } from "../components/ui";
import { useAuth } from "../lib/auth";
import AuthShell from "./AuthShell";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ org_name: "", full_name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(form);
      nav("/console");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your organization"
      footer={
        <>
          Already have an account? <Link to="/login" className="font-medium text-ink underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Organization" required value={form.org_name} onChange={set("org_name")} placeholder="e.g. Coastal Cooperative Bank" />
        <Field label="Your name" required value={form.full_name} onChange={set("full_name")} />
        <Field label="Work email" type="email" required value={form.email} onChange={set("email")} />
        <Field label="Password" type="password" required minLength={8} value={form.password} onChange={set("password")} />
        <ErrorNote message={error} />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Creating…" : "Create organization"}
        </Button>
      </form>
    </AuthShell>
  );
}
