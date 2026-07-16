"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { LogoSymbol } from "@/components/ui/logo-symbol";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-8">
        <Link href="/">
          <Logo size="xxs" />
        </Link>
        <Button asChild size="sm" className="rounded-lg px-4 text-overline">
          <Link href="/login">Log In</Link>
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-[524px] flex-col items-center px-6 py-16 text-center sm:px-8">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <LogoSymbol className="h-9 w-9" />
        </div>

        {submitted ? (
          <>
            <h1 className="text-subheading mt-6 text-extended-dark-cyan">Check your email</h1>
            <p className="text-body mt-2 text-muted-foreground">
              If an account exists for{" "}
              <span className="font-semibold text-foreground">{email || "that address"}</span>, we&apos;ve
              sent a link to reset your password.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-caption font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Use a different email
              </button>
            </div>

            <p className="mt-8 text-center text-caption text-muted-foreground">
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
            <h1 className="text-subheading mt-6 text-extended-dark-cyan">Reset your password</h1>
            <p className="text-body mt-2 text-muted-foreground">
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
                  className="h-14"
                  required
                />
              </div>
              <Button type="submit" className="text-body h-14 w-full">
                Send reset link
              </Button>
            </form>

            <p className="mt-8 text-center text-caption text-muted-foreground">
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
    </div>
  );
}
