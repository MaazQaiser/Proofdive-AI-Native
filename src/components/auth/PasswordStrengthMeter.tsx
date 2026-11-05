"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type PasswordRuleResult = { key: string; label: string; hint: string; passed: boolean };

export function getPasswordRules(password: string): PasswordRuleResult[] {
  return [
    { key: "length", label: "At least 8 characters", hint: "use at least 8 characters", passed: password.length >= 8 },
    { key: "uppercase", label: "One uppercase letter", hint: "add an uppercase letter", passed: /[A-Z]/.test(password) },
    { key: "lowercase", label: "One lowercase letter", hint: "add a lowercase letter", passed: /[a-z]/.test(password) },
    { key: "number", label: "One number", hint: "add a number", passed: /[0-9]/.test(password) },
    { key: "special", label: "One special character", hint: "add a symbol", passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordRules(password).every((rule) => rule.passed);
}

const STRENGTH_LABEL = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_BAR_COLOR = ["bg-scoring-red", "bg-scoring-red", "bg-scoring-yellow", "bg-scoring-cyan", "bg-scoring-green"];

type Props = {
  password: string;
  /** Put on the line, for the field's `aria-describedby`. */
  id?: string;
};

/**
 * Live strength for the platform's password-creation flows: a five-step bar
 * and one line under it. Before anything is typed the line states the one
 * rule the form enforces (8+ characters); after, the strength and the next
 * thing that would raise it. The other four rules are advice, so they are
 * offered one at a time rather than listed as requirements.
 *
 * Shown from the start and always the same height: the auth form sits centred
 * on its page, so a meter that appeared or grew while someone typed would
 * lift the whole form, field and caret included, under their hands.
 */
export function PasswordStrengthMeter({ password, id }: Props) {
  const rules = getPasswordRules(password);
  const passedCount = rules.filter((rule) => rule.passed).length;
  const strengthIndex = password.length === 0 ? 0 : Math.max(passedCount - 1, 0);
  const next = rules.find((rule) => !rule.passed);
  const typed = password.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div aria-hidden className="flex gap-1">
        {rules.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-muted transition-colors",
              typed && i < passedCount ? STRENGTH_BAR_COLOR[strengthIndex] : undefined,
            )}
          />
        ))}
      </div>
      <p
        id={id}
        aria-live="polite"
        className={cn("truncate text-overline", next ? "text-muted-foreground" : "text-scoring-green-fg")}
      >
        {!typed ? (
          "At least 8 characters"
        ) : next ? (
          `${STRENGTH_LABEL[strengthIndex]} · ${next.hint}`
        ) : (
          <>
            <Check className="mr-1 inline size-3 align-[-2px]" aria-hidden />
            {STRENGTH_LABEL[strengthIndex]}
          </>
        )}
      </p>
    </div>
  );
}
