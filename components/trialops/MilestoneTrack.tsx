"use client";

import { useState } from "react";
import { milestonesFor } from "@/lib/data";
import { AutonomyBadge, SectionLabel } from "@/components/ui/primitives";
import { Check } from "@/components/ui/icons";

// §6.3: milestones M1–M6 explicit on the front end, each exposing its lever.
export function MilestoneTrack({
  index,
  showLevers = false,
}: {
  index: number;
  showLevers?: boolean;
}) {
  const milestones = milestonesFor(index);
  const [open, setOpen] = useState<string | null>(
    showLevers ? milestones.find((m) => m.current)?.id ?? null : null
  );

  return (
    <div>
      <div className="flex items-center gap-0">
        {milestones.map((m, i) => {
          // Only render an interactive button when levers are expandable —
          // otherwise this may sit inside a card button (no nested buttons).
          const Marker = showLevers ? "button" : "div";
          return (
          <div key={m.id} className="flex flex-1 items-center">
            <Marker
              onClick={showLevers ? () => setOpen(open === m.id ? null : m.id) : undefined}
              className={`flex flex-col items-center gap-1 ${showLevers ? "cursor-pointer" : "cursor-default"}`}
              aria-expanded={showLevers ? open === m.id : undefined}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold ${
                  m.reached
                    ? "bg-active/15 text-[#0f7a54]"
                    : m.current
                      ? "bg-gsk-orange text-white"
                      : "border border-line bg-white text-meta"
                }`}
              >
                {m.reached ? <Check size={14} /> : m.id}
              </span>
              <span
                className={`hidden text-center text-[11px] leading-tight sm:block ${
                  m.current ? "font-semibold text-ink" : "text-meta"
                }`}
              >
                {m.label}
              </span>
            </Marker>
            {i < milestones.length - 1 && (
              <span
                className={`mx-1 h-0.5 flex-1 rounded ${
                  m.reached ? "bg-active/40" : "bg-line"
                }`}
                aria-hidden
              />
            )}
          </div>
          );
        })}
      </div>

      {showLevers && open && (
        <div className="mt-4 rounded-lg bg-surface p-4 fade-up">
          {(() => {
            const m = milestones.find((x) => x.id === open)!;
            return (
              <>
                <div className="flex items-center justify-between">
                  <SectionLabel>
                    {m.id} · {m.label} · lever
                  </SectionLabel>
                  <AutonomyBadge level={m.autonomy} />
                </div>
                <p className="mt-2 text-sm text-ink">{m.lever}</p>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
