import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[540px] flex-col justify-center px-6 py-12 sm:px-8">
      <p className="text-[11px] font-bold tracking-[0.2em] text-black/45">PROOFDIVE</p>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-black">Terms of Service</h1>
      <p className="mt-2 text-base font-medium leading-snug text-[var(--app-muted)]">
        This is a placeholder Terms of Service page. Final legal copy will be added here before
        launch.
      </p>

      <p className="mt-8 text-center text-sm text-black/55">
        <Link href="/signup" className="font-semibold text-black underline-offset-2 hover:underline">
          Back to sign up
        </Link>
      </p>
    </main>
  );
}
