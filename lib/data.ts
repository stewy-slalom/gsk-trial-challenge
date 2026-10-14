import type { Candidate, Milestone, Site, Trial } from "./types";

// ------------------------------------------------------------------
// Seed data. All figures are illustrative and must be replaced with
// validated, governed data before real use (spec §11). The funnel is
// seeded coherently — ~104 discovered at the hero site narrows to 14
// eligible and an enrolled cohort — so all three experiences tell one
// story (§11).
// ------------------------------------------------------------------

export const MILESTONE_TEMPLATE: Omit<Milestone, "reached" | "current">[] = [
  {
    id: "M1",
    label: "Site activation",
    lever: "Broaden the site mix for prevalence and diversity. Agent chases activation blockers to compress start-up.",
    autonomy: "Agent",
  },
  {
    id: "M2",
    label: "First patient in",
    lever: "Decentralised and community referral routes. Agent maps and activates underused referral pathways.",
    autonomy: "Agent",
  },
  {
    id: "M3",
    label: "Screening open",
    lever: "Criteria breadth and adaptive design to cut screen-fail. Agent analyses screen-failure causes and recommends refinements.",
    autonomy: "Assist",
  },
  {
    id: "M4",
    label: "Consent",
    lever: "Consent readability, fewer amendment re-consents. Agent drafts re-consent comms; approval human.",
    autonomy: "Assist",
  },
  {
    id: "M5",
    label: "Enrolment target",
    lever: "Visit schedule and decentralised elements to reduce burden.",
    autonomy: "Assist",
  },
  {
    id: "M6",
    label: "Retention / LPLV",
    lever: "Remote monitoring keeps patients on-study.",
    autonomy: "Agent",
  },
];

export function milestonesFor(index: number): Milestone[] {
  return MILESTONE_TEMPLATE.map((m, i) => ({
    ...m,
    reached: i + 1 < index,
    current: i + 1 === index,
  }));
}

// ------------------------------------------------------------------
// Trials (portfolio of three concurrent trials)
// ------------------------------------------------------------------

export const TRIALS: Trial[] = [
  {
    id: "solaris",
    code: "CVN'916",
    name: "SOLARIS-2",
    indication: "Advanced NSCLC, STK11 / KEAP1 co-mutation",
    phase: "Phase II",
    target: 48,
    enrolled: 31,
    status: "active",
    statusLabel: "On track",
    milestoneIndex: 3,
    topInsight: {
      text: "Screen-failure rate at Manchester is 2.1x the trial average, driven by prior-therapy washout. Refining the washout window could recover an estimated 6 to 9 candidates.",
      confidence: "High",
      evidence: "42 screen-fails across 4 sites, last 60 days",
      tone: "escalated",
    },
    geography: [
      { country: "United Kingdom", count: 18 },
      { country: "United States", count: 11 },
      { country: "Spain", count: 2 },
    ],
    diversity: [
      { group: "White", actual: 61, plan: 58 },
      { group: "Black / African", actual: 9, plan: 14 },
      { group: "Asian", actual: 19, plan: 18 },
      { group: "Hispanic / Latino", actual: 11, plan: 10 },
    ],
    screenFail: [
      { reason: "Prior-therapy washout window", count: 16 },
      { reason: "Insufficient biomarker expression", count: 12 },
      { reason: "ECOG performance status", count: 8 },
      { reason: "Organ function thresholds", count: 6 },
    ],
  },
  {
    id: "helios",
    code: "CVN'742",
    name: "HELIOS-B",
    indication: "Metastatic colorectal, MSI-high",
    phase: "Phase II",
    target: 40,
    enrolled: 12,
    status: "escalated",
    statusLabel: "At risk",
    milestoneIndex: 2,
    topInsight: {
      text: "Two of five sites remain un-activated 9 weeks past plan. Predicted first-patient-in slips 5 weeks unless a community referral route is opened in the Midlands.",
      confidence: "Moderate",
      evidence: "Activation task log, 2 sites blocked on IRB",
      tone: "escalated",
    },
    geography: [
      { country: "United States", count: 7 },
      { country: "United Kingdom", count: 4 },
      { country: "Germany", count: 1 },
    ],
    diversity: [
      { group: "White", actual: 72, plan: 60 },
      { group: "Black / African", actual: 8, plan: 15 },
      { group: "Asian", actual: 12, plan: 15 },
      { group: "Hispanic / Latino", actual: 8, plan: 10 },
    ],
    screenFail: [
      { reason: "MSI status unconfirmed", count: 9 },
      { reason: "Prior lines of therapy", count: 5 },
      { reason: "Comorbidity exclusion", count: 4 },
    ],
  },
  {
    id: "aurora",
    code: "CVN'508",
    name: "AURORA",
    indication: "Ovarian, BRCA-mutated, platinum-sensitive",
    phase: "Phase II",
    target: 36,
    enrolled: 34,
    status: "active",
    statusLabel: "Near target",
    milestoneIndex: 5,
    topInsight: {
      text: "Enrolment is 94% of target with strong retention. Diversity plan is met on all groups. Recommend holding site additions and shifting focus to LPLV monitoring.",
      confidence: "High",
      evidence: "34 of 36 enrolled, dropout 4% vs 11% benchmark",
      tone: "active",
    },
    geography: [
      { country: "United States", count: 19 },
      { country: "United Kingdom", count: 12 },
      { country: "France", count: 3 },
    ],
    diversity: [
      { group: "White", actual: 57, plan: 58 },
      { group: "Black / African", actual: 15, plan: 14 },
      { group: "Asian", actual: 17, plan: 18 },
      { group: "Hispanic / Latino", actual: 11, plan: 10 },
    ],
    screenFail: [
      { reason: "Platinum-free interval", count: 4 },
      { reason: "Prior PARP inhibitor", count: 3 },
    ],
  },
];

// ------------------------------------------------------------------
// Sites (per trial). Hero site is Guy's, London on the SOLARIS-2 trial.
// ------------------------------------------------------------------

export const SITES: Site[] = [
  {
    id: "guys",
    trialId: "solaris",
    name: "Site 04 — Guy's",
    city: "London",
    country: "United Kingdom",
    institution: "Guy's and St Thomas' NHS Foundation Trust",
    activation: "active",
    activationLabel: "Active",
    funnel: { discovered: 104, shortlisted: 40, screening: 22, eligible: 14, enrolled: 6 },
    target: 12,
    warning: {
      tone: "active",
      text: "Shortlist conversion is above trial average. No intervention needed.",
      confidence: "High",
      evidence: "6 enrolled from 14 eligible, last 90 days",
    },
  },
  {
    id: "manchester",
    trialId: "solaris",
    name: "Site 07 — Manchester",
    city: "Manchester",
    country: "United Kingdom",
    institution: "The Christie NHS Foundation Trust",
    activation: "escalated",
    activationLabel: "Screen-fail spike",
    funnel: { discovered: 88, shortlisted: 31, screening: 18, eligible: 5, enrolled: 4 },
    target: 12,
    warning: {
      tone: "escalated",
      text: "Screen-failure rate 2.1x trial average. Prior-therapy washout is the leading cause.",
      confidence: "High",
      evidence: "16 screen-fails in 60 days, 11 washout-related",
    },
  },
  {
    id: "boston",
    trialId: "solaris",
    name: "Site 11 — Boston",
    city: "Boston",
    country: "United States",
    institution: "Dana-Farber Cancer Institute",
    activation: "active",
    activationLabel: "Active",
    funnel: { discovered: 96, shortlisted: 35, screening: 20, eligible: 12, enrolled: 11 },
    target: 12,
    warning: {
      tone: "active",
      text: "Strongest enrolment in the trial. Diversity mix ahead of plan.",
      confidence: "High",
      evidence: "11 enrolled, 38% from under-represented groups",
    },
  },
  {
    id: "madrid",
    trialId: "solaris",
    name: "Site 15 — Madrid",
    city: "Madrid",
    country: "Spain",
    institution: "Hospital Universitario 12 de Octubre",
    activation: "paused",
    activationLabel: "Activating",
    funnel: { discovered: 41, shortlisted: 9, screening: 3, eligible: 2, enrolled: 2 },
    target: 12,
    warning: {
      tone: "paused",
      text: "Recently activated. Discovery sweep scheduled to complete this week.",
      confidence: "Moderate",
      evidence: "Activated 18 days ago, first sweep in progress",
    },
  },

  // HELIOS-B (CVN'742) sites
  {
    id: "chicago",
    trialId: "helios",
    name: "Site 02 — Chicago",
    city: "Chicago",
    country: "United States",
    institution: "Chicago Comprehensive Cancer Center",
    activation: "active",
    activationLabel: "Active",
    funnel: { discovered: 82, shortlisted: 24, screening: 13, eligible: 9, enrolled: 7 },
    target: 9,
    warning: {
      tone: "active",
      text: "Leading site for this trial. Enrolment ahead of plan.",
      confidence: "High",
      evidence: "7 enrolled of 9 target",
    },
  },
  {
    id: "birmingham",
    trialId: "helios",
    name: "Site 09 — Birmingham",
    city: "Birmingham",
    country: "United Kingdom",
    institution: "Queen Elizabeth Hospital Birmingham",
    activation: "active",
    activationLabel: "Active",
    funnel: { discovered: 60, shortlisted: 18, screening: 9, eligible: 5, enrolled: 4 },
    target: 9,
    warning: {
      tone: "active",
      text: "Steady recruitment. No intervention needed.",
      confidence: "Moderate",
      evidence: "4 enrolled of 9 target",
    },
  },
  {
    id: "berlin",
    trialId: "helios",
    name: "Site 12 — Berlin",
    city: "Berlin",
    country: "Germany",
    institution: "Charite Universitatsmedizin Berlin",
    activation: "escalated",
    activationLabel: "Activation blocked",
    funnel: { discovered: 22, shortlisted: 5, screening: 2, eligible: 1, enrolled: 1 },
    target: 9,
    warning: {
      tone: "escalated",
      text: "Activation 9 weeks past plan, blocked on IRB. Community referral route recommended.",
      confidence: "Moderate",
      evidence: "IRB approval pending, first-patient-in slipping",
    },
  },

  // AURORA (CVN'508) sites
  {
    id: "newyork",
    trialId: "aurora",
    name: "Site 01 — New York",
    city: "New York",
    country: "United States",
    institution: "Memorial Sloan Kettering Cancer Center",
    activation: "active",
    activationLabel: "Active",
    funnel: { discovered: 120, shortlisted: 40, screening: 24, eligible: 21, enrolled: 19 },
    target: 20,
    warning: {
      tone: "active",
      text: "Strongest site in the portfolio. Retention above benchmark.",
      confidence: "High",
      evidence: "19 enrolled of 20 target, dropout 4%",
    },
  },
  {
    id: "londonaur",
    trialId: "aurora",
    name: "Site 06 — London",
    city: "London",
    country: "United Kingdom",
    institution: "The Royal Marsden",
    activation: "active",
    activationLabel: "Active",
    funnel: { discovered: 96, shortlisted: 30, screening: 16, eligible: 13, enrolled: 12 },
    target: 12,
    warning: {
      tone: "active",
      text: "At target. Diversity plan met on all groups.",
      confidence: "High",
      evidence: "12 enrolled of 12 target",
    },
  },
  {
    id: "paris",
    trialId: "aurora",
    name: "Site 08 — Paris",
    city: "Paris",
    country: "France",
    institution: "Institut Curie",
    activation: "active",
    activationLabel: "Active",
    funnel: { discovered: 30, shortlisted: 8, screening: 4, eligible: 3, enrolled: 3 },
    target: 4,
    warning: {
      tone: "active",
      text: "Near target. Holding site additions.",
      confidence: "Moderate",
      evidence: "3 enrolled of 4 target",
    },
  },
];

export function sitesForTrial(trialId: string): Site[] {
  return SITES.filter((s) => s.trialId === trialId);
}

// ------------------------------------------------------------------
// Candidates for the hero site (Guy's / SOLARIS-2). Detailed cards
// across the pipeline; the wider discovery pool is represented as a
// count (spec §6.2 — ~100 discovered, wide funnel).
// ------------------------------------------------------------------

export const DISCOVERY_POOL_REMAINING = 58; // still in discover stage, not yet triaged

// Patient names by subject ID. The site team is in charge of their patients,
// so they see the name; the ID stays as a secondary reference (spec §6.2).
const NAME_BY_CODE: Record<string, string> = {
  "PT-0421": "Grace Adeyemi",
  "PT-0388": "Peter Whitfield",
  "PT-0450": "Mei Lin Tan",
  "PT-0362": "Rajesh Patel",
  "PT-0339": "Susan Fletcher",
  "PT-0301": "Carmen Ortiz",
  "PT-0295": "Michael Brennan",
  "PT-0277": "David Sullivan",
  "PT-0268": "Yuki Tanaka",
  "PT-0212": "Amara Okafor",
  "PT-0198": "George Halstead",
  "PT-0184": "Lucia Fernandez",
  "PT-0512": "Priya Nair",
  "PT-0524": "Robert Ellis",
};

const CANDIDATES_RAW: Omit<Candidate, "name">[] = [
  // ---- Shortlist (Assist: ranked, awaiting "Begin screening") ----
  {
    id: "c-shortlist-1",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0421",
    age: 64,
    sex: "F",
    ethnicity: "Black / African",
    biomarker: "STK11 mut, KEAP1 mut, PD-L1 45%",
    stage: "shortlist",
    matchScore: 92,
    confidence: "High",
    provenance: "EHR + molecular panel · matched by discovery agent · 13 Jul 2026, 06:12",
    rationale: [
      "Stage IV adenocarcinoma confirmed on 02 Jul biopsy",
      "STK11 and KEAP1 co-mutation present, matches primary criterion",
      "One prior line of platinum doublet, within protocol",
      "ECOG 1, organ function within thresholds on last panel",
    ],
    improvesRepresentation: true,
    notes: "Under-represented group for this indication. Prioritise for point-of-care prompt.",
    history: [
      { date: "13 Jul 2026", event: "Surfaced by discovery sweep", by: "Agent" },
      { date: "13 Jul 2026", event: "Ranked to shortlist, confidence High", by: "Agent" },
    ],
  },
  {
    id: "c-shortlist-2",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0388",
    age: 71,
    sex: "M",
    ethnicity: "White",
    biomarker: "STK11 mut, PD-L1 10%",
    stage: "shortlist",
    matchScore: 78,
    confidence: "Moderate",
    provenance: "EHR + molecular panel · matched by discovery agent · 13 Jul 2026, 06:12",
    rationale: [
      "Stage IIIB, borderline for metastatic criterion, needs review",
      "STK11 mutation present, KEAP1 status pending confirmation",
      "ECOG 1, no exclusionary comorbidities on record",
    ],
    improvesRepresentation: false,
    notes: "KEAP1 confirmation outstanding, reflected in Moderate confidence.",
    history: [
      { date: "13 Jul 2026", event: "Surfaced by discovery sweep", by: "Agent" },
      { date: "13 Jul 2026", event: "Ranked to shortlist, confidence Moderate", by: "Agent" },
    ],
  },
  {
    id: "c-shortlist-3",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0450",
    age: 58,
    sex: "F",
    ethnicity: "Asian",
    biomarker: "STK11 mut, KEAP1 mut, PD-L1 60%",
    stage: "shortlist",
    matchScore: 88,
    confidence: "High",
    provenance: "EHR + molecular panel · matched by discovery agent · 13 Jul 2026, 06:12",
    rationale: [
      "Stage IV, co-mutation confirmed, high PD-L1",
      "Treatment-naive for metastatic disease",
      "Lives 12 min from site, low travel burden",
    ],
    improvesRepresentation: true,
    history: [
      { date: "13 Jul 2026", event: "Surfaced by discovery sweep", by: "Agent" },
      { date: "13 Jul 2026", event: "Ranked to shortlist, confidence High", by: "Agent" },
    ],
  },

  // ---- In screening (Agent aggregates, humans examine) ----
  {
    id: "c-screening-1",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0362",
    age: 67,
    sex: "M",
    ethnicity: "Asian",
    biomarker: "STK11 mut, KEAP1 mut, PD-L1 30%",
    stage: "screening",
    matchScore: 90,
    confidence: "High",
    provenance: "Results aggregated by agent · 13 Jul 2026, 08:40",
    rationale: [
      "Co-mutation confirmed, primary criterion met",
      "Awaiting final lab panel to confirm organ function",
    ],
    improvesRepresentation: true,
    screening: [
      { label: "Molecular panel", status: "complete", value: "STK11 + KEAP1 confirmed", updated: "11 Jul", source: "Molecular pathology" },
      { label: "Staging CT scan", status: "complete", value: "Stage IV confirmed", updated: "10 Jul", source: "Radiology PACS" },
      { label: "Renal / hepatic labs", status: "pending", source: "Central lab" },
      { label: "ECOG assessment", status: "complete", value: "ECOG 1", updated: "12 Jul", source: "Clinic note" },
    ],
    history: [
      { date: "10 Jul 2026", event: "Promoted to screening", by: "R. Osei, CRC" },
      { date: "13 Jul 2026", event: "Scan and molecular results aggregated", by: "Agent" },
    ],
  },
  {
    id: "c-screening-2",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0339",
    age: 62,
    sex: "F",
    ethnicity: "White",
    biomarker: "STK11 mut, KEAP1 mut, PD-L1 25%",
    stage: "screening",
    matchScore: 85,
    confidence: "High",
    provenance: "Results aggregated by agent · 13 Jul 2026, 09:05",
    rationale: [
      "All screening data now in, decision-ready",
      "Agent alert raised: eligibility pre-check ready for human confirmation",
    ],
    improvesRepresentation: false,
    screening: [
      { label: "Molecular panel", status: "complete", value: "STK11 + KEAP1 confirmed", updated: "09 Jul", source: "Molecular pathology" },
      { label: "Staging CT scan", status: "complete", value: "Stage IV confirmed", updated: "08 Jul", source: "Radiology PACS" },
      { label: "Renal / hepatic labs", status: "complete", value: "Within thresholds", updated: "12 Jul", source: "Central lab" },
      { label: "ECOG assessment", status: "complete", value: "ECOG 0", updated: "11 Jul", source: "Clinic note" },
    ],
    history: [
      { date: "08 Jul 2026", event: "Promoted to screening", by: "R. Osei, CRC" },
      { date: "13 Jul 2026", event: "All results in, decision-ready alert", by: "Agent" },
    ],
  },

  // ---- Eligible / confirmed (Assist → Human decision) ----
  {
    id: "c-eligible-1",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0301",
    age: 69,
    sex: "F",
    ethnicity: "Hispanic / Latino",
    biomarker: "STK11 mut, KEAP1 mut, PD-L1 50%",
    stage: "eligible",
    matchScore: 94,
    confidence: "High",
    provenance: "Eligibility pre-check by agent · confirmed by Dr A. Mensah · 12 Jul 2026",
    rationale: [
      "All inclusion criteria met, no exclusions",
      "Agent pre-check agreed with clinician confirmation",
    ],
    improvesRepresentation: true,
    notes: "Ready to move to consent preparation.",
    history: [
      { date: "09 Jul 2026", event: "Promoted to screening", by: "R. Osei, CRC" },
      { date: "12 Jul 2026", event: "Eligibility pre-check assembled", by: "Agent" },
      { date: "12 Jul 2026", event: "Confirmed eligible", by: "Dr A. Mensah, PI" },
    ],
  },
  {
    id: "c-eligible-2",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0295",
    age: 55,
    sex: "M",
    ethnicity: "White",
    biomarker: "STK11 mut, KEAP1 mut, PD-L1 20%",
    stage: "eligible",
    matchScore: 89,
    confidence: "High",
    provenance: "Eligibility pre-check by agent · confirmed by Dr A. Mensah · 11 Jul 2026",
    rationale: ["Criteria met, organ function confirmed", "In consent preparation"],
    improvesRepresentation: false,
    history: [
      { date: "07 Jul 2026", event: "Promoted to screening", by: "R. Osei, CRC" },
      { date: "11 Jul 2026", event: "Confirmed eligible", by: "Dr A. Mensah, PI" },
    ],
  },

  // ---- Screen-fail (recorded, feeds criteria-refinement analysis) ----
  {
    id: "c-screenfail-1",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0277",
    age: 73,
    sex: "M",
    ethnicity: "White",
    biomarker: "STK11 mut, KEAP1 wt",
    stage: "screenfail",
    matchScore: 61,
    confidence: "Moderate",
    provenance: "Screen-fail recorded by Dr A. Mensah · 10 Jul 2026",
    rationale: ["KEAP1 wild-type on confirmation, primary criterion not met"],
    screenFailReason: "Insufficient biomarker expression (KEAP1 wild-type)",
    improvesRepresentation: false,
    history: [
      { date: "05 Jul 2026", event: "Promoted to screening", by: "R. Osei, CRC" },
      { date: "10 Jul 2026", event: "Marked screen-fail", by: "Dr A. Mensah, PI" },
    ],
  },
  {
    id: "c-screenfail-2",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0268",
    age: 66,
    sex: "F",
    ethnicity: "Asian",
    biomarker: "STK11 mut, KEAP1 mut",
    stage: "screenfail",
    matchScore: 70,
    confidence: "Moderate",
    provenance: "Screen-fail recorded by Dr A. Mensah · 08 Jul 2026",
    rationale: ["Prior-therapy washout window not met by 11 days"],
    screenFailReason: "Prior-therapy washout window",
    improvesRepresentation: true,
    history: [
      { date: "02 Jul 2026", event: "Promoted to screening", by: "R. Osei, CRC" },
      { date: "08 Jul 2026", event: "Marked screen-fail", by: "Dr A. Mensah, PI" },
    ],
  },

  // ---- Enrolled / on-trial ----
  {
    id: "c-enrolled-1",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0212",
    age: 60,
    sex: "F",
    ethnicity: "Black / African",
    biomarker: "STK11 mut, KEAP1 mut, PD-L1 55%",
    stage: "enrolled",
    matchScore: 96,
    confidence: "High",
    provenance: "Enrolled and randomised in RTSM · 20 Jun 2026",
    rationale: ["Active on trial, cycle 3", "Retention signals stable"],
    improvesRepresentation: true,
    cyclePosition: "Cycle 3 of 6",
    nextVisit: "Tue 15 Jul, 10:30 — in person",
    history: [
      { date: "18 Jun 2026", event: "Confirmed eligible", by: "Dr A. Mensah, PI" },
      { date: "19 Jun 2026", event: "Consent signed", by: "Patient + Dr A. Mensah" },
      { date: "20 Jun 2026", event: "Enrolled and randomised", by: "RTSM (system)" },
    ],
  },
  {
    id: "c-enrolled-2",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0198",
    age: 68,
    sex: "M",
    ethnicity: "White",
    biomarker: "STK11 mut, KEAP1 mut, PD-L1 35%",
    stage: "enrolled",
    matchScore: 91,
    confidence: "High",
    provenance: "Enrolled and randomised in RTSM · 05 Jun 2026",
    rationale: ["Active on trial, cycle 4", "Missed one check-in, gentle flag raised"],
    improvesRepresentation: false,
    cyclePosition: "Cycle 4 of 6",
    nextVisit: "Thu 17 Jul, 09:00 — televisit",
    retentionFlag: "Missed 2 symptom check-ins this cycle. Flagged for a human check-in call.",
    history: [
      { date: "03 Jun 2026", event: "Confirmed eligible", by: "Dr A. Mensah, PI" },
      { date: "04 Jun 2026", event: "Consent signed", by: "Patient + Dr A. Mensah" },
      { date: "05 Jun 2026", event: "Enrolled and randomised", by: "RTSM (system)" },
      { date: "11 Jul 2026", event: "Disengagement signal, flagged for human check-in", by: "Agent" },
    ],
  },
  {
    id: "c-enrolled-3",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0184",
    age: 63,
    sex: "F",
    ethnicity: "Hispanic / Latino",
    biomarker: "STK11 mut, KEAP1 mut, PD-L1 40%",
    stage: "enrolled",
    matchScore: 93,
    confidence: "High",
    provenance: "Enrolled and randomised in RTSM · 28 May 2026",
    rationale: ["Active on trial, cycle 4", "Re-consent for protocol amendment v3 pending"],
    improvesRepresentation: true,
    cyclePosition: "Cycle 4 of 6",
    nextVisit: "Mon 21 Jul, 14:00 — in person",
    retentionFlag: "Re-consent for amendment v3 outstanding. Agent-drafted explainer ready, awaiting clinician delivery.",
    history: [
      { date: "26 May 2026", event: "Confirmed eligible", by: "Dr A. Mensah, PI" },
      { date: "27 May 2026", event: "Consent signed", by: "Patient + Dr A. Mensah" },
      { date: "28 May 2026", event: "Enrolled and randomised", by: "RTSM (system)" },
      { date: "12 Jul 2026", event: "Re-consent explainer drafted for amendment v3", by: "Agent" },
    ],
  },

  // ---- A few sample discover-stage candidates (the wide funnel) ----
  {
    id: "c-discover-1",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0512",
    age: 59,
    sex: "F",
    ethnicity: "Asian",
    biomarker: "STK11 mut, KEAP1 status unknown",
    stage: "discover",
    matchScore: 74,
    confidence: "Moderate",
    provenance: "Surfaced by discovery sweep · 13 Jul 2026, 06:12",
    rationale: ["Potential match, KEAP1 confirmation and staging needed before shortlisting"],
    improvesRepresentation: true,
    history: [{ date: "13 Jul 2026", event: "Surfaced by discovery sweep", by: "Agent" }],
  },
  {
    id: "c-discover-2",
    trialId: "solaris",
    siteId: "guys",
    code: "PT-0524",
    age: 70,
    sex: "M",
    ethnicity: "White",
    biomarker: "STK11 mut, PD-L1 15%",
    stage: "discover",
    matchScore: 66,
    confidence: "Low",
    provenance: "Surfaced by discovery sweep · 13 Jul 2026, 06:12",
    rationale: ["Weaker match, prior-therapy history needs review"],
    improvesRepresentation: false,
    history: [{ date: "13 Jul 2026", event: "Surfaced by discovery sweep", by: "Agent" }],
  },
];

export const CANDIDATES: Candidate[] = CANDIDATES_RAW.map((c) => ({
  ...c,
  name: NAME_BY_CODE[c.code] ?? c.code,
}));

export function candidatesByStage(stage: Candidate["stage"]): Candidate[] {
  return CANDIDATES.filter((c) => c.stage === stage);
}

export const STAGE_META: Record<
  Candidate["stage"],
  { label: string; autonomy: "Agent" | "Assist" | "Human" }
> = {
  discover: { label: "Discover", autonomy: "Agent" },
  shortlist: { label: "Pre-screened", autonomy: "Assist" },
  screening: { label: "In screening", autonomy: "Agent" },
  eligible: { label: "Eligible", autonomy: "Assist" },
  enrolled: { label: "Enrolled", autonomy: "Human" },
  screenfail: { label: "Screen-fail", autonomy: "Human" },
};

// Representativeness reference: disease population mix for this indication
// (spec §6.2 — show representativeness alongside conversion).
export const DISEASE_POPULATION = [
  { group: "White", pct: 58 },
  { group: "Asian", pct: 18 },
  { group: "Black / African", pct: 14 },
  { group: "Hispanic / Latino", pct: 10 },
];

// ------------------------------------------------------------------
// On-trial participants per site (spec §6.3 point 4). The hero site (Guy's)
// is seeded with its real enrolled patients — including PT-0212, the Companion
// user — so the story stays coherent; other sites are filled deterministically
// to match each site's enrolled count. Access is logged and attributable (§4).
// ------------------------------------------------------------------

export interface SiteParticipant {
  name: string;
  code: string;
  age: number;
  sex: "F" | "M";
  ageBand: string;
  group: string; // ethnicity, for diversity tracking
  cycle: string;
  improvesRepresentation: boolean;
}

// Diverse name pool for deterministically-generated participants and
// discovery-sweep candidates. Each name carries a sex so the two stay
// coherent when displayed together.
export const NAME_POOL: { name: string; sex: "F" | "M" }[] = [
  { name: "Olivia Bennett", sex: "F" },
  { name: "Kwame Mensah", sex: "M" },
  { name: "Aisha Rahman", sex: "F" },
  { name: "Diego Morales", sex: "M" },
  { name: "Hannah Schmidt", sex: "F" },
  { name: "Ren Takahashi", sex: "M" },
  { name: "Fatima Al-Sayed", sex: "F" },
  { name: "Marcus Johnson", sex: "M" },
  { name: "Elena Petrova", sex: "F" },
  { name: "Ananya Desai", sex: "F" },
  { name: "Samuel Owusu", sex: "M" },
  { name: "Isabella Rossi", sex: "F" },
  { name: "Chen Wei", sex: "M" },
  { name: "Nadia Haddad", sex: "F" },
  { name: "Thomas Kelly", sex: "M" },
  { name: "Zoe Andersen", sex: "F" },
  { name: "Ibrahim Diallo", sex: "M" },
  { name: "Camila Souza", sex: "F" },
  { name: "Hiroshi Sato", sex: "M" },
  { name: "Grace Mwangi", sex: "F" },
  { name: "Daniel Okoro", sex: "M" },
  { name: "Sofia Navarro", sex: "F" },
  { name: "Aaliyah Brooks", sex: "F" },
  { name: "Viktor Novak", sex: "M" },
];

const GROUP_POOL = ["White", "Asian", "Black / African", "Hispanic / Latino"];
const CYCLE_POOL = [
  "Cycle 1 of 6",
  "Cycle 2 of 6",
  "Cycle 3 of 6",
  "Cycle 4 of 6",
  "Cycle 5 of 6",
];
const SITE_CODE_BASE: Record<string, number> = {
  guys: 220,
  manchester: 340,
  boston: 410,
  madrid: 520,
  chicago: 620,
  birmingham: 680,
  berlin: 720,
  newyork: 740,
  londonaur: 820,
  paris: 880,
};

export function siteParticipants(site: Site): SiteParticipant[] {
  const rows: SiteParticipant[] = [];

  // Real, coherent rows first for the hero site.
  if (site.id === "guys") {
    for (const c of CANDIDATES.filter((c) => c.stage === "enrolled")) {
      rows.push({
        name: c.name,
        code: c.code,
        age: c.age,
        sex: c.sex,
        ageBand: `${Math.floor(c.age / 10) * 10}s`,
        group: c.ethnicity,
        cycle: c.cyclePosition ?? "Cycle 1 of 6",
        improvesRepresentation: !!c.improvesRepresentation,
      });
    }
  }

  // Fill deterministically to the site's enrolled count.
  const base = SITE_CODE_BASE[site.id] ?? 600;
  let i = 0;
  while (rows.length < site.funnel.enrolled) {
    const seed = base + rows.length;
    const group = GROUP_POOL[(base + i * 3) % GROUP_POOL.length];
    const age = 48 + ((base + i * 3) % 28);
    const person = NAME_POOL[(base + i * 5) % NAME_POOL.length];
    rows.push({
      name: person.name,
      code: `PT-0${base + i * 4}`,
      age,
      sex: person.sex,
      ageBand: `${Math.floor(age / 10) * 10}s`,
      group,
      cycle: CYCLE_POOL[(seed + i) % CYCLE_POOL.length],
      improvesRepresentation: group !== "White",
    });
    i++;
  }

  return rows;
}

// ------------------------------------------------------------------
// New candidates surfaced by an on-demand discovery sweep (spec §6.2
// Stage 1). Deterministic given a starting sequence so repeated sweeps add
// unique, coherent candidates. Weighted toward under-represented groups so
// a fresh sweep also improves representativeness, not just conversion.
// ------------------------------------------------------------------

const SWEEP_GROUPS = [
  "Black / African",
  "Hispanic / Latino",
  "Asian",
  "Black / African",
  "Asian",
  "White",
];
const SWEEP_BIOMARKERS = [
  "STK11 mut, KEAP1 mut, PD-L1 50%",
  "STK11 mut, KEAP1 mut, PD-L1 35%",
  "STK11 mut, KEAP1 confirmation pending",
  "STK11 mut, KEAP1 mut, PD-L1 60%",
  "STK11 mut, KEAP1 mut, PD-L1 25%",
  "STK11 mut, PD-L1 15%",
];

export function newDiscoveredBatch(startSeq: number, count: number): Candidate[] {
  const batch: Candidate[] = [];
  for (let i = 0; i < count; i++) {
    const seq = startSeq + i + 1;
    const group = SWEEP_GROUPS[seq % SWEEP_GROUPS.length];
    const score = 73 + ((seq * 7) % 19); // 73–91
    const confidence: Candidate["confidence"] =
      score >= 85 ? "High" : score >= 76 ? "Moderate" : "Low";
    const person = NAME_POOL[(seq * 3) % NAME_POOL.length];
    batch.push({
      id: `c-discover-new-${seq}`,
      trialId: "solaris",
      siteId: "guys",
      name: person.name,
      code: `PT-0${600 + seq}`,
      age: 54 + (seq % 22),
      sex: person.sex,
      ethnicity: group,
      biomarker: SWEEP_BIOMARKERS[seq % SWEEP_BIOMARKERS.length],
      stage: "discover",
      matchScore: score,
      confidence,
      provenance: "Surfaced by discovery sweep · just now",
      rationale: [
        "Newly surfaced by the latest sweep",
        "Awaiting triage and candidate assessment before shortlisting",
      ],
      improvesRepresentation: group !== "White",
      history: [
        { date: "13 Jul 2026", event: "Surfaced by discovery sweep", by: "Agent" },
      ],
    });
  }
  return batch;
}

// ------------------------------------------------------------------
// Trial-level audit log (spec §4: all access and change is logged,
// attributable to a person, and auditable; §7: agent flag -> human
// resolution -> attributable record). A historic view of changes and
// updates across the portfolio of trials, most recent first.
// ------------------------------------------------------------------

export type AuditCategory =
  | "Milestone"
  | "Criteria"
  | "Enrolment"
  | "Diversity"
  | "Consent"
  | "Activation"
  | "Early warning"
  | "Access";

export interface AuditEntry {
  id: string;
  date: string; // "13 Jul 2026"
  time: string; // "09:05"
  trialId: string;
  trialCode: string;
  siteId?: string; // when the event belongs to a specific site
  category: AuditCategory;
  actor: string; // named human, "Agent", or a validated system
  event: string;
}

export const AUDIT_LOG: AuditEntry[] = [
  {
    id: "a1",
    date: "13 Jul 2026",
    time: "09:05",
    trialId: "solaris",
    trialCode: "CVN'916",
    siteId: "manchester",
    category: "Early warning",
    actor: "Agent",
    event:
      "Early warning raised: Manchester screen-failure rate 2.1x trial average, prior-therapy washout the leading cause. Recommended criteria review.",
  },
  {
    id: "a2",
    date: "13 Jul 2026",
    time: "08:40",
    trialId: "solaris",
    trialCode: "CVN'916",
    category: "Enrolment",
    actor: "RTSM (system)",
    event: "Enrolment reconciled live across 4 sites. Portfolio total 31 of 48.",
  },
  {
    id: "a3",
    date: "12 Jul 2026",
    time: "16:22",
    trialId: "solaris",
    trialCode: "CVN'916",
    siteId: "guys",
    category: "Consent",
    actor: "Agent",
    event:
      "Re-consent explainer drafted for protocol amendment v3 for Lucia Fernandez (PT-0184). Awaiting clinician delivery.",
  },
  {
    id: "a4",
    date: "12 Jul 2026",
    time: "11:10",
    trialId: "solaris",
    trialCode: "CVN'916",
    siteId: "guys",
    category: "Enrolment",
    actor: "Dr A. Mensah, PI",
    event: "Carmen Ortiz (PT-0301) confirmed eligible after agent pre-check.",
  },
  {
    id: "a5",
    date: "11 Jul 2026",
    time: "14:48",
    trialId: "helios",
    trialCode: "CVN'742",
    category: "Early warning",
    actor: "Agent",
    event:
      "Predicted first-patient-in slip of 5 weeks. Two of five sites un-activated 9 weeks past plan; recommended opening a Midlands community referral route.",
  },
  {
    id: "a6",
    date: "11 Jul 2026",
    time: "10:02",
    trialId: "solaris",
    trialCode: "CVN'916",
    category: "Diversity",
    actor: "Agent",
    event:
      "Diversity skew flagged: Black / African enrolment 9% vs 14% plan. Shortlist prioritisation adjusted to recover representativeness.",
  },
  {
    id: "a7",
    date: "10 Jul 2026",
    time: "15:30",
    trialId: "solaris",
    trialCode: "CVN'916",
    category: "Criteria",
    actor: "CTM · M. Delgado",
    event:
      "Reviewed agent recommendation to narrow prior-therapy washout from 4 to 3 weeks. Referred to medical monitor for decision.",
  },
  {
    id: "a8",
    date: "09 Jul 2026",
    time: "09:15",
    trialId: "aurora",
    trialCode: "CVN'508",
    category: "Milestone",
    actor: "Agent",
    event: "M5 Enrolment target reached at 94% (34 of 36). Focus shifting to LPLV monitoring.",
  },
  {
    id: "a9",
    date: "08 Jul 2026",
    time: "13:40",
    trialId: "solaris",
    trialCode: "CVN'916",
    siteId: "guys",
    category: "Enrolment",
    actor: "Dr A. Mensah, PI",
    event: "David Sullivan (PT-0277) marked screen-fail: KEAP1 wild-type on confirmation.",
  },
  {
    id: "a10",
    date: "06 Jul 2026",
    time: "10:25",
    trialId: "solaris",
    trialCode: "CVN'916",
    siteId: "madrid",
    category: "Activation",
    actor: "Agent",
    event:
      "Madrid (Site 15) activation tasks chased; IRB approval cleared. Discovery sweep scheduled.",
  },
  {
    id: "a11",
    date: "05 Jul 2026",
    time: "17:05",
    trialId: "helios",
    trialCode: "CVN'742",
    category: "Diversity",
    actor: "Agent",
    event:
      "Diversity skew flagged early: White enrolment 72% vs 60% plan. Recommended broadening site mix for prevalence.",
  },
  {
    id: "a12",
    date: "03 Jul 2026",
    time: "12:00",
    trialId: "aurora",
    trialCode: "CVN'508",
    category: "Consent",
    actor: "Dr R. Silva, PI",
    event: "Amendment v2 re-consents completed for all active participants.",
  },
  {
    id: "a13",
    date: "28 Jun 2026",
    time: "09:50",
    trialId: "solaris",
    trialCode: "CVN'916",
    category: "Milestone",
    actor: "CTM · M. Delgado",
    event: "M3 Screening open confirmed across activated sites.",
  },
  {
    id: "a14",
    date: "20 Jun 2026",
    time: "11:35",
    trialId: "solaris",
    trialCode: "CVN'916",
    siteId: "guys",
    category: "Enrolment",
    actor: "RTSM (system)",
    event: "Amara Okafor (PT-0212) enrolled and randomised.",
  },
  {
    id: "a15",
    date: "14 Jun 2026",
    time: "08:20",
    trialId: "helios",
    trialCode: "CVN'742",
    category: "Milestone",
    actor: "CTM · M. Delgado",
    event: "M2 First patient in reached at lead site.",
  },
  {
    id: "a16",
    date: "02 Jun 2026",
    time: "14:10",
    trialId: "aurora",
    trialCode: "CVN'508",
    category: "Early warning",
    actor: "Agent",
    event:
      "Retention risk cleared: dropout tracking at 4% vs 11% benchmark after remote-monitoring rollout.",
  },
];

export function auditForTrial(trialId: string | "all"): AuditEntry[] {
  return trialId === "all"
    ? AUDIT_LOG
    : AUDIT_LOG.filter((e) => e.trialId === trialId);
}

// ------------------------------------------------------------------
// Early warnings with agent remediation plans (spec §6.3, §2). Each
// warning is an Assist: the agent flags and drafts intervention options,
// a named human reviews, edits, and approves before anything deploys.
// ------------------------------------------------------------------

export type Severity = "High" | "Medium" | "Low";

export interface RemediationOption {
  title: string;
  detail: string;
  impact: string;
  tier: "agent" | "assist" | "human";
}

export interface EarlyWarning {
  id: string;
  trialId: string;
  trialCode: string;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  options: RemediationOption[];
  owners: string[];
}

export const EARLY_WARNINGS: EarlyWarning[] = [
  {
    id: "w1",
    trialId: "solaris",
    trialCode: "CVN'916",
    severity: "High",
    title: "Screen-failure rate 2.1x trial average at Manchester",
    description:
      "4 weeks ahead of projected slip. Prior-therapy washout accounts for 57% of failures at this site.",
    recommendation:
      "Review the prior-therapy washout window. Retrospective analysis suggests narrowing it recovers eligible patients without a safety impact.",
    options: [
      {
        title: "Recommend criteria refinement",
        detail:
          "Agent drafts a protocol clarification narrowing the prior-therapy washout from 4 to 3 weeks, with the evidence pack for the medical monitor.",
        impact: "Est. recovery: 6 to 9 candidates over 8 weeks",
        tier: "assist",
      },
      {
        title: "Broaden the site mix",
        detail:
          "Add two prevalence-matched sites to reduce dependence on Manchester while criteria are reviewed.",
        impact: "Est. impact: reduced single-site risk, +4 weeks lead time",
        tier: "human",
      },
    ],
    owners: ["Medical Monitor", "CTM", "Site Lead"],
  },
  {
    id: "w2",
    trialId: "helios",
    trialCode: "CVN'742",
    severity: "High",
    title: "First-patient-in slip of 5 weeks predicted",
    description:
      "Two of five sites remain un-activated 9 weeks past plan, blocked on IRB. Predicted first-patient-in slips 5 weeks.",
    recommendation:
      "Open a community referral route in the Midlands and escalate the IRB blockers in parallel to compress start-up.",
    options: [
      {
        title: "Activate community referral route",
        detail:
          "Agent maps three underused community oncology networks near the blocked sites and drafts outreach for the CTM.",
        impact: "Est. impact: recovers 3 to 4 weeks of the slip",
        tier: "assist",
      },
      {
        title: "Escalate IRB blockers",
        detail:
          "Raise the two blocked activations to the sponsor start-up lead for direct intervention.",
        impact: "Est. impact: unblocks activation, timeline dependent",
        tier: "human",
      },
    ],
    owners: ["CTM", "Start-up Lead", "Site Lead"],
  },
  {
    id: "w3",
    trialId: "solaris",
    trialCode: "CVN'916",
    severity: "Medium",
    title: "Diversity plan drifting on representation",
    description:
      "Black / African enrolment is 9% vs 14% plan in the disease population. Flagged while it can still be corrected.",
    recommendation:
      "Activate additional community referral pathways to improve representativeness before the window closes.",
    options: [
      {
        title: "Activate community referral pathways",
        detail:
          "Agent identifies 3 community oncology networks with higher representation and drafts outreach templates for site coordinators.",
        impact: "Est. impact: +8 to 12% under-represented enrolment over 8 weeks",
        tier: "assist",
      },
      {
        title: "Request diversity-focused site briefing",
        detail:
          "Schedule a portfolio-wide briefing on representativeness targets with under-performing sites.",
        impact: "Est. impact: improved site awareness and recruitment focus",
        tier: "human",
      },
    ],
    owners: ["Site Lead", "Diversity Lead", "CTM"],
  },
  {
    id: "w4",
    trialId: "aurora",
    trialCode: "CVN'508",
    severity: "Low",
    title: "Approaching enrolment target with strong retention",
    description:
      "Enrolment is 94% of target and dropout is 4% vs 11% benchmark. Continued site additions may over-enrol.",
    recommendation:
      "Hold new site additions and shift focus to LPLV and retention monitoring.",
    options: [
      {
        title: "Hold site additions",
        detail:
          "Agent pauses feasibility outreach for new sites and re-points monitoring to retention signals.",
        impact: "Est. impact: avoids over-enrolment, protects data quality",
        tier: "assist",
      },
      {
        title: "Plan LPLV monitoring",
        detail:
          "Schedule the last-patient-last-visit monitoring plan with the operations team.",
        impact: "Est. impact: smoother study close-out",
        tier: "human",
      },
    ],
    owners: ["CTM", "Operations Lead"],
  },
];

// ------------------------------------------------------------------
// Upstream recruitment (spec §6.2 "the missing before"): the eligible-pool ->
// identification -> screening -> enrolment funnel, the deliberate recruitment
// pathways (levers), and eligibility-criteria breadth analysis.
// ------------------------------------------------------------------

export type PathwayTrend = "narrowing" | "improving" | "neutral";

export interface RecruitmentPathway {
  id: string;
  name: string;
  description: string;
  effect: string;
  contributed: number;
  trend: PathwayTrend;
  runLabel: string;
  completionSummary: string;
  actionPlan: { agent: string[]; hitl: string[]; human: string[] };
}

export interface CriteriaBreadthItem {
  criterion: string;
  current: string;
  proposed: string;
  poolImpact: string;
  tier: "assist" | "human";
}

export const UPSTREAM = {
  trialCode: TRIALS[0].code,
  funnel: {
    eligiblePool: 2400,
    identified: 132,
    eligibleAfterScreening: 14,
    enrolled: 3,
  },
  pathways: [
    {
      id: "ehr",
      name: "EHR discovery sweep",
      description:
        "Run a discovery sweep across EHR records from your site candidate pool. The agent searches clinical charts and biomarker registries to surface potentially eligible patients.",
      effect:
        "Reaches patients already inside the participating site, effective but capped by who is already in the EHR.",
      contributed: 61,
      trend: "narrowing",
      runLabel: "Run discovery sweep",
      completionSummary:
        "Swept 4,207 records. Surfaced 61 potentially eligible candidates, provenance recorded on every match.",
      actionPlan: {
        agent: [
          "Scan clinical charts and biomarker registries against the protocol",
          "Rank and de-duplicate matches with a confidence score",
        ],
        hitl: [
          "PI reviews the ranked shortlist at point of care",
          "Coordinator confirms which candidates to assess",
        ],
        human: ["Named clinician confirms eligibility after screening"],
      },
    },
    {
      id: "community",
      name: "Community and primary-care referrals",
      description:
        "Aggregate referrals from community GPs and primary-care networks outside the main trial site. Strongest reach into under-represented populations who sit outside academic centres.",
      effect:
        "Extends reach beyond the academic centre into community populations often missed by site-only EHR sweeps.",
      contributed: 19,
      trend: "improving",
      runLabel: "Run community referral scan",
      completionSummary:
        "Contacted 6 community networks. Aggregated 19 referrals, weighted toward under-represented groups.",
      actionPlan: {
        agent: [
          "Map community oncology networks and primary-care catchments",
          "Draft outreach templates for each network",
        ],
        hitl: [
          "Coordinator reviews and edits the outreach drafts",
          "Site lead approves the network list",
        ],
        human: ["Referring clinician confirms the referral"],
      },
    },
    {
      id: "physician",
      name: "Physician point-of-care nudge",
      description:
        "Surface diagnosis-moment alerts to treating clinicians, prompting them to flag patients who may match trial criteria. Converts a passive match into an active referral.",
      effect:
        "Captures patients at the moment of diagnosis when referral intent is highest.",
      contributed: 13,
      trend: "neutral",
      runLabel: "Enable point-of-care nudges",
      completionSummary:
        "Enabled nudges across 3 clinics. 13 candidates flagged by treating clinicians.",
      actionPlan: {
        agent: [
          "Detect diagnosis-moment matches from the EHR feed",
          "Compose a concise point-of-care alert",
        ],
        hitl: [
          "Clinician reviews the alert in context",
          "Coordinator triages accepted nudges",
        ],
        human: ["Treating clinician decides whether to refer"],
      },
    },
    {
      id: "self",
      name: "Self-referral and patient outreach",
      description:
        "Let patients and caregivers express interest directly through the Companion and trusted patient channels. Widens the top of the funnel beyond clinician-initiated routes.",
      effect:
        "Adds a patient-initiated route, useful where clinician referral is inconsistent.",
      contributed: 15,
      trend: "neutral",
      runLabel: "Open self-referral intake",
      completionSummary:
        "Opened intake across patient channels. 15 self-referrals received and triaged.",
      actionPlan: {
        agent: [
          "Publish a plain-language eligibility pre-check",
          "Pre-screen inbound interest against the criteria",
        ],
        hitl: [
          "Coordinator reviews pre-screened self-referrals",
          "Site lead confirms outreach channels",
        ],
        human: ["Coordinator contacts the patient to proceed"],
      },
    },
    {
      id: "registry",
      name: "Registry and real-world data",
      description:
        "Query disease registries and real-world data partners for patients matching the criteria outside the site's own records. Broadens the eligible pool with governed external data.",
      effect:
        "Reaches eligible patients the site has never seen, subject to data governance.",
      contributed: 24,
      trend: "improving",
      runLabel: "Query registry and RWD",
      completionSummary:
        "Queried 2 governed registries. Matched 24 candidates for consent-to-contact review.",
      actionPlan: {
        agent: [
          "Match registry and RWD cohorts against the protocol",
          "Flag consent-to-contact status for each match",
        ],
        hitl: [
          "Coordinator reviews governance and consent status",
          "Site lead approves the outreach list",
        ],
        human: ["Data governance officer signs off external contact"],
      },
    },
  ] as RecruitmentPathway[],
  criteria: [
    {
      criterion: "ECOG performance status",
      current: "0 to 1",
      proposed: "0 to 2",
      poolImpact: "+ ~180 to the eligible pool",
      tier: "assist",
    },
    {
      criterion: "Prior KRAS-targeted therapy",
      current: "Excluded",
      proposed: "Allow up to 1 prior line",
      poolImpact: "+ ~140 to the eligible pool",
      tier: "assist",
    },
    {
      criterion: "Age range",
      current: "18 to 75",
      proposed: "18 to 80",
      poolImpact: "+ ~90 to the eligible pool",
      tier: "human",
    },
    {
      criterion: "Organ function thresholds",
      current: "Standard",
      proposed: "Relaxed creatinine clearance floor",
      poolImpact: "+ ~60 to the eligible pool",
      tier: "assist",
    },
  ] as CriteriaBreadthItem[],
};

export const PATHWAY_LEGEND = [
  { label: "EHR sweep", value: 61, color: "#9AA5B4" },
  { label: "Community referrals", value: 19, color: "#0f7a54" },
  { label: "Physician nudge", value: 13, color: "#0D9488" },
  { label: "Self-referral", value: 15, color: "#F36633" },
  { label: "Registry / RWD", value: 24, color: "#4A5568" },
];
