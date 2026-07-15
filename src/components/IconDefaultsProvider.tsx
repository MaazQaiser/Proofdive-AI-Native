"use client";

import { LucideProvider } from "lucide-react";
import type { ReactNode } from "react";

/** App-wide default stroke width for every lucide-react icon, per the design system. */
export function IconDefaultsProvider({ children }: { children: ReactNode }) {
  return <LucideProvider strokeWidth={2}>{children}</LucideProvider>;
}
