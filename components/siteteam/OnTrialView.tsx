"use client";

import type { Candidate } from "@/lib/types";
import { Card, SectionLabel, StatusPill } from "@/components/ui/primitives";
import { Activity, Clock, Flag, Users } from "@/components/ui/icons";

// §6.2 Stage 5: the site team's tracking system for active patients. Mirrors
// the Companion from the staff side — same trial-stage visibility, seen by
// the people responsible for execution.
export function OnTrialView({
  patients,
  onSelect,
}: {
  patients: Candidate[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-gsk-orange" />
        <h2 className="text-base font-semibold text-ink">
          Enrolled / on-trial patients
        </h2>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[12px] font-semibold text-body">
          {patients.length}
        </span>
      </div>
      <p className="max-w-2xl text-sm text-body">
        You are in charge of your patients and the execution of the study. This
        view tracks their visit schedule, cycle position, check-in signals from
        the Companion, consent status, and retention flags.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {patients.map((p) => (
          <Card key={p.id} interactive as="button" onClick={() => onSelect(p.id)}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{p.name}</span>
                  {p.improvesRepresentation && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-ai-teal-tint px-1.5 py-0.5 text-[10px] font-semibold text-ai-teal">
                      <Users size={9} /> Rep +
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-meta">
                  {p.code} · {p.age} · {p.sex} · {p.ethnicity}
                </p>
              </div>
              <StatusPill tone="active">On trial</StatusPill>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-ink">
              <Clock size={15} className="text-body" /> {p.cyclePosition}
            </div>
            {p.nextVisit && (
              <p className="mt-1 text-[13px] text-body">Next: {p.nextVisit}</p>
            )}

            {/* Cycle progress */}
            <CycleBar position={p.cyclePosition} />

            {p.retentionFlag ? (
              <div className="mt-3 flex items-start gap-2 rounded-md bg-paused/10 p-2.5 text-[13px] text-[#a66a00]">
                <Flag size={14} className="mt-0.5 shrink-0" />
                <span>{p.retentionFlag}</span>
              </div>
            ) : (
              <div className="mt-3 rounded-md bg-active/10 p-2.5 text-[13px] text-[#0f7a54]">
                Check-in signals stable. No action needed.
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="rounded-lg bg-ai-indigo-tint p-4">
        <SectionLabel>Retention signals · flag, don&rsquo;t fix</SectionLabel>
        <p className="mt-1.5 text-sm text-ink">
          Disengagement signals from the Companion are flagged here for a human
          check-in. The agent never handles a wavering patient alone; a named
          person reaches out and the outcome is recorded.
        </p>
      </div>
    </div>
  );
}

function CycleBar({ position }: { position?: string }) {
  const match = position?.match(/Cycle (\d+) of (\d+)/);
  const cur = match ? Number(match[1]) : 0;
  const total = match ? Number(match[2]) : 6;
  return (
    <div className="mt-3 flex gap-1" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i < cur ? "bg-gsk-orange" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}
