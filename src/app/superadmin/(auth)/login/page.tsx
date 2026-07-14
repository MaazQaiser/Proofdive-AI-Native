"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";

const field =
  "h-11 w-full rounded-md border border-black/[0.12] bg-white px-3 text-sm outline-none transition placeholder:text-black/35 focus:border-black/25 focus:ring-1 focus:ring-black/15";

export default function SuperAdminLoginPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[540px] flex-col justify-center px-6 py-12 sm:px-8">
      <p className="text-[11px] font-bold tracking-[0.2em] text-black/45">PROOFDIVE</p>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-black">Super Admin sign in</h1>
      <p className="mt-2 text-base font-medium leading-snug text-[var(--app-muted)]">
        Platform administration access only.
      </p>

      <form
        className="mt-8 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/superadmin/overview");
        }}
      >
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          className={field}
          required
        />
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          className={field}
          required
        />
        <Button type="submit" className="!h-11 !w-full !rounded-md !px-4">
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-black/55">
        <Link href="/login" className="font-semibold text-black underline-offset-2 hover:underline">
          Back to regular sign in
        </Link>
      </p>
    </main>
  );
}
