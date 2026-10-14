"use client";

import { createContext, useContext, useState } from "react";
import { StaffLayout } from "@/components/shell/StaffLayout";
import {
  AUDIT_LOG,
  CANDIDATES,
  EARLY_WARNINGS,
  MILESTONE_TEMPLATE,
  SITES,
  TRIALS,
  siteParticipants,
  sitesForTrial,
} from "@/lib/data";
import type { EarlyWarning, Severity, SiteParticipant } from "@/lib/data";
import { participantAudit, portfolioAudit, siteAudit } from "@/lib/audit";
import type { Confidence, Site, StatusTone, Trial } from "@/lib/types";
import { AuditTrail } from "@/components/ui/AuditTrail";
import {
  AgentAssessment,
  BiomarkerChips,
  InclusionCriteria,
  StatusBanner,
  type CriteriaItem,
} from "@/components/shared/patientBits";
import {
  AIBadge,
  Button,
  ConfidenceChip,
  InsightPanel,
  Meter,
  SectionLabel,
  StatusPill,
} from "@/components/ui/primitives";
import {
  Alert,
  ArrowLeft,
  Building,
  Check,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Grid,
  Map,
  Sparkle,
  Target,
  Users,
} from "@/components/ui/icons";
import { MilestoneTrack } from "./MilestoneTrack";
import { DiversityTracking } from "./DiversityTracking";
import { useAgentRun } from "@/lib/agent";

const NAV = [
  { id: "portfolio", label: "Portfolio", icon: <Grid size={18} /> },
  { id: "warnings", label: "Early Warnings", icon: <Alert size={18} /> },
  { id: "diversity", label: "Diversity Tracking", icon: <Globe size={18} /> },
  { id: "reports", label: "Site Reports", icon: <FileText size={18} /> },
  { id: "history", label: "History", icon: <Clock size={18} /> },
];

// Lets nested detail pages open a participant's full page without prop-drilling.
interface ParticipantCtxValue {
  p: SiteParticipant;
  siteName: string;
  trialCode: string;
}
const ParticipantCtx = createContext<
  ((p: SiteParticipant, ctx: { siteName: string; trialCode: string }) => void) | null
>(null);
function useOpenParticipant() {
  return useContext(ParticipantCtx);
}

export function TrialOps() {
  const [view, setView] = useState("portfolio");
  const [trialId, setTrialId] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [reportSiteId, setReportSiteId] = useState<string | null>(null);
  const [participant, setParticipant] = useState<ParticipantCtxValue | null>(null);

  const trial = TRIALS.find((t) => t.id === trialId) ?? null;
  const site = SITES.find((s) => s.id === siteId) ?? null;
  const reportSite = SITES.find((s) => s.id === reportSiteId) ?? null;

  const go = (v: string) => {
    setView(v);
    setTrialId(null);
    setSiteId(null);
    setReportSiteId(null);
    setParticipant(null);
  };

  let body: React.ReactNode;
  let subtitle: string | undefined;
  let pageTitle = "Trial Portfolio";

  if (participant) {
    body = (
      <ParticipantDetail data={participant} onBack={() => setParticipant(null)} />
    );
    subtitle = `${participant.trialCode} › ${participant.siteName}`;
    pageTitle = participant.p.name;
  } else if (view === "reports") {
    if (reportSite) {
      const rt = TRIALS.find((t) => t.id === reportSite.trialId);
      body = (
        <SiteReportDetail site={reportSite} onBack={() => setReportSiteId(null)} />
      );
      subtitle = `Portfolio › ${rt?.code} › ${reportSite.name}`;
      pageTitle = reportSite.institution;
    } else {
      body = <SiteReportsView onOpen={setReportSiteId} />;
      pageTitle = "Site Reports";
    }
  } else if (view === "warnings") {
    body = <WarningsView />;
    pageTitle = "Early Warnings";
  } else if (view === "diversity") {
    body = <DiversityTracking />;
    pageTitle = "Diversity Tracking";
  } else if (view === "history") {
    body = <AuditView />;
    pageTitle = "History";
  } else if (site && trial) {
    body = <SiteView trial={trial} site={site} onBack={() => setSiteId(null)} />;
    subtitle = `Portfolio › ${trial.code} › ${site.city}`;
    pageTitle = site.name;
  } else if (trial) {
    body = (
      <TrialView
        trial={trial}
        onBack={() => setTrialId(null)}
        onSite={setSiteId}
      />
    );
    subtitle = `Portfolio › ${trial.code}`;
    pageTitle = trial.name;
  } else {
    body = (
      <PortfolioView onOpen={setTrialId} onReviewWarnings={() => go("warnings")} />
    );
  }

  return (
    <ParticipantCtx.Provider
      value={(p, ctx) => setParticipant({ p, ...ctx })}
    >
      <StaffLayout
        title={pageTitle}
        subtitle={subtitle}
        brandTitle="Trial Operations"
        brandSubtitle="Oncology Portfolio"
        user={{
          name: "Marcus Delgado",
          role: "Clinical Trial Manager",
          initials: "LH",
        }}
        nav={NAV}
        active={view}
        onNav={go}
        searchPlaceholder="Search trials, sites"
      >
        {body}
      </StaffLayout>
    </ParticipantCtx.Provider>
  );
}

function ParticipantDetail({
  data,
  onBack,
}: {
  data: ParticipantCtxValue;
  onBack: () => void;
}) {
  const { p, siteName, trialCode } = data;
  const cand = CANDIDATES.find((c) => c.code === p.code);
  const assessment = cand
    ? cand.rationale.join(". ") + "."
    : "Enrolled participant, active on trial. Eligibility confirmed at screening and retention signals are stable.";
  const criteria: CriteriaItem[] = [
    { title: "Age 18–75", detail: "Within protocol age range", status: "met" },
    { title: "Confirmed advanced NSCLC", detail: "Histologically confirmed", status: "met" },
    { title: "Molecular eligibility", detail: "Trial biomarker criteria met", status: "met" },
    { title: "ECOG performance status 0–1", detail: "Documented in chart", status: "met" },
    { title: "No prior-therapy washout breach", detail: "Within protocol window", status: "met" },
    { title: "Adequate organ function", detail: "Labs within limits", status: "met" },
  ];

  return (
    <div className="space-y-5 pb-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-medium text-body hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-ink">{p.name}</h1>
            <StatusPill tone="active">On trial</StatusPill>
            {p.improvesRepresentation && (
              <span className="inline-flex items-center gap-1 rounded-md bg-ai-teal-tint px-2 py-0.5 text-[11px] font-semibold text-ai-teal">
                <Users size={11} /> Rep +
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-body">
            {p.code} · {p.sex} · Age {p.age} · {p.group}
          </p>
          <p className="text-[13px] text-meta">
            {trialCode} · {siteName}
          </p>
          {cand && (
            <div className="mt-3">
              <BiomarkerChips biomarker={cand.biomarker} />
            </div>
          )}
        </div>
        {cand && (
          <div className="text-right">
            <p className="text-3xl font-semibold text-brand-orange">
              {cand.matchScore}%
            </p>
            <p className="text-[13px] text-meta">match score</p>
          </div>
        )}
      </div>

      <StatusBanner tone="eligible">
        Enrolled and active on trial · {p.cycle}.
      </StatusBanner>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <AgentAssessment text={assessment} provenance={cand?.provenance} />
          <InclusionCriteria items={criteria} />

          <div className="rounded-lg border border-line bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Clock size={16} className="text-brand-orange" />
              <SectionLabel>Audit log</SectionLabel>
            </div>
            <AuditTrail entries={participantAudit(p.code, p.cycle)} />
            <p className="mt-3 text-[11px] text-meta">
              Access to this record is logged and attributable to a person (§4).
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-line bg-white p-5 lg:sticky lg:top-20">
          <SectionLabel>Participant status</SectionLabel>
          <div className="mt-3 space-y-3">
            {[
              { label: "Cycle position", value: p.cycle },
              { label: "Group", value: p.group },
              { label: "Status", value: "Active" },
            ].map((x) => (
              <div key={x.label} className="rounded-lg bg-surface p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-meta">
                  {x.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{x.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-meta">
            Trial Operations is oversight. Execution and any check-in follow-up
            are handled by the Site Team; the agent flags, a human acts.
          </p>
        </aside>
      </div>
    </div>
  );
}

// ---------------- Portfolio (landing) ----------------
function PortfolioView({
  onOpen,
  onReviewWarnings,
}: {
  onOpen: (id: string) => void;
  onReviewWarnings: () => void;
}) {
  const totalEnrolled = TRIALS.reduce((a, t) => a + t.enrolled, 0);
  const totalTarget = TRIALS.reduce((a, t) => a + t.target, 0);
  const activeTrials = TRIALS.filter((t) => t.status !== "paused").length;
  const activeSites = SITES.filter((s) => s.activation === "active").length;
  const attention = EARLY_WARNINGS.filter((w) => w.severity !== "Low").length;
  const topWarning = [...EARLY_WARNINGS].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
  )[0];

  return (
    <div className="space-y-5">
      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Active Trials" value={`${activeTrials}`} sub="Phase II oncology" />
        <SummaryTile
          label="Total Enrolled"
          value={`${totalEnrolled}`}
          sub={`of ${totalTarget} target`}
        />
        <SummaryTile
          label="Sites Active"
          value={`${activeSites}`}
          sub={`across ${TRIALS.length} trials`}
        />
        <SummaryTile
          label="Early Warnings"
          value={`${attention}`}
          sub="require attention"
          alert
        />
      </div>

      {/* Top early-warning banner */}
      {topWarning && (
        <div className="rounded-lg bg-ai-indigo-tint p-5">
          <div className="mb-2 flex items-center gap-2">
            <Alert size={15} className="text-ai-indigo" />
            <span className="text-xs font-semibold uppercase tracking-wide text-ai-indigo">
              Early warning
            </span>
            <AIBadge />
          </div>
          <p className="text-sm font-semibold text-ink">
            {topWarning.trialCode} {topWarning.title.toLowerCase()} — {topWarning.description}
          </p>
          <p className="mt-2 text-sm text-body">
            <span className="font-semibold text-ink">Recommended:</span>{" "}
            {topWarning.recommendation}
          </p>
          <p className="mt-2 text-[12px] text-meta">
            Confidence {topWarning.severity === "High" ? "87%" : "72%"} · Agent
            flagged 13 Jul 2026 · Source: site-team screen-fail data
          </p>
          <Button variant="primary" className="mt-4" onClick={onReviewWarnings}>
            Review &amp; action warnings
          </Button>
        </div>
      )}

      <h2 className="text-base font-semibold text-ink">Trials</h2>

      <div className="space-y-4">
        {TRIALS.map((t) => {
          const siteCount = sitesForTrial(t.id).length;
          const milestone = MILESTONE_TEMPLATE[t.milestoneIndex - 1];
          return (
            <button
              key={t.id}
              onClick={() => onOpen(t.id)}
              className="block w-full rounded-lg border border-line bg-white p-5 text-left transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] font-medium text-meta">{t.code}</span>
                  <StatusPill tone={t.status}>{t.statusLabel}</StatusPill>
                </div>
                <span className="text-sm font-semibold text-ink">
                  {t.enrolled}/{t.target} enrolled
                </span>
              </div>

              <h3 className="mt-2 text-lg font-semibold text-ink">{t.name}</h3>
              <p className="text-[13px] text-body">{t.indication}</p>

              <div className="mt-3">
                <Meter
                  value={t.enrolled}
                  max={t.target}
                  tone={t.status === "escalated" ? "escalated" : "orange"}
                />
              </div>

              <p className="mt-3 text-[13px] text-meta">
                {siteCount} sites · Milestone {milestone.id}: {milestone.label}
              </p>

              {t.status === "escalated" && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-escalated">
                  <Alert size={14} className="shrink-0" />
                  {t.topInsight.text}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: string;
  sub: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-body">{label}</p>
        {alert && <Alert size={15} className="text-escalated" />}
      </div>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-[12px] text-meta">{sub}</p>
    </div>
  );
}

// ---------------- Trial level ----------------
function TrialView({
  trial,
  onBack,
  onSite,
}: {
  trial: Trial;
  onBack: () => void;
  onSite: (id: string) => void;
}) {
  const sites = sitesForTrial(trial.id);
  return (
    <div className="space-y-6">
      <BackLink onClick={onBack} label="Back to portfolio" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-ink">{trial.name}</h2>
            <StatusPill tone={trial.status}>{trial.statusLabel}</StatusPill>
          </div>
          <p className="text-[13px] text-body">
            {trial.code} · {trial.indication}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2">
          <Target size={18} className="text-brand-orange" />
          <span className="text-xl font-semibold text-ink">
            {trial.enrolled}
            <span className="text-sm font-normal text-meta"> / {trial.target}</span>
          </span>
          <span className="text-[12px] text-body">enrolled vs target</span>
        </div>
      </div>

      {/* Milestones with levers */}
      <div className="rounded-lg border border-line bg-white p-5">
        <SectionLabel>Protocol milestones · tap a milestone for its lever</SectionLabel>
        <div className="mt-4">
          <MilestoneTrack index={trial.milestoneIndex} showLevers />
        </div>
      </div>

      {/* Screen-failure analysis — surfaced prominently (§6.3 M3) */}
      <ScreenFailureAnalysis trial={trial} />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Geography */}
        <div className="rounded-lg border border-line bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <Map size={17} className="text-body" />
            <SectionLabel>Enrolment by geography</SectionLabel>
          </div>
          <div className="space-y-3">
            {trial.geography.map((g) => {
              const max = Math.max(...trial.geography.map((x) => x.count));
              return (
                <div key={g.country}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="text-ink">{g.country}</span>
                    <span className="font-semibold text-ink">{g.count}</span>
                  </div>
                  <Meter value={g.count} max={max} tone="orange" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Diversity vs plan */}
        <DiversityCard trial={trial} />
      </div>

      {/* Sites */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Building size={17} className="text-body" />
          <h3 className="text-base font-semibold text-ink">
            Sites on this trial
          </h3>
        </div>
        <p className="mb-3 max-w-2xl text-[13px] text-body">
          Patients enrolled at each site. Open a site for its full recruitment
          funnel and per-site early warnings.
        </p>
        <div className="space-y-4">
          {sites.map((s) => (
            <div
              key={s.id}
              className="overflow-hidden rounded-lg border border-line bg-white"
            >
              <button
                onClick={() => onSite(s.id)}
                className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3.5 text-left transition-colors hover:bg-surface"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{s.name}</span>
                  <span className="text-[12px] text-meta">
                    {s.city}, {s.country}
                  </span>
                  <StatusPill tone={s.activation}>{s.activationLabel}</StatusPill>
                </div>
                <span className="flex items-center gap-1.5 text-[13px] text-body">
                  <span className="font-semibold text-ink">
                    {s.funnel.enrolled}
                  </span>{" "}
                  / {s.target} enrolled
                  <ChevronRight size={15} className="text-brand-orange" />
                </span>
              </button>
              {s.warning && s.warning.tone === "escalated" && (
                <p className="flex items-center gap-1.5 border-t border-line px-4 py-2 text-[12px] text-escalated">
                  <span className="h-1.5 w-1.5 rounded-full bg-escalated pulse-dot" />
                  {s.warning.text}
                </p>
              )}
              <SitePatientsTable site={s} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SitePatientsTable({ site }: { site: Site }) {
  const openParticipant = useOpenParticipant();
  const trial = TRIALS.find((t) => t.id === site.trialId);
  const rows = siteParticipants(site);
  if (rows.length === 0) {
    return (
      <p className="border-t border-line px-4 py-4 text-[13px] text-meta">
        No patients enrolled at this site yet.
      </p>
    );
  }
  return (
    <div className="border-t border-line">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-surface text-[11px] uppercase tracking-wide text-meta">
              <th className="px-4 py-2 font-semibold">Patient</th>
              <th className="px-4 py-2 font-semibold">Age</th>
              <th className="px-4 py-2 font-semibold">Group</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold">Cycle position</th>
              <th className="px-4 py-2" aria-label="Open" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr
                key={p.code}
                onClick={() =>
                  openParticipant?.(p, {
                    siteName: site.name,
                    trialCode: trial?.code ?? "",
                  })
                }
                className={`h-12 cursor-pointer border-b border-line transition-colors hover:bg-brand-orange/5 ${
                  i % 2 ? "bg-surface" : "bg-white"
                }`}
              >
                <td className="px-4">
                  <div className="font-medium text-ink">{p.name}</div>
                  <div className="text-[11px] text-meta">{p.code}</div>
                </td>
                <td className="px-4 text-body">{p.ageBand}</td>
                <td className="px-4 text-body">
                  <span className="inline-flex items-center gap-1.5">
                    {p.group}
                    {p.improvesRepresentation && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-ai-teal-tint px-1.5 py-0.5 text-[10px] font-semibold text-ai-teal">
                        <Users size={9} /> Rep +
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4">
                  <StatusPill tone="active">On trial</StatusPill>
                </td>
                <td className="px-4 text-body">{p.cycle}</td>
                <td className="px-4 text-right">
                  <ChevronRight size={15} className="text-meta" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line px-4 py-2 text-[11px] text-meta">
        Access to participant records is logged and attributable to a person
        (§4). Every view and change is captured in the audit log.
      </p>
    </div>
  );
}

function SiteFunnel({ funnel }: { funnel: Site["funnel"] }) {
  const steps = [
    { label: "Discovered", n: funnel.discovered },
    { label: "Shortlisted", n: funnel.shortlisted },
    { label: "Screening", n: funnel.screening },
    { label: "Eligible", n: funnel.eligible },
    { label: "Enrolled", n: funnel.enrolled },
  ];
  return (
    <div className="mt-3 flex items-end gap-1.5">
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[12px] font-semibold text-ink">{s.n}</span>
          <div
            className={`w-full rounded-t ${
              i === steps.length - 1 ? "bg-brand-orange" : "bg-brand-orange/30"
            }`}
            style={{
              height: `${Math.max(6, (s.n / steps[0].n) * 44)}px`,
            }}
          />
          <span className="text-[9px] text-meta">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function ScreenFailureAnalysis({ trial }: { trial: Trial }) {
  const analyze = useAgentRun({
    steps: ["Clustering screen-fail causes", "Modelling criteria sensitivity"],
    duration: 2000,
    result: {
      recovered: "6 to 9 candidates",
      recommendation:
        "Extend the prior-therapy washout window from 4 to 3 weeks. Retrospective check suggests this recovers eligible patients without safety impact.",
    },
  });
  const total = trial.screenFail.reduce((a, s) => a + s.count, 0);

  return (
    <div className="rounded-lg bg-ai-indigo-tint p-5">
      <div className="mb-1 flex items-center justify-between">
        <SectionLabel>Screen-failure analysis · M3 lever</SectionLabel>
        <AIBadge working={analyze.phase === "running"} />
      </div>
      <p className="mb-3 text-[13px] text-body">
        {total} screen-fails across sites in the last 60 days. Causes feed
        criteria-refinement. Humans change criteria; the agent recommends.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          {trial.screenFail.map((s) => {
            const max = Math.max(...trial.screenFail.map((x) => x.count));
            return (
              <div key={s.reason}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-ink">{s.reason}</span>
                  <span className="font-semibold text-ink">{s.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-ai-indigo"
                    style={{ width: `${(s.count / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg bg-white p-4">
          {analyze.phase === "idle" && (
            <>
              <p className="mb-2 text-[13px] text-body">
                Run the agent to model a criteria refinement against these causes.
              </p>
              <Button variant="ai" size="sm" onClick={analyze.run}>
                <Sparkle size={14} /> Recommend a criteria refinement
              </Button>
            </>
          )}
          {analyze.phase === "running" && (
            <div className="ai-shimmer rounded-md px-3 py-2.5">
              <p className="flex items-center gap-2 text-[13px] font-medium text-ai-indigo">
                <Sparkle size={14} className="sparkle-working" /> {analyze.message}…
              </p>
            </div>
          )}
          {analyze.phase === "done" && analyze.result && (
            <div className="fade-up">
              <p className="text-sm font-semibold text-ink">
                Est. recovery: {analyze.result.recovered}
              </p>
              <p className="mt-1 text-[13px] text-body">
                {analyze.result.recommendation}
              </p>
              <p className="mt-2 text-[11px] text-meta">
                Recommendation only · a named human changes criteria and is recorded
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DiversityCard({ trial }: { trial: Trial }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>Diversity vs plan</SectionLabel>
        <AIBadge />
      </div>
      <p className="mb-3 text-[12px] text-body">
        Live tracking, framed as efficacy-signal quality at Phase II&rsquo;s small N.
      </p>
      <div className="space-y-3">
        {trial.diversity.map((d) => {
          const under = d.actual < d.plan - 4;
          return (
            <div key={d.group}>
              <div className="mb-1 flex justify-between text-[12px]">
                <span className="text-ink">{d.group}</span>
                <span className={under ? "font-semibold text-escalated" : "text-body"}>
                  {d.actual}% vs {d.plan}% plan
                </span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-surface">
                <span
                  className="absolute top-[-2px] h-3 w-0.5 bg-ink/40"
                  style={{ left: `${d.plan}%` }}
                  aria-hidden
                />
                <div
                  className={`h-full rounded-full ${under ? "bg-escalated" : "bg-active"}`}
                  style={{ width: `${d.actual}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- Site level ----------------
function SiteView({
  trial,
  site,
  onBack,
}: {
  trial: Trial;
  site: Site;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <BackLink onClick={onBack} label={`Back to ${trial.name}`} />
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold text-ink">{site.name}</h2>
        <span className="text-[13px] text-meta">
          {site.institution} · {site.city}, {site.country}
        </span>
        <StatusPill tone={site.activation}>{site.activationLabel}</StatusPill>
      </div>

      <div className="rounded-lg border border-line bg-white p-5">
        <SectionLabel>
          Recruitment funnel · fed live from the Site Team workspace
        </SectionLabel>
        <div className="mt-4">
          <SiteFunnel funnel={site.funnel} />
        </div>
      </div>

      {site.warning && (
        <InsightPanel
          title="Per-site early warning"
          alert={site.warning.tone === "escalated"}
          provenance={site.warning.evidence}
        >
          <p>{site.warning.text}</p>
          <div className="mt-2">
            <ConfidenceChip level={site.warning.confidence} />
          </div>
        </InsightPanel>
      )}

      <div className="rounded-lg border border-line bg-white p-5">
        <SectionLabel>Participants · aggregated, governed (§4)</SectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "In screening", n: site.funnel.screening },
            { label: "Eligible", n: site.funnel.eligible },
            { label: "Enrolled", n: site.funnel.enrolled },
            { label: "Target", n: site.target },
          ].map((x) => (
            <div key={x.label} className="rounded-lg bg-surface p-3 text-center">
              <p className="text-xl font-semibold text-ink">{x.n}</p>
              <p className="text-[12px] text-body">{x.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-meta">
          Access to personal data is server-side, logged, and attributable to a
          person.
        </p>
      </div>

      {/* Audit log, in the context of the site information panel (§4/§7) */}
      <div className="rounded-lg border border-line bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Clock size={16} className="text-brand-orange" />
          <SectionLabel>Audit log</SectionLabel>
        </div>
        <AuditTrail entries={siteAudit(site)} />
        <p className="mt-3 text-[11px] text-meta">
          Immutable, attributable record. Every change and access is time-stamped
          and written to the validated audit store (§4).
        </p>
      </div>
    </div>
  );
}

// ---------------- Cross-trial views ----------------
const SEVERITY_TONE: Record<Severity, { cls: string; label: string }> = {
  High: { cls: "text-[#c22f2f] bg-[#ef4444]/12", label: "High" },
  Medium: { cls: "text-[#a66a00] bg-[#f59e0b]/15", label: "Medium" },
  Low: { cls: "text-body bg-surface", label: "Low" },
};

const SEVERITY_RANK: Record<Severity, number> = { High: 0, Medium: 1, Low: 2 };

function WarningsView() {
  const warnings = [...EARLY_WARNINGS].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
  );
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-ink">Early warnings</h2>
        <p className="mt-1 max-w-3xl text-sm text-body">
          Predicted before sites slip, sharpened by Site Team screen-failure and
          Companion dropout signals.
        </p>
      </div>

      <div className="rounded-lg bg-ai-indigo-tint p-4 text-sm text-ink">
        Each warning can generate an{" "}
        <span className="font-semibold">agent remediation plan</span> with
        specific interventions. Review, edit, and approve before deployment. All
        actions are human-gated and audit-logged.
      </div>

      {warnings.map((w) => (
        <WarningCard key={w.id} warning={w} />
      ))}
    </div>
  );
}

function WarningCard({ warning: w }: { warning: EarlyWarning }) {
  const [selected, setSelected] = useState(0);
  const [owner, setOwner] = useState(w.owners[0]);
  const [notes, setNotes] = useState("");
  const [deployed, setDeployed] = useState<string | null>(null);

  const plan = useAgentRun({
    steps: [
      "Analysing the signal and its evidence",
      "Modelling intervention options",
      "Drafting the remediation plan",
    ],
    duration: 2600,
    result: true,
  });

  const sev = SEVERITY_TONE[w.severity];

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-meta">{w.trialCode}</p>
          <h3 className="mt-0.5 text-base font-semibold text-ink">{w.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${sev.cls}`}
          >
            {sev.label}
          </span>
          <AIBadge working={plan.phase === "running"} />
        </div>
      </div>

      <p className="mt-2 text-sm text-body">{w.description}</p>

      {/* Agent recommendation */}
      <div className="mt-4 rounded-lg bg-surface p-4">
        <p className="text-sm font-semibold text-ink">Agent recommendation</p>
        <p className="mt-1 text-sm text-body">{w.recommendation}</p>
      </div>

      {/* Step 1: CTA to generate the plan */}
      {plan.phase === "idle" && (
        <div className="mt-4">
          <Button variant="ai" onClick={plan.run}>
            <Sparkle size={15} /> Generate agent remediation plan
          </Button>
        </div>
      )}

      {/* Step 2: AI assessment in progress */}
      {plan.phase === "running" && (
        <div className="mt-4 rounded-lg border border-ai-indigo/20 p-4">
          <div className="ai-shimmer rounded-md px-3 py-2.5">
            <p className="flex items-center gap-2 text-[13px] font-medium text-ai-indigo">
              <Sparkle size={14} className="sparkle-working" /> AI assessment in
              progress: {plan.message}…
            </p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ai-indigo transition-all"
              style={{ width: `${Math.round(plan.progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 3: remediation options + human review + deploy CTA */}
      {plan.phase === "done" && !deployed && (
        <div className="mt-4 rounded-lg bg-ai-indigo-tint p-4 fade-up">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ai-indigo">
              Remediation options
            </span>
            <AIBadge />
            <span className="text-[12px] text-body">Human review required</span>
          </div>

          <div className="space-y-2">
            {w.options.map((o, i) => {
              const active = selected === i;
              return (
                <button
                  key={o.title}
                  onClick={() => setSelected(i)}
                  className={`flex w-full items-start gap-3 rounded-lg border bg-white p-3 text-left transition-colors ${
                    active ? "border-ai-indigo" : "border-line hover:bg-surface"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-ai-indigo" : "border-line"
                    }`}
                  >
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-ai-indigo" />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {o.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-body">
                      {o.detail}
                    </span>
                    <span className="mt-1 block text-[12px] text-meta">
                      {o.impact} · Agent tier: {o.tier}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-[13px] font-medium text-ink">
              Assign owner
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand-orange"
              >
                {w.owners.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="block text-[13px] font-medium text-ink">
              Human review notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add context or edits before deploying…"
                className="mt-1 w-full rounded-lg border border-line bg-white p-3 text-sm outline-none focus:border-brand-orange"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={() => setDeployed(w.options[selected].title)}
            >
              <Check size={15} /> Approve &amp; deploy
            </Button>
            <Button variant="secondary" onClick={() => setDeployed(w.options[selected].title)}>
              Assign without closing
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation: deployed and recorded */}
      {deployed && (
        <div className="mt-4 rounded-lg bg-active/10 p-4 fade-up">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#0f7a54]">
            <Check size={16} /> Remediation deployed
          </p>
          <p className="mt-1 text-[13px] text-ink">
            &ldquo;{deployed}&rdquo; assigned to {owner}.
            {notes ? ` Review note recorded.` : ""}
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

// Historic view of the portfolio: changes and updates as an audit log (§4/§7).
function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${
        active
          ? "bg-brand-orange/10 font-semibold text-brand-orange"
          : "border border-line font-medium text-body hover:bg-surface"
      }`}
    >
      {label}
    </button>
  );
}

function AuditView() {
  const [trialFilter, setTrialFilter] = useState<string>("all");
  const entries = portfolioAudit(trialFilter);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-ink">History and audit log</h2>
        <p className="mt-1 max-w-2xl text-sm text-body">
          A traceable history of changes and updates across the portfolio. Every
          agent flag, human decision, and system event is time-stamped,
          attributable, and recorded (§4, §7). Every entry elsewhere in the
          product opens its own scoped audit log.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill
          active={trialFilter === "all"}
          onClick={() => setTrialFilter("all")}
          label={`All trials (${AUDIT_LOG.length})`}
        />
        {TRIALS.map((t) => (
          <FilterPill
            key={t.id}
            active={trialFilter === t.id}
            onClick={() => setTrialFilter(t.id)}
            label={`${t.name} (${AUDIT_LOG.filter((e) => e.trialId === t.id).length})`}
          />
        ))}
      </div>

      <AuditTrail entries={entries} />
    </div>
  );
}

// ---------------- Site Reports ----------------
function reportStatus(site: Site): { tone: StatusTone; label: string } {
  if (site.activation === "escalated") return { tone: "escalated", label: "At Risk" };
  if (site.activation === "paused") return { tone: "paused", label: "Activating" };
  return { tone: "active", label: "On Track" };
}

function SiteReportsView({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-ink">Site reports</h2>
        <p className="mt-1 max-w-2xl text-sm text-body">
          Every site across the portfolio, with its recruitment funnel and status
          at a glance. Open a site for its full report.
        </p>
      </div>
      <div className="space-y-3">
        {SITES.map((s) => {
          const trial = TRIALS.find((t) => t.id === s.trialId)!;
          const st = reportStatus(s);
          return (
            <button
              key={s.id}
              onClick={() => onOpen(s.id)}
              className="block w-full rounded-lg border border-line bg-white p-5 text-left transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] text-meta">{trial.code}</p>
                  <h3 className="mt-0.5 text-base font-semibold text-ink">
                    {s.institution}
                  </h3>
                  <p className="text-[13px] text-body">
                    {s.city}, {s.country}
                  </p>
                  <p className="mt-3 text-[13px] text-body">
                    Enrolled {s.funnel.enrolled}/{s.target} · Discovered{" "}
                    {s.funnel.discovered} · Screening {s.funnel.screening}
                  </p>
                </div>
                <StatusPill tone={st.tone}>{st.label}</StatusPill>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const REPORT_FUNNEL_COLORS = [
  "bg-[#9AA5B4]",
  "bg-ai-indigo",
  "bg-paused",
  "bg-ai-teal",
  "bg-brand-orange",
];

function ReportFunnel({ funnel }: { funnel: Site["funnel"] }) {
  const steps = [
    { label: "Discovered", n: funnel.discovered },
    { label: "Shortlisted", n: funnel.shortlisted },
    { label: "Screening", n: funnel.screening },
    { label: "Eligible", n: funnel.eligible },
    { label: "Enrolled", n: funnel.enrolled },
  ];
  const max = Math.max(...steps.map((s) => s.n), 1);
  return (
    <div className="mt-6 grid grid-cols-5 items-end gap-3">
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-col items-center">
          {/* Column height reflects the count relative to the widest stage */}
          <div className="flex h-32 w-full items-end">
            <div
              className={`w-full rounded-t-md ${REPORT_FUNNEL_COLORS[i]}`}
              style={{ height: `${Math.max(4, (s.n / max) * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-2xl font-semibold text-ink">{s.n}</p>
          <p className="mt-0.5 text-[13px] text-meta">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function SiteReportDetail({
  site,
  onBack,
}: {
  site: Site;
  onBack: () => void;
}) {
  const openParticipant = useOpenParticipant();
  const trial = TRIALS.find((t) => t.id === site.trialId)!;
  const participants = siteParticipants(site);
  const st = reportStatus(site);
  const conversion = site.funnel.screening
    ? Math.round((site.funnel.enrolled / site.funnel.screening) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-ink">{site.institution}</h2>
          <p className="text-[13px] text-meta">
            {site.city}, {site.country} · {trial.code}
          </p>
        </div>
        <StatusPill tone={st.tone}>{st.label}</StatusPill>
      </div>

      <div className="rounded-lg border border-line bg-white p-5">
        <h3 className="text-base font-semibold text-ink">Site recruitment funnel</h3>
        <ReportFunnel funnel={site.funnel} />
        <p className="mt-5 text-[13px] text-body">
          Site target: {site.target} enrolled. Currently {site.funnel.enrolled}/
          {site.target}. Screen-to-enrol conversion: {conversion}%.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-3">
          <SectionLabel>Enrolled participants</SectionLabel>
        </div>
        {participants.length === 0 ? (
          <p className="px-5 py-6 text-sm text-meta">
            No patients enrolled at this site yet.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {participants.map((p) => (
              <button
                key={p.code}
                onClick={() =>
                  openParticipant?.(p, {
                    siteName: site.name,
                    trialCode: trial.code,
                  })
                }
                className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-brand-orange/5"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {p.name}{" "}
                    <span className="font-normal text-meta">
                      ({p.sex}, {p.age})
                    </span>
                  </p>
                  <p className="text-[13px] text-meta">
                    {p.code} · {p.cycle}
                  </p>
                </div>
                <span className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#0f7a54]">
                    <span className="h-2 w-2 rounded-full bg-active" /> Active
                  </span>
                  <ChevronRight size={15} className="text-meta" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Audit log, in the context of the site report panel (§4/§7) */}
      <div className="rounded-lg border border-line bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Clock size={16} className="text-brand-orange" />
          <SectionLabel>Audit log</SectionLabel>
        </div>
        <AuditTrail entries={siteAudit(site)} />
        <p className="mt-3 text-[11px] text-meta">
          Immutable, attributable record. Every change and access is time-stamped
          and written to the validated audit store (§4).
        </p>
      </div>

      <BackLink onClick={onBack} label="Back to site reports" />
    </div>
  );
}

function BackLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[13px] font-medium text-body hover:text-ink"
    >
      <ArrowLeft size={15} /> {label}
    </button>
  );
}
