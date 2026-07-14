"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/Button";

const field =
  "h-11 w-full rounded-md border border-black/[0.12] bg-white px-3 text-sm outline-none transition placeholder:text-black/35 focus:border-black/25 focus:ring-1 focus:ring-black/15";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[540px] flex-col justify-center px-6 py-12 sm:px-8">
      <p className="text-[11px] font-bold tracking-[0.2em] text-black/45">PROOFDIVE</p>

      {submitted ? (
        <>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-black">Check your email</h1>
          <p className="mt-2 text-base font-medium leading-snug text-[var(--app-muted)]">
            If an account exists for{" "}
            <span className="font-semibold text-black">{email || "that address"}</span>, we&apos;ve
            sent a link to reset your password.
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-sm font-semibold text-black/70 underline-offset-2 hover:text-black hover:underline"
            >
              Use a different email
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-black/55">
            <Link
              href="/login"
              className="font-semibold text-black underline-offset-2 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-black">Reset your password</h1>
          <p className="mt-2 text-base font-medium leading-snug text-[var(--app-muted)]">
            Enter the email tied to your account and we&apos;ll send a reset link.
          </p>

          <form
            className="mt-8 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
              required
            />
            <Button type="submit" className="!h-11 !w-full !rounded-md !px-4">
              Send reset link
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-black/55">
            Remembered it?{" "}
            <Link
              href="/login"
              className="font-semibold text-black underline-offset-2 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
