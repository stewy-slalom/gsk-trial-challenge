"use client";

import { useEffect, useRef } from "react";
import { AutonomyBadge, Button } from "@/components/ui/primitives";
import { useAgentRun } from "@/lib/agent";
import { Check, Sparkle } from "@/components/ui/icons";

// The most visibly agentic moment in the product (§6.2 Stage 1), presented as
// a full-width call-to-action banner above the pipeline board.
export function DiscoverySweep({
  poolRemaining,
  onDiscover,
  sweepBatch,
}: {
  poolRemaining: number;
  onDiscover: () => void;
  sweepBatch: number;
}) {
  const sweep = useAgentRun({
    steps: [
      "Connecting to site EHR",
      "Scanning records against SOLARIS-2 criteria",
      "Matching biomarker and molecular panels",
      "Ranking and de-duplicating candidates",
    ],
    duration: 3200,
    result: { scanned: 4207, found: 104, fresh: sweepBatch },
  });

  // When the sweep completes, populate the Discover column with the batch.
  const fired = useRef(false);
  useEffect(() => {
    if (sweep.phase === "done" && !fired.current) {
      fired.current = true;
      onDiscover();
    }
    if (sweep.phase === "idle") fired.current = false;
  }, [sweep.phase, onDiscover]);

  return (
    <div className="rounded-lg border border-ai-indigo/20 bg-ai-indigo-tint p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
            <Sparkle
              size={18}
              className={`text-ai-indigo ${sweep.phase === "running" ? "sparkle-working" : ""}`}
            />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-ink">Discovery sweep</p>
              <AutonomyBadge level="Agent" />
            </div>
            <p className="mt-0.5 text-[13px] text-body">
              {sweep.phase === "idle" &&
                `Last run today 06:12 · scanned 4,207 records, found 104 candidates. ${poolRemaining} still awaiting triage.`}
              {sweep.phase === "running" && `${sweep.message}…`}
              {sweep.phase === "done" &&
                sweep.result &&
                `Scanned ${sweep.result.scanned.toLocaleString()} records, found ${sweep.result.found} candidates. ${sweep.result.fresh} new suitable candidates added to Discover. Provenance recorded on every match.`}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {sweep.phase === "idle" && (
            <Button variant="ai" onClick={sweep.run}>
              <Sparkle size={15} /> Scan my site for candidates
            </Button>
          )}
          {sweep.phase === "running" && (
            <span className="flex items-center gap-2 text-[13px] font-medium text-ai-indigo">
              <Sparkle size={14} className="sparkle-working" /> Scanning…
            </span>
          )}
          {sweep.phase === "done" && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ai-indigo">
                <Check size={15} /> Sweep complete
              </span>
              <Button variant="secondary" size="sm" onClick={sweep.reset}>
                Run again
              </Button>
            </div>
          )}
        </div>
      </div>

      {sweep.phase === "running" && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-ai-indigo transition-all"
            style={{ width: `${Math.round(sweep.progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
