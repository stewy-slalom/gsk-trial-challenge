"use client";

import { useState } from "react";
import { RoleSwitcher, type Role } from "./RoleSwitcher";
import { Companion } from "@/components/companion/Companion";
import { SiteTeam } from "@/components/siteteam/SiteTeam";
import { TrialOps } from "@/components/trialops/TrialOps";

// Single application shell containing three experience modules plus the
// persistent floating role switcher (spec §5, §11). All three stay mounted
// so each experience preserves its last state; switching cross-fades.
export function PlatformShell() {
  const [role, setRole] = useState<Role>("companion");

  const panels: { id: Role; node: React.ReactNode }[] = [
    { id: "companion", node: <Companion /> },
    { id: "site", node: <SiteTeam /> },
    { id: "ops", node: <TrialOps /> },
  ];

  return (
    <div className="min-h-screen">
      {panels.map((p) => (
        <div
          key={p.id}
          role="tabpanel"
          hidden={role !== p.id}
          className={role === p.id ? "fade-in" : ""}
        >
          {/* kept mounted so each experience restores its last state (§5) */}
          {p.node}
        </div>
      ))}
      <RoleSwitcher role={role} onChange={setRole} />
    </div>
  );
}
