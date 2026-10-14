"use client";

import type { Candidate } from "@/lib/types";
import { AIBadge, SectionLabel } from "@/components/ui/primitives";

// §6.2: representativeness shown alongside conversion, so the tool does not
// become more efficient at finding the historically over-represented group.
export function RepresentativenessCard({
  shortlist,
  population,
}: {
  shortlist: Candidate[];
  population: { group: string; pct: number }[];
}) {
  const total = shortlist.length || 1;
  const shortlistPct = (group: string) =>
    Math.round(
      (shortlist.filter((c) => c.ethnicity === group).length / total) * 100
    );

  return (
    <aside className="h-fit rounded-lg bg-ai-teal-tint p-4 xl:sticky xl:top-20">
      <div className="mb-1 flex items-center justify-between">
        <SectionLabel>Representativeness</SectionLabel>
        <AIBadge />
      </div>
      <p className="mb-3 text-[13px] text-body">
        Current shortlist against the disease population for this indication.
        Watch for under-representation, not only conversion.
      </p>
      <div className="space-y-3">
        {population.map((p) => {
          const actual = shortlistPct(p.group);
          const under = actual < p.pct - 5;
          return (
            <div key={p.group}>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="font-medium text-ink">{p.group}</span>
                <span className={under ? "font-semibold text-escalated" : "text-body"}>
                  {actual}% vs {p.pct}% target
                </span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-white">
                {/* target marker */}
                <span
                  className="absolute top-[-2px] h-3 w-0.5 rounded bg-ink/40"
                  style={{ left: `${p.pct}%` }}
                  aria-hidden
                />
                <div
                  className={`h-full rounded-full ${under ? "bg-escalated" : "bg-ai-teal"}`}
                  style={{ width: `${actual}%` }}
                />
              </div>
              {under && (
                <p className="mt-1 text-[11px] font-medium text-escalated">
                  Under-represented. Prioritise matching candidates.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 border-t border-black/5 pt-2 text-[11px] text-body">
        Source: shortlist composition · disease-population reference · updated live
      </p>
    </aside>
  );
}
