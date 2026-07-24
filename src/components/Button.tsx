import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/components/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-body transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/40",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        variant === "secondary" &&
          "border border-[var(--app-hairline)] bg-white text-[var(--app-fg)] hover:bg-black/[.03] active:bg-black/[.06]",
        variant === "ghost" &&
          "bg-transparent text-[var(--app-fg)]/70 hover:text-[var(--app-fg)] hover:bg-black/[.03] active:bg-black/[.06]",
        className,
      )}
      {...props}
    />
  );
}

