import type { ReactNode } from "react";

import { PartnerShell } from "./ui/PartnerShell";

export default function PartnerShellLayout({ children }: { children: ReactNode }) {
  return <PartnerShell>{children}</PartnerShell>;
}
