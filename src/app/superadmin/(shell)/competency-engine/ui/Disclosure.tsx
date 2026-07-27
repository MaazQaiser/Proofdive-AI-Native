"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DisclosureTone = "driver" | "competency" | "level";

export function Disclosure({
  title,
  subtitle,
  defaultOpen = false,
  children,
  className,
  tone = "competency",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  tone?: DisclosureTone;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border",
        tone === "driver" && "bg-muted/40",
        tone === "competency" && "bg-card",
        tone === "level" && "bg-background",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-muted/50",
          tone === "driver" && "py-3.5",
        )}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 flex-1">
          {tone === "driver" ? (
            <span className="block text-body font-semibold tracking-tight text-foreground">
              {title}
            </span>
          ) : tone === "competency" ? (
            <span className="block text-body-sm font-semibold text-foreground">{title}</span>
          ) : (
            <span className="block text-body-sm font-medium text-foreground">{title}</span>
          )}
          {subtitle ? (
            <span className="mt-0.5 block text-caption text-muted-foreground">{subtitle}</span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div
          className={cn(
            "border-t border-border px-4 py-4",
            tone === "driver" && "bg-background/80",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** Small uppercase section label + body text for read-only detail hierarchy. */
export function FieldBlock({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="text-overline inline-flex items-center gap-1.5 font-medium tracking-wide text-muted-foreground uppercase">
        {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
        {label}
      </div>
      <div className="text-body-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {children}
      </div>
    </div>
  );
}

/** Compact label row with optional leading icon — for form labels in the editor. */
export function IconLabel({
  htmlFor,
  icon: Icon,
  children,
}: {
  htmlFor?: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor} className="inline-flex items-center gap-1.5">
      {Icon ? <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden /> : null}
      {children}
    </Label>
  );
}
