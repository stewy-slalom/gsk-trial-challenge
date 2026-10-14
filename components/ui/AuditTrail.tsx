"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { AuditCategory } from "@/lib/data";
import type { AuditItem } from "@/lib/audit";
import { Alert, Clock, Sparkle } from "./icons";

const AUDIT_TONE: Record<AuditCategory, string> = {
  Milestone: "text-[#0f7a54] bg-[#10b981]/12",
  Criteria: "text-ai-indigo bg-ai-indigo-tint",
  Enrolment: "text-brand-orange bg-brand-orange/10",
  Diversity: "text-ai-teal bg-ai-teal-tint",
  Consent: "text-ai-indigo bg-ai-indigo-tint",
  Activation: "text-[#a66a00] bg-[#f59e0b]/15",
  "Early warning": "text-[#c22f2f] bg-[#ef4444]/12",
  Access: "text-body bg-surface",
};

// Shared timeline used everywhere an audit trail is shown.
export function AuditTrail({ entries }: { entries: AuditItem[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-meta">No recorded events yet.</p>;
  }
  return (
    <ol className="relative space-y-3 border-l border-line pl-5">
      {entries.map((e, i) => {
        const isAgent = e.actor === "Agent";
        return (
          <li key={i} className="relative">
            <span
              className={`absolute -left-[26px] top-4 h-2.5 w-2.5 rounded-full ${
                e.category === "Early warning"
                  ? "bg-escalated"
                  : isAgent
                    ? "bg-ai-indigo"
                    : "bg-brand-orange"
              }`}
              aria-hidden
            />
            <div className="rounded-lg border border-line bg-white p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                {e.category && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${AUDIT_TONE[e.category]}`}
                  >
                    {e.category === "Early warning" && <Alert size={11} />}
                    {isAgent && e.category !== "Early warning" && (
                      <Sparkle size={11} />
                    )}
                    {e.category}
                  </span>
                )}
                {e.context && (
                  <span className="text-[12px] font-medium text-ink">
                    {e.context}
                  </span>
                )}
                <span className="ml-auto text-[12px] text-meta">
                  {e.date}
                  {e.time ? ` · ${e.time}` : ""}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-ink">{e.event}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[12px] text-meta">
                {isAgent && <Sparkle size={12} className="text-ai-indigo" />}
                <span className={isAgent ? "font-medium text-ai-indigo" : ""}>
                  {e.actor}
                </span>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---- Provider + modal so any entry can open its audit log ----
interface AuditPayload {
  title: string;
  subtitle?: string;
  entries: AuditItem[];
}
interface AuditCtx {
  open: (p: AuditPayload) => void;
}
const Ctx = createContext<AuditCtx | null>(null);

export function useAudit(): AuditCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAudit must be used within an AuditProvider");
  return c;
}

export function AuditProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<AuditPayload | null>(null);
  const open = useCallback((p: AuditPayload) => setPayload(p), []);
  const close = useCallback(() => setPayload(null), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPayload(null);
    }
    if (payload) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [payload]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {payload && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/25 fade-in"
            onClick={close}
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="Audit log"
            className="fade-up relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(0,0,0,0.14)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Clock size={18} className="text-brand-orange" />
                <div>
                  <h2 className="text-base font-semibold text-ink">Audit log</h2>
                  <p className="text-[12px] text-meta">
                    {payload.title}
                    {payload.subtitle ? ` · ${payload.subtitle}` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className="rounded-full p-1.5 text-body hover:bg-surface"
                aria-label="Close audit log"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <AuditTrail entries={payload.entries} />
            </div>
            <p className="border-t border-line bg-surface px-5 py-2.5 text-[11px] text-meta">
              Immutable, attributable record. Every entry is time-stamped and
              written to the validated audit store (§4).
            </p>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

// Consistent "Audit log" affordance. Rendered as a span with a button role so
// it can sit safely inside card/row buttons without nesting <button> elements.
export function AuditLogButton({
  onClick,
  className = "",
  label = "Audit log",
}: {
  onClick: () => void;
  className?: string;
  label?: string;
}) {
  const activate = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    onClick();
  };
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") activate(e);
      }}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[12px] font-medium text-body transition-colors hover:border-brand-orange hover:text-brand-orange ${className}`}
    >
      <Clock size={13} /> {label}
    </span>
  );
}
