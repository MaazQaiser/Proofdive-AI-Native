"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-5 w-5 shrink-0", className)} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-5 w-5 shrink-0 text-[#0A66C2]", className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white">
      <header className="relative z-10 flex h-20 shrink-0 items-center px-12">
        <Link href="/">
          <Logo size="xxs" />
        </Link>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <AuthVisualPanel />

        <div className="flex w-full items-center justify-center px-6 py-16 lg:w-[731px] lg:shrink-0 lg:px-12">
          <div className="flex w-full max-w-[524px] flex-col items-start gap-3">
            <div className="flex w-full flex-col items-center">
              <h1 className="text-subheading text-center font-medium text-extended-dark-cyan">Login</h1>
            </div>
            <div className="flex w-full flex-col items-center">
              <p className="text-center text-[22px] leading-10 font-medium tracking-[-0.88px] text-muted-foreground">
                To access your account
              </p>
            </div>

            <form
              className="flex w-full flex-col gap-[26px]"
              onSubmit={(e) => {
                e.preventDefault();
                router.push("/onboarding");
              }}
            >
              <div className="flex w-full flex-col gap-4">
                <div className="flex w-full flex-col gap-[5px]">
                  <Label htmlFor="login-email" className="text-caption font-normal text-foreground">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="h-14 rounded-lg border-border px-[13px] py-[17px] text-lg placeholder:text-placeholder md:text-lg"
                    required
                  />
                </div>
                <div className="flex w-full flex-col gap-[5px]">
                  <div className="flex w-full items-center justify-between">
                    <Label htmlFor="login-password" className="text-caption font-normal text-foreground">
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-caption font-medium text-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    className="h-14 rounded-lg border-border px-[13px] py-[17px] text-lg placeholder:text-placeholder md:text-lg"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="h-14 w-full rounded-lg text-lg font-medium">
                Login
              </Button>
            </form>

            <div className="flex w-full flex-col items-center pt-1">
              <p className="text-center text-lg text-primary">Or sign in with</p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="relative flex w-full items-center justify-center rounded-lg border border-border bg-white px-5 py-4 hover:bg-muted"
            >
              <GoogleIcon className="absolute top-1/2 left-5 -translate-y-1/2" />
              <span className="text-lg font-medium text-foreground">Google</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="relative flex w-full items-center justify-center rounded-lg border border-border bg-white px-5 py-4 hover:bg-muted"
            >
              <LinkedInIcon className="absolute top-1/2 left-5 -translate-y-1/2" />
              <span className="text-lg font-medium text-foreground">LinkedIn</span>
            </button>

            <div className="flex w-full flex-col items-center pt-1">
              <p className="text-center text-lg">
                <span className="text-muted-foreground">Do not have an account? </span>
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => router.push("/superadmin/overview")}
                className="text-caption text-muted-foreground/70 hover:text-foreground hover:underline"
              >
                Super Admin login →
              </button>
              <button
                type="button"
                onClick={() => router.push("/orgadmin/accept-invite")}
                className="text-caption text-muted-foreground/70 hover:text-foreground hover:underline"
              >
                Organization Admin login →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/login-signup%20assets/Background%20gradient.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 w-[1276px] max-w-none"
      />
    </div>
  );
}
