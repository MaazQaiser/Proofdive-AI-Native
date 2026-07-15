import Link from "next/link";

import { Button } from "@/components/Button";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="min-h-screen w-full px-6 py-10">
      <div className="mx-0 flex min-h-[calc(100vh-5rem)] max-w-[800px] flex-col items-start justify-center text-left md:pl-[180px]">
        <Logo size="xs" />
        <h1 className="mt-5 w-full text-7xl font-extrabold leading-[84px] tracking-tight">
          Turn your experience into interview-ready proof.
        </h1>
        <p className="mt-5 text-2xl font-medium leading-7 text-[var(--app-muted)]">
          Practice with AI, improve your answers, and see exactly what to work on
          next.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
          <Link href="/login">
            <Button>Let&apos;s get started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
