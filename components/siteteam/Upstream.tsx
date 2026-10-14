"use client";

import { useState } from "react";
import {
  PATHWAY_LEGEND,
  UPSTREAM,
  type RecruitmentPathway,
} from "@/lib/data";
import { AutonomyBadge, Button } from "@/components/ui/primitives";
import { useAgentRun } from "@/lib/agent";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Minus,
  Sparkle,
  TrendDown,
  TrendUp,
} from "@/components/ui/icons";

type UpstreamTab = "funnel" | "criteria" | "pathways";

// Site Team "Upstream": the deliberate before-stage that widens the funnel
// (spec §6.2). Funnel, eligibility-criteria breadth, and recruitment pathways.
export function Upstream({
  onNavigate,
}: {
  onNavigate: (view: string) => void;
}) {
  const [tab, setTab] = useState<UpstreamTab>("funnel");
  const TABS: { id: UpstreamTab; label: string; count: number }[] = [
    { id: "funnel", label: "Funnel", count: UPSTREAM.funnel.identified },
    { id: "criteria", label: "Eligibility criteria", count: 0 },
    { id: "pathways", label: "Recruitment pathways", count: UPSTREAM.funnel.identified },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-body">
          Trial: <span className="font-semibold text-ink">{UPSTREAM.trialCode}</span>
        </p>
        <button
          onClick={() => onNavigate("pipeline")}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface"
        >
          <ArrowLeft size={15} /> Candidate pipeline
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-line">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-2.5 text-sm transition-colors ${
                active
                  ? "border-brand-orange font-semibold text-brand-orange"
                  : "border-transparent font-medium text-body hover:text-ink"
              }`}
            >
              {t.label}
              <span
                className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                  active ? "bg-brand-orange/10 text-brand-orange" : "bg-surface text-meta"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "funnel" && (
        <FunnelTab onTab={setTab} onNavigate={onNavigate} />
      )}
      {tab === "criteria" && <CriteriaTab />}
      {tab === "pathways" && <PathwaysTab />}
    </div>
  );
}

// ---------------- Funnel ----------------
const FUNNEL_COLORS = ["#f6cbab", "#0D9488", "#0f7a54", "#F36633"];

function FunnelTab({
  onTab,
  onNavigate,
}: {
  onTab: (t: UpstreamTab) => void;
  onNavigate: (view: string) => void;
}) {
  const f = UPSTREAM.funnel;
  const steps = [
    {
      label: "Eligible pool",
      sub: "Criteria-driven",
      n: f.eligiblePool,
      hint: "Eligibility criteria",
      go: () => onTab("criteria"),
    },
    {
      label: "Identified",
      sub: "All pathways",
      n: f.identified,
      hint: "Recruitment pathways",
      go: () => onTab("pathways"),
    },
    {
      label: "Eligible after screening",
      sub: "Human confirmed",
      n: f.eligibleAfterScreening,
      hint: "Candidate pipeline",
      go: () => onNavigate("pipeline"),
    },
    {
      label: "Enrolled",
      sub: "On trial",
      n: f.enrolled,
      hint: "On-trial patients",
      go: () => onNavigate("ontrial"),
    },
  ];
  const max = Math.max(...steps.map((s) => s.n));
  const legendTotal = PATHWAY_LEGEND.reduce((a, l) => a + l.value, 0);

  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <h3 className="text-base font-semibold text-ink">Recruitment funnel</h3>
      <p className="mt-0.5 text-[13px] text-body">
        From criteria breadth through identification to enrolment. Select a stage
        to open where it is managed.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {steps.map((s, i) => (
          <button
            key={s.label}
            onClick={s.go}
            className="group flex flex-col rounded-lg p-2 text-left transition-colors hover:bg-surface focus-visible:bg-surface"
          >
            <div className="flex h-40 items-end">
              <div
                className="w-full rounded-md transition-opacity group-hover:opacity-90"
                style={{
                  height: `${Math.max(6, (s.n / max) * 100)}%`,
                  background: FUNNEL_COLORS[i],
                }}
              />
            </div>
            <p
              className="mt-3 text-center text-2xl font-semibold"
              style={{ color: FUNNEL_COLORS[i] === "#f6cbab" ? "#F36633" : FUNNEL_COLORS[i] }}
            >
              {s.n.toLocaleString()}
            </p>
            <p className="text-center text-sm font-medium text-ink">{s.label}</p>
            <p className="text-center text-[12px] text-meta">{s.sub}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-brand-orange opacity-0 transition-opacity group-hover:opacity-100">
              {s.hint} <ChevronRight size={12} />
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8 border-t border-line pt-5">
        <h4 className="text-sm font-semibold text-ink">Identified by pathway</h4>
        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full">
          {PATHWAY_LEGEND.map((l) => (
            <div
              key={l.label}
              style={{ width: `${(l.value / legendTotal) * 100}%`, background: l.color }}
              title={`${l.label}: ${l.value}`}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PATHWAY_LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-[13px]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: l.color }}
              />
              <span className="text-body">{l.label}:</span>
              <span className="font-semibold text-ink">{l.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Recruitment pathways ----------------
const TREND: Record<
  RecruitmentPathway["trend"],
  { label: string; cls: string; icon: React.ReactNode }
> = {
  narrowing: {
    label: "Slightly narrowing",
    cls: "text-brand-orange bg-brand-orange/10",
    icon: <TrendDown size={13} />,
  },
  improving: {
    label: "Improves representativeness",
    cls: "text-[#0f7a54] bg-[#10b981]/12",
    icon: <TrendUp size={13} />,
  },
  neutral: {
    label: "Neutral",
    cls: "text-body bg-surface",
    icon: <Minus size={13} />,
  },
};

function PathwaysTab() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ink">Recruitment pathways</h3>
        <p className="mt-0.5 max-w-3xl text-sm text-body">
          Five deliberate levers to identify candidates. EHR sweep is one source,
          community reach and upstream criteria offer the biggest wins.
        </p>
      </div>
      {UPSTREAM.pathways.map((p) => (
        <PathwayCard key={p.id} pathway={p} />
      ))}
    </div>
  );
}

function PathwayCard({ pathway: p }: { pathway: RecruitmentPathway }) {
  const [showPlan, setShowPlan] = useState(false);
  const trend = TREND[p.trend];
  const run = useAgentRun({
    steps: ["Connecting to source", "Matching against protocol", "Ranking candidates"],
    duration: 2600,
    result: p.completionSummary,
  });

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:justify-between">
        <div className="lg:max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-ink">{p.name}</h4>
            <AutonomyBadge level="Assist" />
            <span className="inline-flex items-center gap-1 rounded-md bg-ai-teal-tint px-2 py-0.5 text-[11px] font-semibold text-ai-teal">
              <Sparkle size={11} /> AI-generated
            </span>
          </div>
          <p className="mt-2 text-sm text-body">{p.description}</p>
          <p className="mt-2 text-sm text-body">{p.effect}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
            <span className="text-ai-teal">
              {p.actionPlan.agent.length} agent
            </span>
            <span className="text-ai-indigo">
              {p.actionPlan.hitl.length} human-in-the-loop
            </span>
            <span className="text-body">{p.actionPlan.human.length} human</span>
            <button
              onClick={() => setShowPlan((v) => !v)}
              className="flex items-center gap-1 font-semibold text-brand-orange"
            >
              View action plan
              <ChevronRight
                size={15}
                className={`transition-transform ${showPlan ? "rotate-90" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-lg bg-surface p-4 text-center lg:w-52">
          <p className="text-[12px] text-meta">Candidates contributed</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{p.contributed}</p>
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${trend.cls}`}
          >
            {trend.icon} {trend.label}
          </span>
        </div>
      </div>

      {showPlan && (
        <div className="border-t border-line bg-surface px-5 py-4 fade-up">
          <div className="grid gap-4 sm:grid-cols-3">
            <PlanColumn title="Agent" tone="text-ai-teal" steps={p.actionPlan.agent} />
            <PlanColumn title="Human-in-the-loop" tone="text-ai-indigo" steps={p.actionPlan.hitl} />
            <PlanColumn title="Human" tone="text-body" steps={p.actionPlan.human} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {run.phase === "idle" && (
          <>
            <p className="text-[13px] text-body">
              Review the full agent, human-in-the-loop, and human steps before running.
            </p>
            <Button variant="primary" onClick={run.run}>
              <Sparkle size={15} /> {p.runLabel}
            </Button>
          </>
        )}
        {run.phase === "running" && (
          <div className="ai-shimmer w-full rounded-md px-3 py-2.5">
            <p className="flex items-center gap-2 text-[13px] font-medium text-ai-indigo">
              <Sparkle size={14} className="sparkle-working" /> {run.message}…
            </p>
          </div>
        )}
        {run.phase === "done" && (
          <p className="flex items-center gap-2 text-[13px] font-medium text-[#0f7a54]">
            <Check size={15} /> {run.result}
          </p>
        )}
      </div>
    </div>
  );
}

function PlanColumn({
  title,
  tone,
  steps,
}: {
  title: string;
  tone: string;
  steps: string[];
}) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone}`}>
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {steps.map((s) => (
          <li key={s} className="flex items-start gap-2 text-[13px] text-ink">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------- Eligibility criteria breadth ----------------
function CriteriaTab() {
  const analyse = useAgentRun({
    steps: ["Reading the protocol criteria", "Modelling pool sensitivity per criterion"],
    duration: 2000,
    result: true,
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ink">Eligibility criteria breadth</h3>
        <p className="mt-0.5 max-w-3xl text-sm text-body">
          Upstream criteria are the biggest lever on the eligible pool. The agent
          models which criteria could be safely broadened. Any change is proposed
          to the sponsor and decided by a human.
        </p>
      </div>

      {analyse.phase !== "done" && (
        <div className="rounded-lg border border-line bg-white p-5">
          {analyse.phase === "idle" && (
            <>
              <p className="text-sm text-body">
                No criteria changes are staged. Run the agent to model where
                broadening a criterion would widen the eligible pool.
              </p>
              <Button variant="ai" className="mt-3" onClick={analyse.run}>
                <Sparkle size={15} /> Model criteria breadth
              </Button>
            </>
          )}
          {analyse.phase === "running" && (
            <div className="ai-shimmer rounded-md px-3 py-2.5">
              <p className="flex items-center gap-2 text-[13px] font-medium text-ai-indigo">
                <Sparkle size={14} className="sparkle-working" /> {analyse.message}…
              </p>
            </div>
          )}
        </div>
      )}

      {analyse.phase === "done" &&
        UPSTREAM.criteria.map((c) => (
          <div
            key={c.criterion}
            className="flex flex-col gap-3 rounded-lg border border-line bg-white p-5 fade-up sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-ink">{c.criterion}</h4>
                <AutonomyBadge level={c.tier === "human" ? "Human" : "Assist"} />
              </div>
              <p className="mt-1 text-[13px] text-body">
                Current: <span className="text-ink">{c.current}</span> · Proposed:{" "}
                <span className="font-medium text-ink">{c.proposed}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#10b981]/12 px-2 py-1 text-[12px] font-semibold text-[#0f7a54]">
                <TrendUp size={13} /> {c.poolImpact}
              </span>
              <Button variant="secondary" size="sm">
                Propose to sponsor
              </Button>
            </div>
          </div>
        ))}
    </div>
  );
}
