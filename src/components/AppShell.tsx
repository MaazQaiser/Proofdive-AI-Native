import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import { Logo } from "@/components/ui/logo";

import { AppShellHeaderRoleSelector } from "./AppShellHeaderRoleSelector";

type Props = {
  children: ReactNode;
  /**
   * Optional right rail (e.g. storyboard). Flush to the viewport’s right edge
   * on xl+, full height under the header, separated by the same `border-border`
   * hairline language as the top navbar.
   */
  rightPanel?: ReactNode;
  /** Width of `rightPanel` on xl+. Defaults to 400. */
  rightPanelMaxWidth?: number;
};

/** Candidate chrome — header matches the admin shells: bottom rule across the
 * bar, logo in a left “box” (full-height cell + trailing vertical rule). */
export function AppShell({
  children,
  rightPanel,
  rightPanelMaxWidth = 400,
}: Props) {
  const hasRightPanel = Boolean(rightPanel);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center gap-6 border-b border-border bg-background/75 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 print:hidden">
        <Link
          href="/"
          className="flex h-full shrink-0 items-center border-r border-border pr-6"
        >
          <Logo size="xxs" />
        </Link>
        <div className="ml-auto flex h-full shrink-0 items-center">
          <AppShellHeaderRoleSelector />
        </div>
      </header>
      {/* z-[2] keeps scrolling page content above the composer BackgroundGlow
          (z-[1]); pb-32 clears the fixed ChatComposer so the last blocks
          aren't trapped under the footer. */}
      {hasRightPanel ? (
        <div className="relative z-[2] flex w-full flex-col xl:min-h-[calc(100vh-3.5rem)] xl:flex-row xl:items-stretch">
          <div className="min-w-0 flex-1 pt-3 pr-6 pb-32 pl-20">
            <main className="min-w-0 w-full">{children}</main>
          </div>
          <aside
            className="flex w-full flex-col border-t border-border bg-background pb-32 xl:sticky xl:top-14 xl:h-[calc(100vh-3.5rem)] xl:w-[var(--app-shell-right-panel)] xl:max-w-[var(--app-shell-right-panel)] xl:shrink-0 xl:border-t-0 xl:border-l xl:border-border xl:pb-0"
            style={
              {
                "--app-shell-right-panel": `${rightPanelMaxWidth}px`,
              } as CSSProperties
            }
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-6">{rightPanel}</div>
          </aside>
        </div>
      ) : (
        <div className="relative z-[2] mx-auto flex w-full max-w-6xl gap-10 pt-3 pr-6 pb-32 pl-20">
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      )}
    </div>
  );
}
