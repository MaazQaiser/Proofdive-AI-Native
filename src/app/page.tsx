import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

/**
 * First-page landing — single composition: brand start-page image full-bleed.
 * No split-screen.
 */
export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/Start%20page%20image.png"
          alt=""
          className="absolute inset-0 size-full object-cover motion-safe:animate-landing-fade"
        />
      </div>

      <div className="relative z-10 mx-0 flex min-h-screen max-w-[800px] flex-col items-start justify-center px-6 py-16 text-left sm:px-10 md:pl-[clamp(2rem,12vw,11.25rem)]">
        <div className="motion-safe:animate-landing-rise flex w-full flex-col items-start">
          <Logo size="lg" />
          <h1 className="mt-8 w-full font-gilroy text-[clamp(2.25rem,4.2vw,3.25rem)] font-bold leading-[1.12] tracking-[-0.04em]">
            <span className="block text-[#033B4F]">Turn your experience into</span>
            <span className="block text-[#0E9AB5]">interview-ready proof.</span>
          </h1>
          <p className="mt-5 max-w-[28rem] text-body-lg leading-7 text-text-secondary">
            Practice with AI, improve your answers, and see exactly what to work
            on next.
          </p>
          <div className="mt-9 motion-safe:animate-landing-cta">
            <Button
              asChild
              size="lg"
                className="h-12 rounded-md px-7 text-base font-medium"
            >
              <Link href="/login">Let&apos;s get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
