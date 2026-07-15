import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background px-6 py-10 text-foreground">
      <div className="mx-0 flex min-h-[calc(100vh-5rem)] max-w-[800px] flex-col items-start justify-center text-left md:pl-[180px]">
        <Logo size="xs" />
        <h1 className="mt-5 w-full text-7xl font-extrabold leading-[84px] tracking-tight">
          Turn your experience into interview-ready proof.
        </h1>
        <p className="mt-5 text-2xl font-medium leading-7 text-muted-foreground">
          Practice with AI, improve your answers, and see exactly what to work on
          next.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
          <Button asChild size="lg" className="h-11 px-6">
            <Link href="/login">Let&apos;s get started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
