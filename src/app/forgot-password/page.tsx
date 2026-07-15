"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[540px] flex-col items-center justify-center bg-background px-6 py-12 text-center text-foreground sm:px-8">
      <Logo size="xs" />

      {submitted ? (
        <>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="mt-2 text-base font-medium leading-snug text-muted-foreground">
            If an account exists for{" "}
            <span className="font-semibold text-foreground">{email || "that address"}</span>, we&apos;ve
            sent a link to reset your password.
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-sm font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Use a different email
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-semibold text-foreground underline-offset-2 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Reset your password</h1>
          <p className="mt-2 text-base font-medium leading-snug text-muted-foreground">
            Enter the email tied to your account and we&apos;ll send a reset link.
          </p>

          <form
            className="mt-8 w-full space-y-3 text-left"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <Button type="submit" className="h-11 w-full">
              Send reset link
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground underline-offset-2 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
