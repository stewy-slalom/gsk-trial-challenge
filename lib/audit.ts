import {
  AUDIT_LOG,
  CANDIDATES,
  type AuditCategory,
} from "./data";
import type { Candidate, Site } from "./types";

// A single, reusable audit item so every entity — candidate, patient, site,
// trial, participant — can surface the same recorded, attributable trail
// (spec §4: everything logged, attributable, auditable; §7: agent flag ->
// human resolution -> attributable record).
export interface AuditItem {
  date: string;
  time?: string;
  actor: string;
  event: string;
  category?: AuditCategory;
  context?: string; // e.g. trial code, shown as a small tag in the portfolio log
}

function inferCategory(event: string): AuditCategory {
  const e = event.toLowerCase();
  if (e.includes("consent")) return "Consent";
  if (e.includes("diversity") || e.includes("represent")) return "Diversity";
  if (e.includes("disengag") || e.includes("warning") || e.includes("flag"))
    return "Early warning";
  if (e.includes("activat")) return "Activation";
  if (e.includes("milestone") || e.includes("screening open")) return "Milestone";
  if (
    e.includes("enrol") ||
    e.includes("eligible") ||
    e.includes("screen") ||
    e.includes("randomis")
  )
    return "Enrolment";
  return "Access";
}

// Every recorded event on a candidate / patient, newest first.
export function candidateAudit(c: Candidate): AuditItem[] {
  return [...c.history].reverse().map((h) => ({
    date: h.date,
    actor: h.by ?? "System",
    event: h.event,
    category: inferCategory(h.event),
  }));
}

// Portfolio events scoped to one trial.
export function trialAudit(trialId: string): AuditItem[] {
  return AUDIT_LOG.filter((e) => e.trialId === trialId).map((e) => ({
    date: e.date,
    time: e.time,
    actor: e.actor,
    event: e.event,
    category: e.category,
    context: e.trialCode,
  }));
}

// The whole portfolio, with trial code as context.
export function portfolioAudit(trialId: string | "all"): AuditItem[] {
  const src = trialId === "all" ? AUDIT_LOG : AUDIT_LOG.filter((e) => e.trialId === trialId);
  return src.map((e) => ({
    date: e.date,
    time: e.time,
    actor: e.actor,
    event: e.event,
    category: e.category,
    context: e.trialCode,
  }));
}

// Events scoped to one site: tagged portfolio events, then a baseline
// activation trail derived from the site's own state.
export function siteAudit(site: Site): AuditItem[] {
  const tagged: AuditItem[] = AUDIT_LOG.filter((e) => e.siteId === site.id).map(
    (e) => ({
      date: e.date,
      time: e.time,
      actor: e.actor,
      event: e.event,
      category: e.category,
    })
  );
  const baseline: AuditItem[] = [
    {
      date: "05 Jun 2026",
      time: "06:12",
      actor: "Agent",
      event: `Initial discovery sweep completed: ${site.funnel.discovered} candidates found across site records.`,
      category: "Access",
    },
    {
      date: "02 Jun 2026",
      time: "09:00",
      actor: "CTM · M. Delgado",
      event: `Site activated (M1). Enrolment target set to ${site.target}.`,
      category: "Milestone",
    },
  ];
  return [...tagged, ...baseline];
}

// Events scoped to one participant. Uses the real candidate history where we
// have it (hero site), otherwise a standard, plausible enrolment trail.
export function participantAudit(code: string, cycle: string): AuditItem[] {
  const match = CANDIDATES.find((c) => c.code === code);
  if (match) return candidateAudit(match);
  return [
    {
      date: "13 Jul 2026",
      time: "07:30",
      actor: "Agent",
      event: `Latest check-in signals recorded (${cycle}). No retention flag raised.`,
      category: "Access",
    },
    {
      date: "18 Jun 2026",
      time: "10:05",
      actor: "RTSM (system)",
      event: "Enrolled and randomised.",
      category: "Enrolment",
    },
    {
      date: "16 Jun 2026",
      time: "14:20",
      actor: "Site PI",
      event: "Confirmed eligible after agent eligibility pre-check.",
      category: "Enrolment",
    },
    {
      date: "11 Jun 2026",
      time: "09:15",
      actor: "Agent",
      event: "Screening results aggregated, decision-ready alert raised.",
      category: "Enrolment",
    },
    {
      date: "05 Jun 2026",
      time: "06:12",
      actor: "Agent",
      event: "Surfaced by discovery sweep and ranked to shortlist.",
      category: "Access",
    },
  ];
}
