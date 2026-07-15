import type { ReactNode } from "react";

import { Logo } from "@/components/ui/logo";

import { AppShellHeaderRoleSelector } from "./AppShellHeaderRoleSelector";

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)]">
      <div className="mx-auto flex w-full max-w-6xl gap-10 px-6 pb-10 pt-3">
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 -mx-6 mb-8 flex items-center justify-between gap-3 bg-[var(--app-bg)] px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-[var(--app-bg)]/90 print:hidden">
            <Logo size="xxs" />
            <AppShellHeaderRoleSelector />
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
