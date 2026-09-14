import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

/**
 * First-page landing — single composition: brand start-page image full-bleed.
 * No split-screen.
 *
 * THE PLATE DECIDES. `start-page-hero.webp` is a near-white brand composition
 * and there is no dark cut of it, so this page is light in both themes and its
 * ink is pinned to the light palette rather than left on the live tokens. It
 * had been swept onto tokens with the rest of the product, which meant that in
 * dark mode `--extended-green-blue` resolved to #a9e4ef, `--logo-ink` to
 * #cfe3e8 and `--text-secondary` to #94a6ac — pale ink on a near-white plate,
 * so the wordmark and the first headline line all but vanished.
 *
 * Scoped CSS-variable overrides rather than `dark:` classes, the same trick the
 * pricing Career Starter card uses for its photo: the children keep asking for
 * the tokens they always asked for, and only the values change, so `Logo`,
 * `Button` and the type need no knowledge of where they are.
 */
export default function Home() {
  return (
    <main
      className={
        "relative min-h-screen w-full overflow-hidden bg-background text-foreground " +
        "[--background:#F5F5F3] [--foreground:#0E0E0E] [--text-primary:#0E0E0E] " +
        "[--text-secondary:#6B7280] [--extended-green-blue:#073E4C] " +
        "[--primary:#0E9AB5] [--primary-foreground:#F5F5F5] " +
        "[--logo-ink:#062C35] [--ring:#0E9AB5]"
      }
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/brand/start-page-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover motion-safe:animate-landing-fade"
        />
      </div>

      <div className="relative z-10 mx-0 flex min-h-screen max-w-[800px] flex-col items-start justify-center px-6 py-16 text-left sm:px-10 md:pl-[clamp(2rem,12vw,11.25rem)]">
        <div className="motion-safe:animate-landing-rise flex w-full flex-col items-start">
          <Logo size="lg" />
          <h1 className="mt-8 w-full font-gilroy text-[clamp(2.25rem,4.2vw,3.25rem)] font-bold leading-[1.12] tracking-[-0.04em]">
            <span className="block text-extended-green-blue">Turn your experience into{" "}</span>
            <span className="block text-primary">interview-ready proof.</span>
          </h1>
          <p className="mt-5 max-w-[28rem] text-body-lg leading-7 text-text-secondary">
            Build evidence-backed stories from real experience, then practice
            against a fixed competency standard.
          </p>
          <div className="mt-9 motion-safe:animate-landing-cta">
            <Button
              asChild
              size="lg"
                className="h-12 rounded-md px-7 text-base font-medium"
            >
              <Link href="/signup">Start with your story</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
