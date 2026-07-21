import type { ReactNode } from "react";

import { OrgAdminShell } from "./ui/OrgAdminShell";

export default function OrgAdminShellLayout({ children }: { children: ReactNode }) {
  return <OrgAdminShell>{children}</OrgAdminShell>;
}
