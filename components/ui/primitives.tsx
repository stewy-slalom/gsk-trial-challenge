import type { ReactNode } from "react";
import type { Autonomy, Confidence, StatusTone } from "@/lib/types";
import { Alert, Check, Sparkle } from "./icons";

// ---------- Card ----------
export function Card({
  children,
  className = "",
  interactive = false,
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "button" | "article";
  onClick?: () => void;
}) {
  return (
    <Tag
      className={`rounded-lg border border-line bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${
        interactive
          ? "text-left transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] cursor-pointer w-full"
          : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ---------- Button ----------
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ai" | "ghost";
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizing = size === "sm" ? "text-[13px] px-3 py-1.5" : "text-sm px-4 py-2.5";
  const variants: Record<string, string> = {
    primary:
      "bg-brand-orange text-white font-semibold hover:bg-brand-orange-hover disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-white border border-line text-ink font-semibold hover:bg-surface disabled:opacity-50",
    ai: "bg-ai-indigo text-white font-semibold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "text-body hover:bg-surface font-medium",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors ${sizing} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// ---------- Status pill (§9: never colour alone; paired with label) ----------
const TONE: Record<StatusTone, { fg: string; bg: string }> = {
  active: { fg: "text-[#0f7a54]", bg: "bg-[#10b981]/12" },
  paused: { fg: "text-[#a66a00]", bg: "bg-[#f59e0b]/15" },
  escalated: { fg: "text-[#c22f2f]", bg: "bg-[#ef4444]/12" },
  neutral: { fg: "text-body", bg: "bg-surface" },
  ai: { fg: "text-ai-indigo", bg: "bg-ai-indigo-tint" },
};

export function StatusPill({
  tone,
  children,
  icon,
}: {
  tone: StatusTone;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${t.fg} ${t.bg}`}
    >
      {icon}
      {children}
    </span>
  );
}

// ---------- Autonomy badge (Agent / Assist / Human, §2) ----------
export function AutonomyBadge({ level }: { level: Autonomy }) {
  const map: Record<Autonomy, { cls: string; icon: ReactNode }> = {
    Agent: { cls: "text-ai-indigo bg-ai-indigo-tint", icon: <Sparkle size={11} /> },
    Assist: { cls: "text-ai-teal bg-ai-teal-tint", icon: <Sparkle size={11} /> },
    Human: { cls: "text-body bg-surface", icon: <Check size={11} /> },
  };
  const m = map[level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${m.cls}`}
      title={
        level === "Agent"
          ? "Agent: automates the burden end to end, output visible and attributable"
          : level === "Assist"
            ? "Assist: drafts, flags, or recommends; a named human decides"
            : "Human: no agent action in the decision itself"
      }
    >
      {m.icon}
      {level}
    </span>
  );
}

// ---------- AI-generated badge (every agent output, §3) ----------
export function AIBadge({ working = false }: { working?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-ai-indigo-tint px-2 py-0.5 text-[11px] font-semibold text-ai-indigo">
      <Sparkle size={11} className={working ? "sparkle-working" : ""} />
      AI generated
    </span>
  );
}

// ---------- Confidence chip (§2: show uncertainty honestly) ----------
export function ConfidenceChip({ level }: { level: Confidence }) {
  const dots = level === "High" ? 3 : level === "Moderate" ? 2 : 1;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-body">
      <span className="flex gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < dots ? "bg-ai-indigo" : "bg-line"
            }`}
          />
        ))}
      </span>
      {level} confidence
    </span>
  );
}

// ---------- Section label (12px uppercase, §11) ----------
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-meta">
      {children}
    </p>
  );
}

// ---------- Insight panel (agent output, §11) ----------
export function InsightPanel({
  title,
  children,
  provenance,
  alert = false,
  accent = "indigo",
  working = false,
}: {
  title: string;
  children: ReactNode;
  provenance?: string;
  alert?: boolean;
  accent?: "indigo" | "teal";
  working?: boolean;
}) {
  const bg = accent === "teal" ? "bg-ai-teal-tint" : "bg-ai-indigo-tint";
  const fg = accent === "teal" ? "text-ai-teal" : "text-ai-indigo";
  return (
    <section className={`rounded-lg ${bg} p-4`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkle size={14} className={`${fg} ${working ? "sparkle-working" : ""}`} />
          <span className={`text-xs font-semibold uppercase tracking-wide ${fg}`}>
            {title}
          </span>
        </div>
        {alert && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-escalated">
            <span className="h-2 w-2 rounded-full bg-escalated pulse-dot" />
            Alert
          </span>
        )}
      </div>
      <div className="text-sm text-ink">{children}</div>
      {provenance && (
        <p className="mt-3 flex items-start gap-1.5 border-t border-black/5 pt-2 text-[11px] text-body">
          <Alert size={12} className="mt-px shrink-0 opacity-60" />
          <span>Source: {provenance}</span>
        </p>
      )}
    </section>
  );
}

// ---------- Progress bar (agent in-flight, §8) ----------
export function ProgressBar({
  value,
  indeterminate = false,
}: {
  value?: number;
  indeterminate?: boolean;
}) {
  if (indeterminate) {
    return (
      <div className="progress-track h-1.5 w-full">
        <div className="progress-indeterminate" />
      </div>
    );
  }
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div
        className="h-full rounded-full bg-ai-indigo transition-all duration-300"
        style={{ width: `${Math.round((value ?? 0) * 100)}%` }}
      />
    </div>
  );
}

// ---------- Simple meter bar (diversity vs plan, funnel, etc.) ----------
export function Meter({
  value,
  max = 100,
  tone = "orange",
}: {
  value: number;
  max?: number;
  tone?: "orange" | "active" | "escalated" | "indigo";
}) {
  const colors = {
    orange: "bg-brand-orange",
    active: "bg-active",
    escalated: "bg-escalated",
    indigo: "bg-ai-indigo",
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line">
      <div
        className={`h-full rounded-full ${colors[tone]}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

// ---------- Empty state ----------
export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface px-6 py-10 text-center">
      {icon && <div className="mb-3 text-meta">{icon}</div>}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-body">{children}</p>}
    </div>
  );
}
