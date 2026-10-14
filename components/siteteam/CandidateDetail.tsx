"use client";

import type { Candidate, Stage, StatusTone } from "@/lib/types";
import { STAGE_META } from "@/lib/data";
import { candidateAudit } from "@/lib/audit";
import { useAgentRun } from "@/lib/agent";
import {
  AIBadge,
  AutonomyBadge,
  Button,
  ConfidenceChip,
  SectionLabel,
  StatusPill,
} from "@/components/ui/primitives";
import { AuditTrail } from "@/components/ui/AuditTrail";
import {
  AgentAssessment,
  BiomarkerChips,
  InclusionCriteria,
  StatusBanner,
  type CriteriaItem,
} from "@/components/shared/patientBits";
import { ArrowLeft, Check, Clock, Sparkle, Users } from "@/components/ui/icons";

const STAGE_TONE: Record<Stage, StatusTone> = {
  discover: "ai",
  shortlist: "ai",
  screening: "paused",
  eligible: "active",
  enrolled: "active",
  screenfail: "escalated",
};

function candidateCriteria(c: Candidate): CriteriaItem[] {
  const decided = c.stage === "eligible" || c.stage === "enrolled";
  const screened = decided || c.stage === "screening";
  const keapWt = /KEAP1 wt|wild-type/i.test(c.biomarker);
  const keapPending = /pending|unknown|confirmation/i.test(c.biomarker);
  const washoutFail = /washout/i.test(c.screenFailReason ?? "");
  const labsPending = c.screening?.some(
    (s) => /lab|organ|renal|hepatic/i.test(s.label) && s.status === "pending"
  );

  const base = (met: boolean): CriteriaItem["status"] =>
    decided ? "met" : met ? "met" : "pending";

  return [
    { title: "Age 18–75", detail: "Patient within protocol age range", status: "met" },
    {
      title: "Confirmed advanced NSCLC",
      detail: "Histologically confirmed, Stage IV",
      status: base(screened),
    },
    {
      title: "STK11 + KEAP1 co-mutation",
      detail: keapWt
        ? "KEAP1 wild-type on confirmation"
        : "Detected on molecular panel",
      status: keapWt ? "fail" : keapPending ? "pending" : base(screened),
    },
    {
      title: "ECOG performance status 0–1",
      detail: "Documented in chart",
      status: base(screened),
    },
    {
      title: "No prior-therapy washout breach",
      detail: washoutFail ? "Washout window not met" : "Within protocol window",
      status: washoutFail ? "fail" : base(screened),
    },
    {
      title: "Adequate organ function",
      detail: "Renal and hepatic labs within limits",
      status: labsPending ? "pending" : base(screened),
    },
  ];
}

function banner(c: Candidate) {
  switch (c.stage) {
    case "discover":
      return { tone: "info" as const, text: "Surfaced by the discovery sweep. Assess this candidate for the trial." };
    case "shortlist":
      return { tone: "info" as const, text: "Pre-screened shortlist. Assess the evidence, then begin screening." };
    case "screening":
      return { tone: "warn" as const, text: "In screening. Results are being aggregated for human review." };
    case "eligible":
      return { tone: "eligible" as const, text: "Candidate marked eligible. Ready for consent preparation and enrolment." };
    case "enrolled":
      return { tone: "eligible" as const, text: `Enrolled and active on trial. ${c.cyclePosition ?? ""}` };
    case "screenfail":
      return { tone: "fail" as const, text: `Screen-fail recorded. ${c.screenFailReason ?? ""}` };
  }
}

export function CandidateDetail({
  candidate: c,
  onBack,
  onPromote,
  onUpdate,
  onBeginScreening,
  onOpenConsent,
}: {
  candidate: Candidate;
  onBack: () => void;
  onPromote: (id: string, to: Stage, event: string, by: string) => void;
  onUpdate: (id: string, patch: Partial<Candidate>) => void;
  onBeginScreening: (c: Candidate) => void;
  onOpenConsent: () => void;
}) {
  const b = banner(c);
  return (
    <div className="space-y-5 pb-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-medium text-body hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to pipeline
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-ink">{c.name}</h1>
            <StatusPill tone={STAGE_TONE[c.stage]}>
              {STAGE_META[c.stage].label}
            </StatusPill>
          </div>
          <p className="mt-1 text-sm text-body">
            {c.code} · Age {c.age} · Advanced NSCLC
          </p>
          <p className="text-[13px] text-meta">ACM&rsquo;916 · Guy&rsquo;s, London</p>
          <p className="mt-1 text-[13px] text-meta">Source: {c.provenance}</p>
          <div className="mt-3">
            <BiomarkerChips biomarker={c.biomarker} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-brand-orange">{c.matchScore}%</p>
          <p className="text-[13px] text-meta">match score</p>
          <div className="mt-1 flex justify-end">
            <ConfidenceChip level={c.confidence} />
          </div>
        </div>
      </div>

      {b && <StatusBanner tone={b.tone}>{b.text}</StatusBanner>}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Left: evidence */}
        <div className="space-y-5">
          <AgentAssessment
            text={c.rationale.join(". ") + "."}
            provenance={c.provenance}
          />

          {c.improvesRepresentation && (
            <span className="inline-flex items-center gap-1 rounded-md bg-ai-teal-tint px-2 py-1 text-[12px] font-semibold text-ai-teal">
              <Users size={12} /> Improves representativeness vs disease population
            </span>
          )}

          <InclusionCriteria items={candidateCriteria(c)} />

          {c.stage === "screening" && (
            <ScreeningStatusPanel candidate={c} onUpdate={onUpdate} />
          )}

          {/* Audit log, in the context of the detail page (§4/§7) */}
          <div className="rounded-lg border border-line bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Clock size={16} className="text-brand-orange" />
              <SectionLabel>Audit log</SectionLabel>
            </div>
            <AuditTrail entries={candidateAudit(c)} />
            <p className="mt-3 text-[11px] text-meta">
              Immutable, attributable record. Every action is time-stamped and
              written to the validated audit store (§4).
            </p>
          </div>
        </div>

        {/* Right: human-in-the-loop actions */}
        <aside className="h-fit rounded-lg border border-line bg-white p-5 lg:sticky lg:top-20">
          <h2 className="text-base font-semibold text-ink">
            Human-in-the-loop actions
          </h2>
          <p className="mt-0.5 text-[13px] text-body">
            Review evidence before advancing this candidate.
          </p>
          <div className="mt-4">
            <RightActions
              candidate={c}
              onPromote={onPromote}
              onBeginScreening={onBeginScreening}
              onOpenConsent={onOpenConsent}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ScreeningStatusPanel({
  candidate: c,
  onUpdate,
}: {
  candidate: Candidate;
  onUpdate: (id: string, patch: Partial<Candidate>) => void;
}) {
  const aggregate = useAgentRun({
    steps: ["Pulling lab result from central lab", "Aggregating with scan and molecular data"],
    duration: 2200,
    result: true,
  });
  const allComplete = c.screening?.every((s) => s.status !== "pending");

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>Single-view screening status</SectionLabel>
        <AutonomyBadge level="Agent" />
      </div>
      <ul className="space-y-2">
        {c.screening?.map((s, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-md bg-surface px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-ink">{s.label}</p>
              <p className="text-[12px] text-meta">
                {s.value ?? "Awaiting result"}
                {s.source && ` · ${s.source}`}
              </p>
            </div>
            {s.status === "pending" ? (
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#a66a00]">
                <span className="h-2 w-2 rounded-full bg-paused pulse-dot" />
                Pending
              </span>
            ) : (
              <Check size={16} className="text-active" />
            )}
          </li>
        ))}
      </ul>

      {!allComplete && aggregate.phase === "idle" && (
        <Button variant="ai" size="sm" className="mt-3" onClick={aggregate.run}>
          <Sparkle size={14} /> Aggregate and chase pending results
        </Button>
      )}
      {aggregate.phase === "running" && (
        <div className="ai-shimmer mt-3 rounded-md px-3 py-2">
          <p className="flex items-center gap-2 text-[12px] font-medium text-ai-indigo">
            <Sparkle size={13} className="sparkle-working" /> {aggregate.message}…
          </p>
        </div>
      )}
      {aggregate.phase === "done" && !allComplete && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() =>
            onUpdate(c.id, {
              screening: c.screening?.map((s) =>
                s.status === "pending"
                  ? { ...s, status: "complete", value: "Within thresholds", updated: "today" }
                  : s
              ),
              history: [
                ...c.history,
                { date: "13 Jul 2026", event: "Pending results aggregated, decision-ready", by: "Agent" },
              ],
            })
          }
        >
          Apply aggregated results
        </Button>
      )}
    </div>
  );
}

function RightActions({
  candidate: c,
  onPromote,
  onBeginScreening,
  onOpenConsent,
}: {
  candidate: Candidate;
  onPromote: (id: string, to: Stage, event: string, by: string) => void;
  onBeginScreening: (c: Candidate) => void;
  onOpenConsent: () => void;
}) {
  const assess = useAgentRun({
    steps: ["Reading chart and molecular panel", "Checking against criteria"],
    duration: 2000,
    result: {
      verdict: "Strong match on primary criteria",
      detail: "Co-mutation present, prior-therapy history within protocol. Recommend beginning screening.",
    },
  });

  if (c.stage === "discover" || c.stage === "shortlist") {
    return (
      <div className="space-y-3">
        {assess.phase === "idle" && (
          <Button variant="ai" className="w-full" onClick={assess.run}>
            <Sparkle size={15} /> Assess this candidate
          </Button>
        )}
        {assess.phase === "running" && (
          <div className="ai-shimmer rounded-md px-3 py-2.5">
            <p className="flex items-center gap-2 text-[13px] font-medium text-ai-indigo">
              <Sparkle size={14} className="sparkle-working" /> {assess.message}…
            </p>
          </div>
        )}
        {assess.phase === "done" && assess.result && (
          <div className="fade-up space-y-2">
            <AIBadge />
            <div className="rounded-md bg-ai-indigo-tint p-3">
              <p className="text-sm font-semibold text-ink">{assess.result.verdict}</p>
              <p className="mt-1 text-[13px] text-body">{assess.result.detail}</p>
            </div>
          </div>
        )}
        <Button variant="primary" className="w-full" onClick={() => onBeginScreening(c)}>
          Begin screening →
        </Button>
        <p className="text-[12px] text-meta">
          Screening must complete before any eligibility decision.
        </p>
      </div>
    );
  }

  if (c.stage === "screening") {
    const allComplete = c.screening?.every((s) => s.status !== "pending");
    return allComplete ? (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Sparkle size={15} className="text-ai-indigo" /> Decision ready
        </p>
        <p className="text-[13px] text-body">
          All screening data is in. A named person confirms and is recorded.
        </p>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => onPromote(c.id, "eligible", "Confirmed eligible", "Dr A. Mensah, PI")}
        >
          Confirm eligible
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => onPromote(c.id, "screenfail", "Marked screen-fail", "Dr A. Mensah, PI")}
        >
          Mark screen-fail
        </Button>
      </div>
    ) : (
      <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-[13px] text-meta">
        Decision actions appear once screening completes. Aggregate the pending
        results on the left to continue.
      </p>
    );
  }

  if (c.stage === "eligible") {
    return (
      <div className="space-y-2.5">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => onPromote(c.id, "enrolled", "Enrolled and randomised", "RTSM (system)")}
        >
          <Users size={15} /> Enrol participant
        </Button>
        <Button variant="secondary" className="w-full" onClick={onOpenConsent}>
          Open consent prep
        </Button>
        <p className="text-[12px] text-meta">
          Randomisation is handled by the validated RTSM, untouched by any agent.
        </p>
      </div>
    );
  }

  if (c.stage === "enrolled") {
    return (
      <div className="space-y-2.5">
        <div className="rounded-lg bg-surface p-3">
          <p className="flex items-center gap-2 text-sm text-ink">
            <Clock size={15} /> {c.cyclePosition}
          </p>
          {c.nextVisit && (
            <p className="mt-1 text-[13px] text-body">Next visit: {c.nextVisit}</p>
          )}
        </div>
        {c.retentionFlag && (
          <div className="rounded-md bg-paused/10 p-3 text-[13px] text-[#a66a00]">
            {c.retentionFlag}
          </div>
        )}
        <p className="text-[12px] text-meta">
          Execution is tracked in the On-trial view. The agent flags; a human acts.
        </p>
      </div>
    );
  }

  // screenfail
  return (
    <div className="rounded-lg bg-surface p-3">
      <p className="text-sm font-medium text-ink">{c.screenFailReason}</p>
      <p className="mt-2 text-[13px] text-body">
        This cause feeds Trial Operations&rsquo; screen-failure analysis and
        criteria-refinement recommendations.
      </p>
    </div>
  );
}
