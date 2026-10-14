"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_TOPICS,
  EXPLAINER,
  NEXT_STEPS,
  PATIENT,
  SYMPTOM_OPTIONS,
  VISITS,
} from "@/lib/companion";
import {
  AIBadge,
  AutonomyBadge,
  Button,
  Card,
  ConfidenceChip,
  InsightPanel,
  Meter,
  SectionLabel,
} from "@/components/ui/primitives";
import { useAgentRun } from "@/lib/agent";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  CloudRain,
  FileText,
  Heart,
  Home,
  LifeBuoy,
  Lock,
  MapPin,
  Sparkle,
  Sun,
  User,
  Users,
  Video,
} from "@/components/ui/icons";

type Tab = "today" | "learn" | "consent" | "visits" | "checkin";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Today", icon: <Home size={18} /> },
  { id: "learn", label: "Learn", icon: <FileText size={18} /> },
  { id: "consent", label: "Consent", icon: <Check size={18} /> },
  { id: "visits", label: "Visits", icon: <Calendar size={18} /> },
  { id: "checkin", label: "Check-in", icon: <Heart size={18} /> },
];

export function Companion() {
  const [tab, setTab] = useState<Tab>("today");
  const [caregiver, setCaregiver] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-md px-3 pb-28 pt-6 sm:px-4">
        <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wide text-meta">
          Patient experience · responsive web preview
        </p>

        {/* Browser-frame preview: this is a mobile web view, not a native app (§6.1) */}
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_8px_28px_rgba(0,0,0,0.10)]">
          {/* Browser chrome */}
          <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-md border border-line bg-white px-3 py-1.5">
              <Lock size={12} className="text-meta" />
              <span className="truncate text-[12px] text-body">
                app.acme-trials.com/patient
              </span>
            </div>
          </div>

          {/* The web page itself */}
          <div className="bg-white">
            {/* Orange hero header */}
            <header className="bg-gradient-to-b from-brand-orange to-[#f6a274] px-5 pb-6 pt-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/85">
                    {caregiver ? "Supporting" : "Good morning"}
                  </p>
                  <h1 className="mt-0.5 text-3xl font-semibold text-white">
                    {PATIENT.name}
                  </h1>
                </div>
                <button
                  onClick={() => setCaregiver((v) => !v)}
                  aria-pressed={caregiver}
                  className="flex items-center gap-1.5 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  {caregiver ? <Users size={14} /> : <User size={14} />}
                  {caregiver ? "Caregiver" : "Patient"}
                </button>
              </div>
              <p className="mt-4 text-[15px] font-medium text-white">
                {PATIENT.trialName}
              </p>
              <p className="text-[13px] text-white/85">
                On trial · Cycle {PATIENT.cycle} of {PATIENT.totalCycles}
              </p>
            </header>

            {caregiver && (
              <p className="bg-ai-teal-tint px-5 py-3 text-[13px] text-ink">
                You are viewing as {PATIENT.caregiver}, with {PATIENT.name}
                &rsquo;s permission. You can see appointments, log symptoms, and
                help with decisions.
              </p>
            )}

            {/* Web-style top navigation */}
            <nav
              aria-label="Patient sections"
              className="flex gap-1.5 overflow-x-auto border-y border-line px-4 py-2.5 no-scrollbar"
            >
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    aria-current={active}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                      active
                        ? "bg-brand-orange/10 font-semibold text-brand-orange"
                        : "font-medium text-body hover:bg-surface"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                );
              })}
            </nav>

            {/* Content */}
            <main className="px-5 pb-8">
              {tab === "today" && <TodayView onGo={setTab} />}
              {tab === "learn" && <LearnView />}
              {tab === "consent" && <ConsentView />}
              {tab === "visits" && <VisitsView />}
              {tab === "checkin" && <CheckinView caregiver={caregiver} />}
            </main>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-meta">
          Renders responsively from phone to desktop. Shown in a mobile viewport.
        </p>
      </div>
    </div>
  );
}

// ---------------- Today ----------------
const MOODS = [
  { id: "good", label: "Good", icon: <Sun size={24} /> },
  { id: "okay", label: "Okay", icon: <Cloud size={24} /> },
  { id: "tired", label: "Tired", icon: <CloudRain size={24} /> },
  { id: "support", label: "Need support", icon: <LifeBuoy size={24} /> },
];

function TodayView({ onGo }: { onGo: (t: Tab) => void }) {
  const [mood, setMood] = useState<string | null>(null);
  const nextVisit = VISITS.find((v) => v.next);

  return (
    <div className="space-y-5 pt-2">
      {/* Primary: how are you feeling, mood check-in */}
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
            <Sparkle size={20} />
          </span>
          <div>
            <h3 className="text-xl font-semibold text-ink">How are you feeling?</h3>
            <p className="text-[15px] leading-snug text-body">
              Tap to check in. Your care team sees this today.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {MOODS.map((m) => {
            const selected = mood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                aria-pressed={selected}
                className={`flex flex-col items-center gap-2 rounded-xl border py-5 transition-colors ${
                  selected
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "border-transparent bg-surface text-body hover:bg-brand-orange/5"
                }`}
              >
                {m.icon}
                <span className="text-sm font-semibold">{m.label}</span>
              </button>
            );
          })}
        </div>

        {mood && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-active fade-in">
            <Check size={14} /> Saved. Your care team will see this today.
          </p>
        )}

        <button
          onClick={() => onGo("checkin")}
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-brand-orange"
        >
          Log detailed symptoms <ArrowRight size={16} />
        </button>
      </Card>

      {/* Overview of the process */}
      <HomeJourney />

      {/* Key call to actions */}
      <div>
        <SectionLabel>Learn &amp; prepare</SectionLabel>
        <div className="mt-2 space-y-3">
          <PrepCard
            icon={<BookOpen size={20} />}
            title="About your trial"
            subtitle="Plain-language guides at your pace"
            onClick={() => onGo("learn")}
          />
          <PrepCard
            icon={<FileText size={20} />}
            title="Explore consent"
            subtitle="Understand before you decide"
            onClick={() => onGo("consent")}
          />
          {nextVisit && (
            <PrepCard
              icon={<Calendar size={20} />}
              title="Your next visit"
              subtitle={`${nextVisit.when} · ${nextVisit.mode}`}
              onClick={() => onGo("visits")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PrepCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-base font-semibold text-ink">{title}</span>
        <span className="block text-[14px] text-body">{subtitle}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-meta" />
    </button>
  );
}

const HOME_JOURNEY = [
  { label: "Learn", done: true },
  { label: "Consent", done: true },
  { label: "Screen", done: true },
  { label: "Trial", current: true },
];

function HomeJourney() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink">Your journey</h3>
        <span className="rounded-md bg-brand-orange/10 px-2 py-0.5 text-[11px] font-semibold text-brand-orange">
          {PATIENT.trialCode}
        </span>
      </div>
      <div className="mt-4 flex items-start">
        {HOME_JOURNEY.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  s.done
                    ? "bg-brand-orange text-white"
                    : s.current
                      ? "border-2 border-brand-orange bg-white text-brand-orange"
                      : "bg-surface text-meta"
                }`}
              >
                {s.done ? <Check size={17} /> : i + 1}
              </span>
              <span
                className={`text-center text-[11px] leading-tight ${
                  s.current ? "font-semibold text-brand-orange" : "text-meta"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < HOME_JOURNEY.length - 1 && (
              <span
                className={`mx-1 h-0.5 flex-1 self-start rounded ${
                  s.done ? "bg-brand-orange" : "bg-line"
                }`}
                style={{ marginTop: "20px" }}
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-line pt-3 text-sm text-body">
        Currently{" "}
        <span className="font-semibold text-brand-orange">On trial</span> · Cycle{" "}
        {PATIENT.cycle} of {PATIENT.totalCycles}
      </div>
    </Card>
  );
}

// ---------------- Learn (plain-language explainer, Assist) ----------------
function LearnView() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Understanding SOLARIS-2</h2>
        <AutonomyBadge level="Assist" />
      </div>

      <InsightPanel
        title="Plain-language explainer"
        accent="teal"
        provenance="Personalised from your trial protocol · reviewed by your team"
      >
        <p className="font-medium">{EXPLAINER.summary}</p>
      </InsightPanel>

      <div className="space-y-2">
        {EXPLAINER.sections.map((s, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={`overflow-hidden rounded-lg border bg-white ${
                s.reassure ? "border-ai-teal/30" : "border-line"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                  {s.reassure && <Sparkle size={14} className="text-ai-teal" />}
                  {s.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-meta transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-[15px] leading-relaxed text-body fade-up">
                  {s.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <NextStepsCard />
    </div>
  );
}

function NextStepsCard() {
  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>What happens next</SectionLabel>
        <AIBadge />
      </div>
      <div className="rounded-md bg-ai-teal-tint p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Check size={16} className="text-ai-teal" />
          {NEXT_STEPS.fitStatus}
        </p>
        <div className="mt-1.5">
          <ConfidenceChip level={NEXT_STEPS.fitConfidence} />
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-body">
          {NEXT_STEPS.fitDetail}
        </p>
      </div>
      <p className="mt-3 rounded-md bg-surface p-3 text-[15px] leading-relaxed text-body">
        {NEXT_STEPS.screeningOdds}
      </p>
      <ol className="mt-3 space-y-2">
        {NEXT_STEPS.timeline.map((t) => (
          <li key={t.step} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                t.state === "done"
                  ? "bg-active/15 text-[#0f7a54]"
                  : t.state === "current"
                    ? "bg-brand-orange text-white"
                    : "border border-line text-meta"
              }`}
            >
              {t.state === "done" ? <Check size={11} /> : ""}
            </span>
            <div>
              <p
                className={`text-sm ${
                  t.state === "current" ? "font-semibold text-ink" : "text-ink"
                }`}
              >
                {t.step}
              </p>
              <p className="text-[13px] text-body">{t.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

// ---------------- Consent (Assist; decision Human) ----------------
function ConsentView() {
  const [topics, setTopics] = useState(CONSENT_TOPICS);
  const done = topics.filter((t) => t.done).length;

  const draft = useAgentRun({
    steps: ["Reading your explored topics", "Drafting your questions"],
    duration: 1900,
    result: [
      "If everyone gets active treatment, how will you know it is working for me?",
      "Can I switch some visits to video if travelling is hard that week?",
      "What happens to my care if I decide to stop partway through?",
    ],
  });

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Consent, explained</h2>
        <AutonomyBadge level="Assist" />
      </div>

      <Card>
        <p className="text-[15px] leading-relaxed text-body">
          This helps you understand consent before your conversation with{" "}
          {PATIENT.clinician}. The decision and signature stay a human moment
          with your clinician. Nothing here is binding.
        </p>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[13px]">
            <span className="font-medium text-ink">Topics explored</span>
            <span className="text-body">
              {done} of {topics.length}
            </span>
          </div>
          <Meter value={done} max={topics.length} tone="active" />
        </div>
      </Card>

      <div className="space-y-2">
        {topics.map((t, i) => (
          <button
            key={t.title}
            onClick={() =>
              setTopics((prev) =>
                prev.map((p, j) => (j === i ? { ...p, done: true } : p))
              )
            }
            className="flex w-full items-start gap-3 rounded-lg border border-line bg-white p-4 text-left transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                t.done
                  ? "bg-active/15 text-[#0f7a54]"
                  : "border border-line text-meta"
              }`}
            >
              {t.done ? <Check size={12} /> : ""}
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">
                {t.title}
              </span>
              <span className="block text-[14px] text-body">{t.plain}</span>
            </span>
          </button>
        ))}
      </div>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <SectionLabel>Prepare your questions</SectionLabel>
          <AutonomyBadge level="Assist" />
        </div>
        <p className="mb-3 text-[14px] text-body">
          Bring these to {PATIENT.clinician}. The agent drafts them from what you
          explored; you choose what to ask.
        </p>
        {draft.phase === "idle" && (
          <Button variant="ai" size="sm" onClick={draft.run}>
            <Sparkle size={14} /> Draft my questions
          </Button>
        )}
        {draft.phase === "running" && (
          <div className="ai-shimmer rounded-md p-3">
            <p className="flex items-center gap-2 text-[13px] font-medium text-ai-indigo">
              <Sparkle size={14} className="sparkle-working" /> {draft.message}…
            </p>
          </div>
        )}
        {draft.phase === "done" && draft.result && (
          <div className="fade-up space-y-2">
            <AIBadge />
            <ul className="space-y-2">
              {draft.result.map((q) => (
                <li
                  key={q}
                  className="rounded-md bg-ai-indigo-tint px-3 py-2 text-[14px] text-ink"
                >
                  {q}
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-meta">
              Drafted by agent · you decide what to ask
            </p>
          </div>
        )}
      </Card>

      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <User size={16} /> The decision is yours, with your clinician
        </p>
        <p className="mt-1 text-[14px] text-body">
          When you are ready, your consent conversation and signature happen in
          person with {PATIENT.clinician}. This app never captures that decision.
        </p>
      </div>
    </div>
  );
}

// ---------------- Visits (Agent) ----------------
function VisitsView() {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Your visits</h2>
        <AutonomyBadge level="Agent" />
      </div>
      <p className="text-[14px] text-body">
        Scheduling, travel, and reminders are coordinated around your life.
        Reminders are set automatically when a visit is booked.
      </p>
      {VISITS.map((v) => (
        <Card key={v.id} className={v.next ? "border-brand-orange/40" : ""}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-ink">{v.title}</h3>
            {v.next && (
              <span className="shrink-0 rounded-md bg-brand-orange/10 px-2 py-0.5 text-[11px] font-semibold text-brand-orange">
                Next
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-body">
            <Clock size={15} /> {v.when}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-body">
            {v.mode === "Televisit" ? (
              <Video size={15} />
            ) : (
              <MapPin size={15} />
            )}
            {v.mode} · {v.location}
          </p>
          <p className="mt-2 text-[14px] text-body">{v.involves}</p>
          <div className="mt-3 rounded-md bg-surface p-3">
            <SectionLabel>How to prepare</SectionLabel>
            <ul className="mt-1.5 space-y-1">
              {v.prep.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-2 text-[14px] text-body"
                >
                  <Check size={14} className="mt-0.5 shrink-0 text-active" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          {v.next && (
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-meta">
              <Sparkle size={12} className="text-ai-indigo" />
              Reminders set for 3 days and 1 day before
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

// ---------------- Check-in (Agent capture, Assist intervention) ----------------
function CheckinView({ caregiver }: { caregiver: boolean }) {
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");

  // Autosave (§8) with a quiet, honest confirmation.
  useEffect(() => {
    if (Object.keys(levels).length === 0 && !note) return;
    setSaved(false);
    const t = setTimeout(() => setSaved(true), 700);
    return () => clearTimeout(t);
  }, [levels, note]);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">How are you feeling?</h2>
        <AutonomyBadge level="Agent" />
      </div>
      <p className="text-[14px] text-body">
        A quick check-in between visits so your team knows how you are.
        {caregiver && " You are logging this on Amara's behalf."}
      </p>

      <Card>
        <div className="space-y-4">
          {SYMPTOM_OPTIONS.map((s) => (
            <div key={s}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{s}</span>
                <span className="text-[13px] text-body">
                  {levels[s] ? `${levels[s]} of 5` : "not set"}
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setLevels((p) => ({ ...p, [s]: n }))}
                    aria-label={`${s} level ${n}`}
                    className={`h-10 flex-1 rounded-lg border text-sm font-semibold transition-colors ${
                      levels[s] === n
                        ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                        : "border-line text-body hover:bg-surface"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <label className="mt-4 block text-sm font-medium text-ink">
          Anything else to add?
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Optional. Write in your own words."
            className="mt-1.5 w-full rounded-lg border border-line p-3 text-[15px] outline-none focus:border-brand-orange"
          />
        </label>
        <p className="mt-3 flex items-center gap-1.5 text-[13px] text-meta">
          {saved ? (
            <>
              <Check size={14} className="text-active" /> Saved
            </>
          ) : (
            <>
              <Clock size={14} /> Saving as you go
            </>
          )}
        </p>
      </Card>

      <InsightPanel
        title="If something needs attention"
        accent="teal"
        provenance="Your check-ins · reviewed by your care team"
      >
        <p>
          If your check-ins suggest you need support, a real person from your
          team reaches out. The app never handles this alone.
        </p>
      </InsightPanel>
    </div>
  );
}
