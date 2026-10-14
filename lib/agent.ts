"use client";

import { useCallback, useRef, useState } from "react";

// Simulated agent runs. In this build agent work is simulated, but the
// indicator of work happening is real (spec §3, §11): a run moves through
// idle -> running -> done, with visible progress and a completion summary.

export type AgentPhase = "idle" | "running" | "done";

export interface AgentRun<T> {
  phase: AgentPhase;
  result: T | null;
  progress: number; // 0..1
  message: string;
  run: () => void;
  reset: () => void;
}

interface RunOptions<T> {
  steps: string[]; // messages shown while working
  duration?: number; // total ms
  result: T;
}

export function useAgentRun<T>(opts: RunOptions<T>): AgentRun<T> {
  const { steps, duration = 2200, result } = opts;
  const [phase, setPhase] = useState<AgentPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(steps[0] ?? "");
  const [value, setValue] = useState<T | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = useCallback(() => {
    clear();
    setPhase("running");
    setProgress(0);
    setValue(null);
    setMessage(steps[0] ?? "Working");

    const stepCount = Math.max(steps.length, 1);
    steps.forEach((s, i) => {
      const t = setTimeout(() => {
        setMessage(s);
        setProgress((i + 1) / (stepCount + 1));
      }, (duration / (stepCount + 1)) * (i + 1));
      timers.current.push(t);
    });

    const done = setTimeout(() => {
      setProgress(1);
      setValue(result);
      setPhase("done");
    }, duration);
    timers.current.push(done);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, result, steps.join("|")]);

  const reset = useCallback(() => {
    clear();
    setPhase("idle");
    setProgress(0);
    setValue(null);
    setMessage(steps[0] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.join("|")]);

  return { phase, result: value, progress, message, run, reset };
}
