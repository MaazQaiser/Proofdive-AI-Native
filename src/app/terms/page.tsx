import Link from "next/link";

import { Logo } from "@/components/ui/logo";

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[540px] flex-col justify-center px-6 py-12 sm:px-8">
      <Logo size="xs" />
      <h1 className="mt-6 text-h6 text-black">Terms of Service</h1>
      <p className="mt-2 text-body leading-snug text-[var(--app-muted)]">
        This is a placeholder Terms of Service page. Final legal copy will be added here before
        launch.
      </p>

      <p className="mt-8 text-center text-caption text-black/55">
        <Link href="/consent" className="font-semibold text-black underline-offset-2 hover:underline">
          Back
        </Link>
      </p>
    </main>
  );
}
