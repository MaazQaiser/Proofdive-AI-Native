"use client";

import { Badge } from "@/components/ui/badge";
import { GoogleIcon, LinkedInIcon } from "@/components/icons/SocialIcons";

/**
 * SSO stack for auth pages — LinkedIn first (it authenticates AND can seed
 * the Experience step with real work history, the highest-value path for a
 * career product), Google as the secondary option.
 */
export function SocialAuthButtons({
  onLinkedIn,
  onGoogle,
  linkedInBadge,
  disabled,
}: {
  onLinkedIn: () => void;
  onGoogle: () => void;
  /** Small pill inside the LinkedIn button, e.g. "imports your experience". */
  linkedInBadge?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <button
        type="button"
        onClick={onLinkedIn}
        disabled={disabled}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-white px-4 text-body-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <LinkedInIcon />
        Continue with LinkedIn
        {linkedInBadge ? (
          <Badge className="hidden sm:inline-flex">{linkedInBadge}</Badge>
        ) : null}
      </button>
      <button
        type="button"
        onClick={onGoogle}
        disabled={disabled}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-white px-4 text-body-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>
    </div>
  );
}

/** Hairline "or with email" separator between SSO and the email form. */
export function AuthDivider({ label = "or with email" }: { label?: string }) {
  return (
    <div className="flex w-full items-center gap-3">
      <span aria-hidden className="h-px flex-1 bg-border" />
      <span className="text-caption text-muted-foreground">{label}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}
