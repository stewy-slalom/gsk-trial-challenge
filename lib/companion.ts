// Companion (patient + caregiver) content. Plain-language, mobile-first
// (spec §6.1). This patient maps to enrolled candidate PT-0212 in the
// Site Team workspace, so the two experiences tell one story.

export const PATIENT = {
  name: "Amara",
  trialCode: "CVN'916",
  trialName: "SOLARIS-2",
  site: "Guy's, London",
  clinician: "Dr Mensah",
  caregiver: "Joseph (son)",
  cycle: 3,
  totalCycles: 6,
};

// Six recruitment-and-enrolment stages of the service blueprint.
export const JOURNEY_STAGES = [
  { id: "awareness", short: "Learn", label: "Learning about the trial", done: true },
  { id: "screening", short: "Screen", label: "Seeing if it is right for you", done: true },
  { id: "consent", short: "Consent", label: "Understanding and consenting", done: true },
  { id: "enrolment", short: "Start", label: "Starting treatment", done: true },
  { id: "ontrial", short: "On trial", label: "On the trial", current: true },
  { id: "retention", short: "Support", label: "Staying supported", done: false },
];

export const EXPLAINER = {
  headline: "What SOLARIS-2 is, in plain language",
  summary:
    "SOLARIS-2 is a research study testing whether a new medicine helps people with your type of lung cancer. Taking part means extra visits and checks, and a chance to help find better treatments.",
  sections: [
    {
      q: "Will I get a placebo instead of the real medicine?",
      a: "Everyone in this study receives active treatment. There is no placebo-only group. You will always be under the care of your own cancer team alongside the study.",
      reassure: true,
    },
    {
      q: "What will I have to do?",
      a: "You will come in for treatment and checks about once every three weeks, for six cycles. Some visits can be done by video or at home to save you travelling.",
    },
    {
      q: "Can I stop if I change my mind?",
      a: "Yes. Taking part is your choice, and you can stop at any time without affecting your normal care.",
    },
    {
      q: "Who looks after me during the study?",
      a: "Your usual cancer team stays in charge of your care. The study team works alongside them, and you can reach a coordinator whenever you need to.",
    },
  ],
};

export const NEXT_STEPS = {
  fitStatus: "You match the main criteria for this study",
  fitConfidence: "High" as const,
  fitDetail:
    "Based on the information your clinical team shared, you look like a strong fit. A few checks still need to happen before it is confirmed.",
  screeningOdds:
    "About 1 in 5 people who reach screening go on to enrol. Not being chosen is common and does not mean anything is wrong with you.",
  timeline: [
    { step: "Screening checks", detail: "Scans and blood tests, about 1 to 2 weeks", state: "done" },
    { step: "Eligibility confirmed", detail: "Your clinician reviews the results with you", state: "done" },
    { step: "Consent conversation", detail: "You decide, in your own time", state: "done" },
    { step: "Start treatment", detail: "First cycle begins", state: "current" },
  ],
};

export const VISITS = [
  {
    id: "v1",
    title: "Cycle 3 treatment visit",
    when: "Tue 15 Jul, 10:30",
    mode: "In person",
    location: "Guy's, London — Oncology Day Unit",
    prep: ["Bring your medication list", "Eat and drink normally", "Allow about 3 hours"],
    involves: "Blood test, then treatment infusion and a short check with the nurse.",
    next: true,
  },
  {
    id: "v2",
    title: "Symptom check-in",
    when: "Fri 18 Jul, any time",
    mode: "Televisit",
    location: "Video call, link sent the day before",
    prep: ["Find a quiet spot", "Have your symptom notes handy"],
    involves: "A 15 minute call to see how you are feeling between treatments.",
  },
  {
    id: "v3",
    title: "Cycle 4 treatment visit",
    when: "Tue 05 Aug, 10:30",
    mode: "Home visit available",
    location: "Home visit or Guy's, your choice",
    prep: ["Confirm your choice 3 days before"],
    involves: "Bloods and treatment. A nurse can come to you to save the journey.",
  },
];

export const SYMPTOM_OPTIONS = [
  "Tiredness",
  "Nausea",
  "Appetite",
  "Pain",
  "Mood",
  "Sleep",
];

export const CONSENT_TOPICS = [
  {
    title: "The purpose of the study",
    plain: "Why this research is being done and what it hopes to find out.",
    done: true,
  },
  {
    title: "What taking part involves",
    plain: "Your visits, treatments, and the checks along the way.",
    done: true,
  },
  {
    title: "Possible benefits and risks",
    plain: "What might help you, and what side effects to watch for.",
    done: true,
  },
  {
    title: "Your rights and choices",
    plain: "You can ask anything, and you can stop at any time.",
    done: false,
  },
];
