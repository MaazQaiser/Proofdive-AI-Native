"use client";

import { Copy } from "lucide-react";
import type { MouseEvent } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type CopyableReferralCodeProps = {
  code: string;
  className?: string;
  codeClassName?: string;
};

/** Monospace referral code with a small copy control. */
export function CopyableReferralCode({ code, className, codeClassName }: CopyableReferralCodeProps) {
  async function handleCopy(e: MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Referral code copied.");
    } catch {
      toast.error("Referral code could not be copied. Please try again.");
    }
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("font-mono", codeClassName)}>{code}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Copy referral code"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
