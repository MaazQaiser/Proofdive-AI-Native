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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" &&
          "bg-black text-white hover:bg-black/90 active:bg-black/80",
        variant === "secondary" &&
          "bg-white text-black shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:bg-black/[.03] active:bg-black/[.06]",
        variant === "ghost" &&
          "bg-transparent text-black/70 hover:text-black hover:bg-black/[.03] active:bg-black/[.06]",
        className,
      )}
      {...props}
    />
  );
}

