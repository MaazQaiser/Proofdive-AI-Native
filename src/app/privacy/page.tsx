import Link from "next/link";

import { Logo } from "@/components/ui/logo";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[540px] flex-col justify-center px-6 py-12 sm:px-8">
      <Logo size="xs" />
      <h1 className="mt-6 text-h6 text-text-primary">Privacy Policy</h1>
      <p className="mt-2 text-body leading-snug text-text-secondary">
        This is a placeholder Privacy Policy page. Final legal copy will be added here before
        launch.
      </p>

      <p className="mt-8 text-center text-caption text-text-secondary">
        <Link href="/consent" className="app-link font-semibold">
          Back
        </Link>
      </p>
    </main>
  );
}
