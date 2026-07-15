import type { ReactNode } from "react";

import { SuperAdminShell } from "./ui/SuperAdminShell";

export default function SuperAdminShellLayout({ children }: { children: ReactNode }) {
  return <SuperAdminShell>{children}</SuperAdminShell>;
}
