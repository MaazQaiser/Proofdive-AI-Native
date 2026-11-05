"use client";

import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { AuthHeading } from "@/components/auth/AuthHeading";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldClassName =
  "h-11 rounded-md border-border bg-card px-3 text-body-sm placeholder:text-placeholder md:text-body-sm";

/**
 * Kept a page rather than a dialog over sign-in, on purpose: the emailed link
 * has to land on a page, and a password manager and the back button both work
 * on one.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    // Demo latency so the pending state is visible; a real request lands here.
    window.setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 600);
  }

  return (
    <AuthShell>
      {submitted ? (
        <div className="flex w-full flex-col items-stretch gap-6" role="status">
          <AuthHeading
            title="Check your email"
            icon={
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-1000">
                <Check className="size-6 text-primary" aria-hidden />
              </div>
            }
          >
            {/* Enumeration-safe: never confirms whether the account exists. */}
            If an account exists for{" "}
            <span className="font-semibold text-foreground">{email || "that address"}</span>, a
            reset link is on its way. It expires in 30 minutes.
          </AuthHeading>
          <p className="text-center text-body-sm text-muted-foreground">
            Didn&apos;t get it?{" "}
            <button
              type="button"
              onClick={() => toast.success("Reset link sent again.")}
              className="app-link font-medium"
            >
              Resend
            </button>{" "}
            · Check spam, or{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="app-link font-medium"
            >
              try another email
            </button>
            .
          </p>
          <p className="text-center text-body-sm">
            <span className="text-muted-foreground">Remembered it? </span>
            <Link href="/login" className="app-link font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-stretch gap-6">
          <AuthHeading title="Reset your password">
            Enter the email tied to your account and we&apos;ll send a reset link.
          </AuthHeading>

          <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex w-full flex-col gap-1.5">
              <Label htmlFor="forgot-email" className="text-caption font-normal text-foreground">
                Email
              </Label>
              <Input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClassName}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              aria-busy={sending}
              className="h-11 w-full rounded-md text-body-sm font-medium"
            >
              {sending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          <p className="text-center text-body-sm">
            <span className="text-muted-foreground">Remembered it? </span>
            <Link href="/login" className="app-link font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
