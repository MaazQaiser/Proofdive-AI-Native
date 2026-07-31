import type { ReactNode } from "react";

import { PartnerProfileSettingsShell } from "./ui/PartnerProfileSettingsShell";

export default function PartnerProfileLayout({ children }: { children: ReactNode }) {
  return <PartnerProfileSettingsShell>{children}</PartnerProfileSettingsShell>;
}
