import type { ReactNode } from "react";
import { Check, Clock, Sparkle } from "@/components/ui/icons";

// Shared presentational pieces for the full-page patient detail views used by
// both Site Team and Trial Operations.

export interface CriteriaItem {
  title: string;
  detail: string;
  status: "met" | "pending" | "fail";
}

export function BiomarkerChips({ biomarker }: { biomarker: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {biomarker.split(",").map((b) => (
        <span
          key={b}
          className="rounded-md bg-ai-teal-tint px-2 py-1 text-[12px] font-semibold text-ai-teal"
        >
          {b.trim()}
        </span>
      ))}
    </div>
  );
}

export function StatusBanner({
  tone,
  children,
}: {
  tone: "eligible" | "info" | "warn" | "fail";
  children: ReactNode;
}) {
  const map = {
    eligible: "bg-active/10 text-[#0f7a54]",
    info: "bg-ai-indigo-tint text-ai-indigo",
    warn: "bg-paused/12 text-[#a66a00]",
    fail: "bg-escalated/10 text-escalated",
  };
  return (
    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${map[tone]}`}>
      {children}
    </div>
  );
}

export function AgentAssessment({
  text,
  provenance,
}: {
  text: string;
  provenance?: string;
}) {
  return (
    <section className="rounded-lg bg-ai-teal-tint p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkle size={14} className="text-ai-teal" />
        <span className="text-xs font-semibold uppercase tracking-wide text-ai-teal">
          Agent assessment
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-1.5 py-0.5 text-[11px] font-semibold text-ai-teal">
          <Sparkle size={10} /> AI-generated
        </span>
      </div>
      <p className="text-sm text-ink">{text}</p>
      {provenance && (
        <p className="mt-3 border-t border-black/5 pt-2 text-[11px] text-body">
          Source: {provenance}
        </p>
      )}
    </section>
  );
}

export function InclusionCriteria({ items }: { items: CriteriaItem[] }) {
  const met = items.filter((i) => i.status === "met").length;
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <h3 className="text-base font-semibold text-ink">Inclusion criteria review</h3>
      <p className="mt-0.5 text-[13px] text-meta">
        {met} of {items.length} criteria met — human confirmation required
      </p>
      <div className="mt-4 space-y-3">
        {items.map((c) => (
          <div
            key={c.title}
            className="flex items-start gap-3 rounded-lg border border-line p-4"
          >
            <span className="mt-0.5 shrink-0">
              {c.status === "met" && <Check size={18} className="text-active" />}
              {c.status === "pending" && (
                <Clock size={18} className="text-[#a66a00]" />
              )}
              {c.status === "fail" && (
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-escalated text-[11px] font-bold text-white">
                  ✕
                </span>
              )}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{c.title}</p>
              <p className="text-[13px] text-body">{c.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Small labelled section title used across the detail pages.
export function DetailSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-meta">
      {children}
    </p>
  );
}
