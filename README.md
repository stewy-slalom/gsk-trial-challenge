# Connected Trial Platform — Acme Medical

One application, three role-based experiences, for Acme Medical Phase II oncology
recruitment and enrolment. Built to `connected-trial-platform-spec-v3.md`.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

**Demonstration sign-in:** username `reviewer`, password `acme-phase2`.
The whole app sits behind authentication; nothing renders pre-login (§4).

## The three experiences

Switch between them with the floating action bar fixed to the bottom of every
screen (§5). Each experience preserves its own state when you switch away.

1. **Companion** (`components/companion/`) — mobile-first patient and caregiver
   web experience: plain-language explainer, what-happens-next with screening
   expectations, interactive eConsent (decision stays human), visit hub, and
   between-visit symptom check-ins with autosave. Caregiver view toggle.
2. **Site Team workspace** (`components/siteteam/`) — the candidate pipeline:
   **Discover → Pre-screened → In screening → Eligible → Enrolled**, with an
   agent discovery sweep, "Assess this candidate" actions, live-in-flight
   screening results, honest stage-gated decision actions, a representativeness
   panel, and an On-Trial tracking view.
3. **Trial Operations** (`components/trialops/`) — trial-first dashboard:
   Portfolio → Trial → Site → Participant, with enrolment-vs-target as the
   headline, M1–M6 milestones and levers on the front end, prominent
   screen-failure analysis, geography, diversity-vs-plan, and early-warning
   triggers with confidence and evidence.

## How the spec shows up in the code

- **Coherent funnel** (`lib/data.ts`) — the hero site (Guy's, London) narrows
  104 discovered → 14 eligible → an enrolled cohort. The same numbers drive the
  Site Team pipeline, the Trial Operations site funnel, and the enrolled patient
  (PT-0212) who is the Companion user. One story across all three (§11).
- **Agentic work is visible** (`lib/agent.ts`, `components/ui/`) — every agent
  run moves idle → running → done with a real in-flight indicator and a
  completion summary; agent output is labelled "AI generated" with a sparkle and
  carries provenance; Agent / Assist / Human autonomy badges appear throughout.
- **Design system** (`app/globals.css`) — Acme Orange primary, teal/indigo
  reserved for AI, semantic status colours (always paired with text/icon),
  self-hosted Inter, 8pt grid, soft elevation, no coloured
  left-border accents, no em dashes in UI copy, no monospace, no emoji icons.
- **Security & lockdown** (`next.config.ts`, `app/robots.ts`) — auth gate, CSP
  and hardening headers, noindex/nofollow, no third parties, all assets
  self-hosted.
- **Accessibility** — WCAG-minded: keyboard-operable role switcher and controls,
  visible focus, live "saved" states, reduced-motion support, large touch
  targets, 16px patient / 14px staff type floors.

## Notes

All figures are illustrative and seeded for the demo; agent runs are simulated
(the indicator of work is real). Replace with validated, governed data before
real use (§11). The role switcher is a demonstration affordance and would be
role-gated in a production deployment (§4, §5).
