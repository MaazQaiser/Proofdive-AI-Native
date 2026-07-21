import type { ReactNode } from "react";

import { ProfileSettingsShell } from "./ui/ProfileSettingsShell";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <ProfileSettingsShell>{children}</ProfileSettingsShell>;
}
