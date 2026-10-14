"use client";

import { STAGE_META } from "@/lib/data";
import type { Candidate, Stage } from "@/lib/types";
import { AutonomyBadge } from "@/components/ui/primitives";
import { Sparkle, Users } from "@/components/ui/icons";

const STAGE_TINT: Record<Stage, string> = {
  discover: "bg-ai-indigo-tint",
  shortlist: "bg-ai-teal-tint",
  screening: "bg-surface",
  eligible: "bg-surface",
  enrolled: "bg-surface",
  screenfail: "bg-surface",
};

export function PipelineBoard({
  stages,
  candidates,
  poolRemaining,
  onSelect,
  onPromote,
  onBeginScreening,
}: {
  stages: Stage[];
  candidates: Candidate[];
  poolRemaining: number;
  onSelect: (id: string) => void;
  onPromote: (id: string, to: Stage, event: string, by: string) => void;
  onBeginScreening: (c: Candidate) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
      {stages.map((stage) => {
        const items = candidates.filter((c) => c.stage === stage);
        const meta = STAGE_META[stage];
        return (
          <div key={stage} className="flex w-72 shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">
                  {meta.label}
                </span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-body">
                  {stage === "discover" ? items.length + poolRemaining : items.length}
                </span>
              </div>
              <AutonomyBadge level={meta.autonomy} />
            </div>

            <div className={`space-y-3 rounded-lg ${STAGE_TINT[stage]} p-2`}>
              {items.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  onSelect={() => onSelect(c.id)}
                  onPromote={onPromote}
                  onBeginScreening={onBeginScreening}
                />
              ))}
              {items.length === 0 && (
                <p className="px-2 py-6 text-center text-[13px] text-meta">
                  {stage === "discover"
                    ? "Run the discovery sweep to surface candidates"
                    : "No candidates in this stage"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const tone =
    score >= 85 ? "text-ai-indigo" : score >= 70 ? "text-body" : "text-meta";
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-[13px] font-semibold ${tone}`}
      title="Match score"
    >
      {score}
    </span>
  );
}

function CandidateCard({
  candidate: c,
  onSelect,
  onPromote,
  onBeginScreening,
}: {
  candidate: Candidate;
  onSelect: () => void;
  onPromote: (id: string, to: Stage, event: string, by: string) => void;
  onBeginScreening: (c: Candidate) => void;
}) {
  const hasPending = c.screening?.some((s) => s.status === "pending");
  return (
    <button
      onClick={onSelect}
      className="fade-up w-full rounded-lg border border-line bg-white p-3 text-left transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-start gap-2.5">
        <ScoreRing score={c.matchScore} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-ink">
              {c.name}
            </span>
            <span className="shrink-0 text-[11px] text-meta">
              {c.age} · {c.sex}
            </span>
          </div>
          <p className="text-[11px] text-meta">{c.code}</p>
          <p className="mt-0.5 truncate text-[12px] text-body" title={c.biomarker}>
            {c.biomarker}
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-ai-indigo-tint px-1.5 py-0.5 text-[10px] font-semibold text-ai-indigo">
          <Sparkle size={9} /> {c.confidence}
        </span>
        {c.improvesRepresentation && (
          <span
            className="inline-flex items-center gap-1 rounded-md bg-ai-teal-tint px-1.5 py-0.5 text-[10px] font-semibold text-ai-teal"
            title="Improves representativeness vs disease population"
          >
            <Users size={9} /> Rep +
          </span>
        )}
        {hasPending && (
          <span className="inline-flex items-center gap-1 rounded-md bg-paused/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#a66a00]">
            <span className="h-1.5 w-1.5 rounded-full bg-paused pulse-dot" />
            Results pending
          </span>
        )}
        {c.stage === "screenfail" && c.screenFailReason && (
          <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-medium text-body">
            {c.screenFailReason}
          </span>
        )}
      </div>

      {/* Stage-appropriate quick promotion (honest vocabulary, §6.2) */}
      {c.stage === "discover" && (
        <QuickPromote
          label="Assess for this trial"
          onClick={() =>
            onPromote(c.id, "shortlist", "Assessed and added to shortlist", "Agent")
          }
        />
      )}
      {c.stage === "shortlist" && (
        <QuickPromote
          label="Begin screening"
          onClick={() => onBeginScreening(c)}
        />
      )}
    </button>
  );
}

function QuickPromote({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
          onClick();
        }
      }}
      className="mt-2.5 block cursor-pointer rounded-md border border-line px-2.5 py-1.5 text-center text-[12px] font-semibold text-ink transition-colors hover:border-gsk-orange hover:text-gsk-orange"
    >
      {label} →
    </span>
  );
}
