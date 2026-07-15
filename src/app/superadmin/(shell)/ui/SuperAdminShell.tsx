import type { ReactNode } from "react";

import { Card } from "@/components/Card";

import { SuperAdminSidebarNav } from "./SuperAdminSidebarNav";

type Props = {
  children: ReactNode;
};

export function SuperAdminShell({ children }: Props) {
  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-10 pt-6 lg:flex-row">
        <aside className="top-6 z-10 -mx-6 lg:sticky lg:mx-0 lg:h-[calc(100vh-3rem)] lg:w-64 lg:shrink-0">
          <Card className="min-w-0 px-3 py-3 lg:flex lg:h-full lg:flex-col lg:p-4">
            <SuperAdminSidebarNav />
          </Card>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 -mx-6 mb-8 flex items-center justify-between gap-3 bg-[var(--app-bg)] px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-[var(--app-bg)]/90 print:hidden">
            <div className="text-xs font-extrabold tracking-[0.22em] text-black">
              PROOFDIVE · SUPER ADMIN
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
