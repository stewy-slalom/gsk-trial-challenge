// Shared domain types for the Connected Trial Platform.
// One data foundation underpins all three experiences (spec §7).

export type Autonomy = "Agent" | "Assist" | "Human";

export type Stage =
  | "discover"
  | "shortlist"
  | "screening"
  | "eligible"
  | "enrolled"
  | "screenfail";

export type StatusTone =
  | "active"
  | "paused"
  | "escalated"
  | "neutral"
  | "ai";

export type Confidence = "High" | "Moderate" | "Low";

export interface ScreeningItem {
  label: string;
  status: "pending" | "complete" | "flag";
  value?: string;
  updated?: string;
  source?: string;
}

export interface HistoryEvent {
  date: string;
  event: string;
  by?: string; // named human or "Agent" for attributable record (§2, §7)
}

export interface Candidate {
  id: string;
  trialId: string;
  siteId: string;
  name: string; // patient name, shown to their site team
  code: string; // participant / subject ID, shown as secondary reference
  age: number;
  sex: "F" | "M";
  ethnicity: string;
  biomarker: string;
  stage: Stage;
  matchScore: number; // 0-100
  confidence: Confidence;
  provenance: string; // source + timestamp for every agent output (§2)
  rationale: string[];
  notes?: string;
  history: HistoryEvent[];
  screening?: ScreeningItem[];
  improvesRepresentation?: boolean;
  screenFailReason?: string;
  cyclePosition?: string; // enrolled patients
  nextVisit?: string;
  retentionFlag?: string;
}

export interface Milestone {
  id: string; // M1..M6
  label: string;
  lever: string;
  autonomy: Autonomy;
  reached: boolean;
  current: boolean;
}

export interface Site {
  id: string;
  trialId: string;
  name: string;
  city: string;
  country: string;
  institution: string;
  activation: StatusTone; // active | paused | escalated
  activationLabel: string;
  funnel: {
    discovered: number;
    shortlisted: number;
    screening: number;
    eligible: number;
    enrolled: number;
  };
  target: number;
  warning?: {
    tone: StatusTone;
    text: string;
    confidence: Confidence;
    evidence: string;
  };
}

export interface Trial {
  id: string;
  code: string;
  name: string;
  indication: string;
  phase: string;
  target: number;
  enrolled: number;
  status: StatusTone;
  statusLabel: string;
  milestoneIndex: number; // 1..6, current milestone
  topInsight: {
    text: string;
    confidence: Confidence;
    evidence: string;
    tone: StatusTone;
  };
  geography: { country: string; count: number }[];
  diversity: { group: string; actual: number; plan: number }[]; // percentages
  screenFail: { reason: string; count: number }[];
}
