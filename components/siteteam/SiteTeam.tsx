"use client";

import { useMemo, useRef, useState } from "react";
import { StaffLayout } from "@/components/shell/StaffLayout";
import {
  CANDIDATES,
  DISCOVERY_POOL_REMAINING,
  DISEASE_POPULATION,
  STAGE_META,
  newDiscoveredBatch,
} from "@/lib/data";
import type { Candidate, Stage } from "@/lib/types";
import {
  Check,
  Clipboard,
  Compass,
  FileText,
  Heart,
  Sparkle,
} from "@/components/ui/icons";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SectionLabel } from "@/components/ui/primitives";
import { PipelineBoard } from "./PipelineBoard";
import { DiscoverySweep } from "./DiscoverySweep";
import { CandidateDetail } from "./CandidateDetail";
import { OnTrialView } from "./OnTrialView";
import { Upstream } from "./Upstream";
import { RepresentativenessCard } from "./RepresentativenessCard";

const NAV = [
  { id: "upstream", label: "Upstream", icon: <Sparkle size={18} /> },
  { id: "pipeline", label: "Pipeline", icon: <Compass size={18} /> },
  { id: "ontrial", label: "On-Trial Patients", icon: <Heart size={18} /> },
  { id: "consent", label: "Consent Prep", icon: <FileText size={18} /> },
  { id: "datacapture", label: "Data Capture", icon: <Clipboard size={18} /> },
];

const PIPELINE_STAGES: Stage[] = [
  "discover",
  "shortlist",
  "screening",
  "eligible",
  "screenfail",
];

export function SiteTeam() {
  const [view, setView] = useState("pipeline");
  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    CANDIDATES.map((c) => ({ ...c }))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Each completed discovery sweep populates the Discover column with a fresh
  // batch of suitable candidates (spec §6.2 Stage 1).
  const SWEEP_BATCH = 6;
  const seqRef = useRef(0);
  const runDiscovery = () => {
    const batch = newDiscoveredBatch(seqRef.current, SWEEP_BATCH);
    seqRef.current += SWEEP_BATCH;
    setCandidates((prev) => [...batch, ...prev]);
  };

  const selected = candidates.find((c) => c.id === selectedId) ?? null;

  const promote = (id: string, to: Stage, event: string, by: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              stage: to,
              history: [...c.history, { date: "13 Jul 2026", event, by }],
            }
          : c
      )
    );
  };

  const updateCandidate = (id: string, patch: Partial<Candidate>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  // Begin screening keeps a human in the loop: confirm before advancing (§2).
  const [screeningCandidate, setScreeningCandidate] = useState<Candidate | null>(
    null
  );
  const confirmBeginScreening = () => {
    if (!screeningCandidate) return;
    promote(
      screeningCandidate.id,
      "screening",
      "Promoted to screening",
      "R. Osei, CRC"
    );
    setSelectedId(screeningCandidate.id);
    setScreeningCandidate(null);
  };

  const shortlist = useMemo(
    () => candidates.filter((c) => c.stage === "shortlist"),
    [candidates]
  );

  return (
    <>
      <StaffLayout
        title="Site Team workspace"
        subtitle="Site 04 — Northbridge, London · ATLAS-2 (ACM'916)"
        brandTitle="Site Team"
        brandSubtitle="Northbridge, London"
        user={{
          name: "R. Osei",
          role: "Research Coordinator",
          initials: "RO",
        }}
        nav={NAV}
        active={view}
        onNav={(v) => {
          setSelectedId(null);
          setView(v);
        }}
        searchPlaceholder="Search candidates"
      >
        {selected ? (
          <CandidateDetail
            candidate={selected}
            onBack={() => setSelectedId(null)}
            onPromote={promote}
            onUpdate={updateCandidate}
            onBeginScreening={setScreeningCandidate}
            onOpenConsent={() => {
              setSelectedId(null);
              setView("consent");
            }}
          />
        ) : (
          <>
            {view === "upstream" && <Upstream onNavigate={setView} />}

            {view === "pipeline" && (
              <div className="space-y-5">
                <PipelineIntro candidates={candidates} />
                <DiscoverySweep
                  poolRemaining={DISCOVERY_POOL_REMAINING}
                  onDiscover={runDiscovery}
                  sweepBatch={SWEEP_BATCH}
                />
                <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
                  <PipelineBoard
                    stages={PIPELINE_STAGES}
                    candidates={candidates}
                    poolRemaining={DISCOVERY_POOL_REMAINING}
                    onSelect={setSelectedId}
                    onPromote={promote}
                    onBeginScreening={setScreeningCandidate}
                  />
                  <RepresentativenessCard
                    shortlist={shortlist}
                    population={DISEASE_POPULATION}
                  />
                </div>
              </div>
            )}

            {view === "ontrial" && (
              <OnTrialView
                patients={candidates.filter((c) => c.stage === "enrolled")}
                onSelect={setSelectedId}
              />
            )}

            {view === "consent" && <ConsentPrep />}

            {view === "datacapture" && <DataCapture />}
          </>
        )}
      </StaffLayout>

      <ConfirmModal
        open={!!screeningCandidate}
        title="Begin screening?"
        confirmLabel="Begin screening"
        onConfirm={confirmBeginScreening}
        onCancel={() => setScreeningCandidate(null)}
      >
        Start formal screening for{" "}
        <span className="font-semibold text-ink">
          {screeningCandidate?.name}
        </span>
        . You will be taken to the full clinical record for human review.
      </ConfirmModal>
    </>
  );
}

const STAGE_DOT: Record<string, string> = {
  discover: "bg-[#9AA5B4]",
  shortlist: "bg-ai-indigo",
  screening: "bg-paused",
  eligible: "bg-ai-teal",
  enrolled: "bg-brand-orange",
};

function PipelineIntro({ candidates }: { candidates: Candidate[] }) {
  const count = (s: Stage) => candidates.filter((c) => c.stage === s).length;
  const stats: { stage: Stage; n: number }[] = [
    "discover",
    "shortlist",
    "screening",
    "eligible",
    "enrolled",
  ].map((s) => ({ stage: s as Stage, n: count(s as Stage) }));

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="grid grid-cols-2 divide-line sm:grid-cols-5 sm:divide-x">
        {stats.map((s, i) => {
          const value =
            s.stage === "discover" ? s.n + DISCOVERY_POOL_REMAINING : s.n;
          return (
            <div key={s.stage} className="relative px-5 py-4">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${STAGE_DOT[s.stage]}`}
                  aria-hidden
                />
                <p className="text-xs font-medium text-meta">
                  {STAGE_META[s.stage].label}
                </p>
              </div>
              <p className="mt-1.5 text-3xl font-semibold text-ink">{value}</p>
              {i < stats.length - 1 && (
                <span
                  className="absolute right-[-9px] top-1/2 hidden -translate-y-1/2 text-meta sm:block"
                  aria-hidden
                >
                  ›
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConsentPrep() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-base font-semibold text-ink">Consent preparation</h2>
        <p className="mt-1.5 text-sm text-body">
          The agent pre-briefs patients and drafts their questions so your
          limited time goes into the conversation itself, which you lead.
          Consent-document gaps are flagged for the CRA; compliance judgment
          stays human.
        </p>
      </div>
      <div className="rounded-lg bg-ai-indigo-tint p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ai-indigo">
          Consent-document gap flags · for CRA review
        </p>
        <ul className="mt-2 space-y-2 text-sm text-ink">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-escalated" />
            Carmen Ortiz (PT-0301) consent form v2 predates amendment v3.
            Re-consent needed before next visit.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-paused" />
            Michael Brennan (PT-0295) preferred-language version (Polish) not yet
            on file.
          </li>
        </ul>
        <p className="mt-3 border-t border-black/5 pt-2 text-[11px] text-body">
          Flagged by agent · a named CRA resolves and the resolution is recorded.
        </p>
      </div>
    </div>
  );
}

// Single-entry structured capture that flows downstream (spec §6.2): data
// entered once auto-populates across platforms; a human verifies.
function DataCapture() {
  const [verified, setVerified] = useState(false);
  const fields = [
    { label: "Participant", value: "Amara Okafor (PT-0212)" },
    { label: "Visit", value: "Cycle 3, Day 1" },
    { label: "Vitals", value: "BP 128/78 · HR 74 · Temp 36.8°C" },
    { label: "ECOG", value: "1" },
    { label: "AE this cycle", value: "Grade 1 fatigue" },
  ];
  const targets = ["EDC (Rave)", "CTMS", "Safety database", "Trial Operations"];

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-base font-semibold text-ink">Structured data capture</h2>
        <p className="mt-1 text-sm text-body">
          Enter visit data once. The agent propagates it across platforms so
          nothing is re-keyed. A named person verifies before it is committed.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>Cycle 3 visit entry</SectionLabel>
          <span className="inline-flex items-center gap-1 rounded-md bg-ai-indigo-tint px-2 py-0.5 text-[11px] font-semibold text-ai-indigo">
            <Sparkle size={11} /> Auto-populated by agent
          </span>
        </div>
        <div className="divide-y divide-line">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[13px] text-meta">{f.label}</span>
              <span className="text-sm font-medium text-ink">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-ai-indigo-tint p-4">
        <SectionLabel>Flows downstream to</SectionLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {targets.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[12px] font-medium text-ink"
            >
              <Check size={12} className="text-active" /> {t}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-body">
          Entered once, propagated by the agent. Removes the multi-platform
          re-keying flagged in the blueprint.
        </p>
      </div>

      <button
        onClick={() => setVerified(true)}
        disabled={verified}
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
          verified
            ? "bg-active/10 text-[#0f7a54]"
            : "bg-brand-orange text-white hover:bg-brand-orange-hover"
        }`}
      >
        <Check size={15} />
        {verified ? "Verified and committed by R. Osei, CRC" : "Verify and commit"}
      </button>
    </div>
  );
}
