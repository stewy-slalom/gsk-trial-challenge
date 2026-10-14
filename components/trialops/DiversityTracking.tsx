"use client";

import { useState } from "react";
import { SITES, TRIALS, siteParticipants } from "@/lib/data";
import type { Trial } from "@/lib/types";
import { AIBadge, Button } from "@/components/ui/primitives";
import { useAgentRun } from "@/lib/agent";
import { Check, Sparkle, Users } from "@/components/ui/icons";

// Portfolio-level diversity tracking (spec §6.3). When a trial's enrolling mix
// drifts from plan, the agent drafts an improvement plan; a human selects and
// approves the interventions before any site is notified.

const PLAN = { male: 48, female: 52, age: 58 };

function median(nums: number[]) {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

function trialStats(trial: Trial) {
  const parts = SITES.filter((s) => s.trialId === trial.id).flatMap((s) =>
    siteParticipants(s)
  );
  const n = parts.length || 1;
  return {
    malePct: Math.round((parts.filter((p) => p.sex === "M").length / n) * 100),
    femalePct: Math.round((parts.filter((p) => p.sex === "F").length / n) * 100),
    median: median(parts.map((p) => p.age)),
  };
}

export function DiversityTracking() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-ai-indigo-tint p-4 text-sm text-ink">
        When diversity metrics drift from plan, generate an{" "}
        <span className="font-semibold">agent improvement plan</span> with
        targeted interventions. Select the actions you want to deploy. Every
        approval requires human sign-off before sites are notified.
      </div>
      {TRIALS.map((t) => (
        <DiversityTrialCard key={t.id} trial={t} />
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  plan,
  drift,
}: {
  label: string;
  value: string;
  plan: string;
  drift: boolean;
}) {
  return (
    <div>
      <p className="text-[13px] text-meta">{label}</p>
      <p className="mt-1 text-lg">
        <span className={drift ? "font-semibold text-gsk-orange" : "font-semibold text-ink"}>
          {value}
        </span>{" "}
        <span className="text-[13px] font-normal text-meta">(plan: {plan})</span>
      </p>
    </div>
  );
}

function DiversityTrialCard({ trial }: { trial: Trial }) {
  const s = trialStats(trial);
  const maleDrift = Math.abs(s.malePct - PLAN.male) >= 8;
  const femaleDrift = Math.abs(s.femalePct - PLAN.female) >= 8;
  const ageDrift = Math.abs(s.median - PLAN.age) >= 5;
  const actionNeeded = maleDrift || femaleDrift;
  const under = s.malePct < PLAN.male ? "male" : "female";
  const U = under.charAt(0).toUpperCase() + under.slice(1);

  const options = [
    {
      title: `Launch ${under}-focused community outreach`,
      detail: `Agent identified 4 community oncology networks and 2 patient advocacy groups with stronger ${under} representation for this indication. Drafts site-specific outreach plans for ${trial.code}.`,
      target: `${U} enrolment`,
      impact: "Close the gender gap over 10 weeks",
      tier: "assist",
    },
    {
      title: "Audit referral source mix at lead sites",
      detail:
        "Analyse referral pathways at each active site. Flag sites with a skewed referral mix and recommend alternative referral sources.",
      target: "Gender balance",
      impact: "Identify root cause within 2 weeks",
      tier: "act",
    },
    {
      title: "Set site-level diversity recruitment targets",
      detail:
        "Human-reviewed site targets for balanced enrolment proportion, reviewed monthly at the trial ops stand-up.",
      target: "Balanced enrolment",
      impact: "Accountability and tracking at site level",
      tier: "human",
    },
  ];

  const [selected, setSelected] = useState([true, true, false]);
  const [notes, setNotes] = useState("");
  const [deployed, setDeployed] = useState(false);
  const plan = useAgentRun({
    steps: [
      "Analysing the enrolment mix",
      "Modelling targeted interventions",
      "Drafting the improvement plan",
    ],
    duration: 2400,
    result: true,
  });
  const count = selected.filter(Boolean).length;

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-meta">{trial.code}</p>
          <h3 className="mt-0.5 text-base font-semibold text-ink">{trial.name}</h3>
          <p className="text-[13px] text-body">{trial.indication}</p>
        </div>
        {actionNeeded && (
          <span className="rounded-md bg-paused/15 px-2 py-0.5 text-[11px] font-semibold text-[#a66a00]">
            Action needed
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-6">
        <Metric label="Male" value={`${s.malePct}%`} plan={`${PLAN.male}%`} drift={maleDrift} />
        <Metric label="Female" value={`${s.femalePct}%`} plan={`${PLAN.female}%`} drift={femaleDrift} />
        <Metric label="Median age" value={`${s.median}`} plan={`${PLAN.age}`} drift={ageDrift} />
      </div>

      {plan.phase === "idle" && !deployed && (
        <Button variant="primary" className="mt-4" onClick={plan.run}>
          <Sparkle size={15} /> Generate diversity improvement plan
        </Button>
      )}

      {plan.phase === "running" && (
        <div className="mt-4 rounded-lg border border-ai-indigo/20 p-4">
          <div className="ai-shimmer rounded-md px-3 py-2.5">
            <p className="flex items-center gap-2 text-[13px] font-medium text-ai-indigo">
              <Sparkle size={14} className="sparkle-working" /> AI assessment in
              progress: {plan.message}…
            </p>
          </div>
        </div>
      )}

      {plan.phase === "done" && !deployed && (
        <div className="mt-4 rounded-lg bg-ai-indigo-tint p-4 fade-up">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ai-indigo">
              Agent-suggested improvements
            </span>
            <AIBadge />
            <span className="text-[12px] text-ai-indigo">Select &amp; approve to deploy</span>
          </div>

          <div className="space-y-2">
            {options.map((o, i) => {
              const checked = selected[i];
              return (
                <button
                  key={o.title}
                  onClick={() =>
                    setSelected((prev) => prev.map((v, j) => (j === i ? !v : v)))
                  }
                  className={`flex w-full items-start gap-3 rounded-lg border bg-white p-3 text-left transition-colors ${
                    checked ? "border-ai-indigo" : "border-line hover:bg-surface"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      checked
                        ? "border-ai-indigo bg-ai-indigo text-white"
                        : "border-line bg-white"
                    }`}
                  >
                    {checked && <Check size={13} />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {o.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-body">
                      {o.detail}
                    </span>
                    <span className="mt-1 block text-[12px] text-meta">
                      Target: {o.target} · Est. impact: {o.impact} · Tier: {o.tier}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <label className="mt-4 block text-[13px] font-medium text-ink">
            Human review notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Confirm or edit agent recommendations before deployment…"
              className="mt-1 w-full rounded-lg border border-line bg-white p-3 text-sm outline-none focus:border-gsk-orange"
            />
          </label>

          <Button
            variant="primary"
            className="mt-4"
            disabled={count === 0}
            onClick={() => setDeployed(true)}
          >
            <Users size={15} /> Approve &amp; deploy ({count})
          </Button>
        </div>
      )}

      {deployed && (
        <div className="mt-4 rounded-lg bg-active/10 p-4 fade-up">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#0f7a54]">
            <Check size={16} /> Improvement plan deployed
          </p>
          <p className="mt-1 text-[13px] text-ink">
            {count} action{count === 1 ? "" : "s"} approved and assigned for{" "}
            {trial.code}.{notes ? " Review note recorded." : ""}
          </p>
          <p className="mt-2 text-[11px] text-body">
            Approved by CTM · written to the audit log, attributable and
            time-stamped (§4).
          </p>
        </div>
      )}
    </div>
  );
}
