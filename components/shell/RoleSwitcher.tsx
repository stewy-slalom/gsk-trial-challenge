"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { Heart, Users, Grid } from "@/components/ui/icons";

export type Role = "companion" | "site" | "ops";

const SEGMENTS: { id: Role; label: string; icon: ReactNode }[] = [
  { id: "companion", label: "Patient", icon: <Heart size={18} /> },
  { id: "site", label: "Site Team", icon: <Users size={18} /> },
  { id: "ops", label: "Trial Operations", icon: <Grid size={18} /> },
];

// §5 Universal floating action bar (role switcher). Fixed bottom-centre,
// present on every screen. Keyboard navigable, announced as a tab-like
// control. Role-gated in production; switchable here for demonstration.
export function RoleSwitcher({
  role,
  onChange,
}: {
  role: Role;
  onChange: (r: Role) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = SEGMENTS.findIndex((s) => s.id === role);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = (index + dir + SEGMENTS.length) % SEGMENTS.length;
      refs.current[next]?.focus();
      onChange(SEGMENTS[next].id);
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role="tablist"
        aria-label="Switch experience"
        onKeyDown={onKeyDown}
        className="pointer-events-auto relative flex w-full max-w-md items-center gap-1 rounded-full border border-line bg-white/95 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.14)] backdrop-blur"
      >
        {/* sliding indicator */}
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 rounded-full bg-brand-orange/12 transition-transform duration-300 ease-out"
          style={{
            width: `calc((100% - 0.75rem) / 3)`,
            transform: `translateX(calc(${index} * 100%))`,
          }}
        />
        {SEGMENTS.map((s, i) => {
          const active = s.id === role;
          return (
            <button
              key={s.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(s.id)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs transition-colors sm:text-[13px] ${
                active
                  ? "font-semibold text-brand-orange"
                  : "font-medium text-body hover:text-ink"
              }`}
            >
              {s.icon}
              <span className="whitespace-nowrap">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
