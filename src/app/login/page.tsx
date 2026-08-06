"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleIcon, LinkedInIcon } from "@/components/icons/SocialIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { readJson } from "@/lib/storage";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-11 rounded-md border-border bg-white px-3 text-body-sm placeholder:text-placeholder md:text-body-sm";
const socialClassName =
  "flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-white px-4 text-body-sm font-medium text-foreground hover:bg-muted";

export default function LoginPage() {
  const router = useRouter();

  function goOrgAdminDemo() {
    if (readJson<boolean>(StorageKeys.orgAdminAccountActivated) === true) {
      router.push("/orgadmin/overview");
      return;
    }
    router.push("/orgadmin/accept-invite");
  }

  function goPartnerDemo() {
    if (readJson<boolean>(StorageKeys.partnerAccountActivated) === true) {
      router.push("/partner/overview");
      return;
    }
    router.push("/partner/accept-invite");
  }

  return (
    <AuthShell>
      <div className="flex w-full max-w-[400px] flex-col items-stretch gap-5">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-h4 font-medium text-extended-dark-cyan">Sign in</h1>
          <p className="text-body-sm text-muted-foreground">Enter your email to continue</p>
        </div>

        <form
          className="flex w-full flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/onboarding");
          }}
        >
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full flex-col gap-1.5">
              <Label htmlFor="login-email" className="text-caption font-normal text-foreground">
                Email
              </Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className={fieldClassName}
                required
              />
            </div>
            <div className="flex w-full flex-col gap-1.5">
              <div className="flex w-full items-center justify-between gap-3">
                <Label htmlFor="login-password" className="text-caption font-normal text-foreground">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-caption font-medium text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <PasswordInput
                id="login-password"
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                className={cn(fieldClassName, "pl-3")}
                required
              />
            </div>
          </div>
          <Button type="submit" className="h-11 w-full rounded-md text-body-sm font-medium">
            Sign in
          </Button>
        </form>

        <div className="flex w-full flex-col gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className={socialClassName}
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className={socialClassName}
          >
            <LinkedInIcon />
            Continue with LinkedIn
          </button>
        </div>

        <p className="text-center text-body-sm">
          <span className="text-muted-foreground">Do not have an account? </span>
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>

        <div className="flex w-full flex-col items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => router.push("/superadmin/overview")}
            className="text-caption text-muted-foreground/70 hover:text-foreground hover:underline"
          >
            Super Admin login →
          </button>
          <button
            type="button"
            onClick={goOrgAdminDemo}
            className="text-caption text-muted-foreground/70 hover:text-foreground hover:underline"
          >
            Organization Admin login →
          </button>
          <button
            type="button"
            onClick={goPartnerDemo}
            className="text-caption text-muted-foreground/70 hover:text-foreground hover:underline"
          >
            Partner login →
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
