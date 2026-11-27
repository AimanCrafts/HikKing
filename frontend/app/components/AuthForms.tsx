"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, logoutUser, registerUser, saveToken, saveUser } from "../lib/api";
import { Button, Icon, IconButton, Label, Logo, Photo } from "./ui";

function AuthShell({ title, sub, children, image = "/hero/rangamati.jpg", quote }: { title: string; sub: string; children: React.ReactNode; image?: string; quote: string }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-jade-deep text-white lg:block">
        <Photo src={image} alt="" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06140f]/90 via-[#06140f]/30 to-[#06140f]/40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" aria-label="HikKing home"><Logo light /></Link>
          <p className="max-w-md text-4xl font-black leading-[1.1] tracking-tight">{quote}</p>
        </div>
      </aside>
      <main className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between lg:hidden">
          <Link href="/" aria-label="HikKing home"><Logo /></Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="t-h1 text-ink">{title}</h1>
          <p className="mt-3 text-[15.5px] text-ink2">{sub}</p>
          <div className="mt-9">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function PasswordField({ id, value, onChange, label = "Password", autoComplete }: { id: string; value: string; onChange: (v: string) => void; label?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block" htmlFor={id}>
      <Label>{label}</Label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} required autoComplete={autoComplete} className="field !pr-12" />
        <IconButton icon="eye" label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)} size={36} className={`!absolute right-1.5 top-1/2 -translate-y-1/2 ${show ? "text-jade" : "text-ink3"}`} />
      </div>
    </label>
  );
}

function ErrorNote({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft p-3.5 text-sm font-bold text-danger">
      <Icon name="alert" size={17} className="mt-0.5" /> {text}
    </p>
  );
}

export function LoginForm({ adminOnly = false }: { adminOnly?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user, token } = await loginUser({ email, password });
      saveToken(token);
      if (adminOnly && user.role !== "admin") {
        await logoutUser().catch(() => {});
        throw new Error("This account doesn\u2019t have admin access.");
      }
      saveUser(user);
      if (user.role === "admin") router.push(adminOnly || !next ? "/admin" : next);
      else router.push(next && next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email or password is incorrect.");
    } finally {
      setLoading(false);
    }
  }

  const dev = process.env.NODE_ENV !== "production";

  return (
    <AuthShell
      title={adminOnly ? "Admin sign in" : "Welcome back"}
      sub={adminOnly ? "Manage tours, reservations and traveler stories." : "Log in to see your trips, saved places and notifications."}
      quote={adminOnly ? "Everything about the trips, in one place." : "Pick up where you left off."}
      image={adminOnly ? "/hero/sylhet.jpg" : "/hero/rangamati.jpg"}
    >
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <Label>Email</Label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className="field" />
        </label>
        <PasswordField id="password" value={password} onChange={setPassword} autoComplete="current-password" />
        <ErrorNote text={error} />
        <Button type="submit" size="lg" full loading={loading}>Log in</Button>
      </form>

      {dev && (
        <div className="mt-6 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-ink3">
          Demo:
          <button type="button" onClick={() => { setEmail("admin@hikking.com"); setPassword("password123"); }} className="rounded-full bg-sunk px-3 py-1.5 font-extrabold text-ink2 hover:text-ink">Admin</button>
          {!adminOnly && <button type="button" onClick={() => { setEmail("traveler@test.com"); setPassword("password123"); }} className="rounded-full bg-sunk px-3 py-1.5 font-extrabold text-ink2 hover:text-ink">Traveler</button>}
        </div>
      )}

      {!adminOnly && (
        <p className="mt-8 text-[15px] font-semibold text-ink2">
          New to HikKing? <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-extrabold text-jade hover:underline">Create an account</Link>
        </p>
      )}
    </AuthShell>
  );
}

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (f.password.length < 8) return setError("Use at least 8 characters for your password.");
    if (f.password !== f.confirm) return setError("The two passwords don\u2019t match.");
    setLoading(true);
    try {
      const { user, token } = await registerUser({ name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() || undefined, password: f.password, password_confirmation: f.confirm });
      saveToken(token);
      saveUser(user);
      router.push(next && next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" sub="Reserve trips, save places and share your own stories." quote="Your next weekend is one request away." image="/hero/coxsbazar.jpg">
      <form onSubmit={submit} className="space-y-5">
        <label className="block"><Label>Full name</Label><input value={f.name} onChange={set("name")} required autoComplete="name" className="field" /></label>
        <label className="block"><Label>Email</Label><input type="email" value={f.email} onChange={set("email")} required autoComplete="email" className="field" /></label>
        <label className="block"><Label hint="Optional">Phone</Label><input type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="01XXXXXXXXX" className="field" /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField id="pw" value={f.password} onChange={(v) => setF((s) => ({ ...s, password: v }))} autoComplete="new-password" />
          <PasswordField id="pw2" label="Confirm" value={f.confirm} onChange={(v) => setF((s) => ({ ...s, confirm: v }))} autoComplete="new-password" />
        </div>
        <ErrorNote text={error} />
        <Button type="submit" size="lg" full loading={loading}>Create account</Button>
      </form>
      <p className="mt-8 text-[15px] font-semibold text-ink2">
        Already have an account? <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-extrabold text-jade hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}
