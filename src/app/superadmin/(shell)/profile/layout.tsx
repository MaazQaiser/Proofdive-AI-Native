import type { ReactNode } from "react";

import { SuperAdminProfileSettingsShell } from "./ui/SuperAdminProfileSettingsShell";

export default function SuperAdminProfileLayout({ children }: { children: ReactNode }) {
  return <SuperAdminProfileSettingsShell>{children}</SuperAdminProfileSettingsShell>;
}
