import type { ReactNode } from "react";
import Link from "next/link";

import { Logo } from "@/components/ui/logo";

import { AppShellHeaderRoleSelector } from "./AppShellHeaderRoleSelector";

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="sticky top-0 z-20 flex h-20 w-full shrink-0 items-center justify-between gap-3 bg-background/90 px-12 backdrop-blur supports-[backdrop-filter]:bg-background/90 print:hidden">
        <Link href="/">
          <Logo size="xxs" />
        </Link>
        <AppShellHeaderRoleSelector />
      </header>
      <div className="mx-auto flex w-full max-w-6xl gap-10 pt-3 pr-6 pb-10 pl-20">
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
