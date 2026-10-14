import { AuthGate } from "@/components/shell/AuthGate";
import { PlatformShell } from "@/components/shell/PlatformShell";

export default function Page() {
  return (
    <AuthGate>
      <PlatformShell />
    </AuthGate>
  );
}
