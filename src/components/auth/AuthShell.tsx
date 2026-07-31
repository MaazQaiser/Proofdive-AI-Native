import Link from "next/link";
import type { ReactNode } from "react";

import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import { Logo } from "@/components/ui/logo";

/**
 * Shared chrome for Login / Signup / Accept-invite pages.
 * Figma login frame (node 265:1533): full-bleed brand bg, logo header,
 * left headline panel, right form column (731px), bottom-right gradient.
 * Pass the existing form block as children — do not alter form contents here.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/login-signup%20assets/login%20sign%20up%20bg%20image.png"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <header className="relative z-10 flex h-20 shrink-0 items-center px-8 sm:px-12">
        <Link href="/">
          <Logo size="xxs" />
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <AuthVisualPanel />

        <div className="flex w-full items-center justify-center px-6 py-10 lg:w-[731px] lg:shrink-0 lg:px-12">
          {children}
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/login-signup%20assets/Background%20gradient.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 w-[1276px] max-w-none opacity-60"
      />
    </div>
  );
}
