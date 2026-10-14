"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/primitives";
import { Lock, Shield, Sparkle } from "@/components/ui/icons";

// §4 Access control: entire application behind authentication; no publicly
// viewable content pre-login. This is a demonstration gate — a real
// deployment enforces server-side auth, MFA, rate limiting, and lockout
// before any content is served. Nothing sensitive is rendered until unlock.
const DEMO_USER = "reviewer";
const DEMO_PASS = "corvane-phase2";
const KEY = "ctp-auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAuthed(sessionStorage.getItem(KEY) === "1");
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (user.trim() === DEMO_USER && pass === DEMO_PASS) {
      sessionStorage.setItem(KEY, "1");
      setAuthed(true);
      setError("");
    } else {
      setError("Those credentials were not recognised. Please try again.");
    }
  }

  if (authed === null) return null; // avoid flash of gated content
  if (authed) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/corvane-logo.svg" alt="Corvane" className="mb-5 h-9 w-auto" />
          <h1 className="font-brand text-xl font-semibold text-ink">
            Connected Trial Platform
          </h1>
          <p className="mt-1.5 text-sm text-body">
            Phase II oncology recruitment and enrolment. Sign in to continue.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-lg border border-line bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
        >
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="u">
            Username
          </label>
          <input
            id="u"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            className="mb-4 h-10 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-orange"
          />
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="p">
            Password
          </label>
          <input
            id="p"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            className="mb-4 h-10 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-orange"
          />
          {error && (
            <p className="mb-3 rounded-md bg-[#ef4444]/10 px-3 py-2 text-[13px] text-escalated">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full">
            <Lock size={15} /> Sign in
          </Button>
        </form>

        <div className="mt-4 rounded-lg border border-line bg-white p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-meta">
            <Sparkle size={11} className="text-ai-indigo" /> Demo access
          </p>
          <p className="mt-1 text-[13px] text-body">
            Username <span className="font-semibold text-ink">{DEMO_USER}</span>{" "}
            · Password <span className="font-semibold text-ink">{DEMO_PASS}</span>
          </p>
        </div>

        <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-meta">
          <Shield size={13} className="mt-px shrink-0" />
          <span>
            Locked, private system. No tracking, no third parties, all assets
            self-hosted. All data shown is representative and for demo purposes
            only — not real patient or trial data.
          </span>
        </p>
      </div>
    </div>
  );
}

export function signOut() {
  sessionStorage.removeItem(KEY);
  location.reload();
}
