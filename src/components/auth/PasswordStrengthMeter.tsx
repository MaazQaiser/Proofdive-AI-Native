"use client";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type PasswordRuleResult = { key: string; label: string; passed: boolean };

export function getPasswordRules(password: string): PasswordRuleResult[] {
  return [
    { key: "length", label: "At least 8 characters", passed: password.length >= 8 },
    { key: "uppercase", label: "One uppercase letter", passed: /[A-Z]/.test(password) },
    { key: "lowercase", label: "One lowercase letter", passed: /[a-z]/.test(password) },
    { key: "number", label: "One number", passed: /[0-9]/.test(password) },
    { key: "special", label: "One special character", passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordRules(password).every((rule) => rule.passed);
}

const STRENGTH_LABEL = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_BAR_COLOR = ["bg-scoring-red", "bg-scoring-red", "bg-scoring-yellow", "bg-scoring-cyan", "bg-scoring-green"];

type Props = { password: string };

/** Live strength indicator + rule checklist for the platform's password-creation flows (min 8 chars, upper/lower/number/special). */
export function PasswordStrengthMeter({ password }: Props) {
  const rules = getPasswordRules(password);
  const passedCount = rules.filter((rule) => rule.passed).length;
  const strengthIndex = password.length === 0 ? 0 : Math.max(passedCount - 1, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {rules.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full bg-muted transition-colors",
                password.length > 0 && i < passedCount ? STRENGTH_BAR_COLOR[strengthIndex] : undefined,
              )}
            />
          ))}
        </div>
        {password.length > 0 ? (
          <span className="shrink-0 text-overline text-muted-foreground">{STRENGTH_LABEL[strengthIndex]}</span>
        ) : null}
      </div>
      <ul className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
        {rules.map((rule) => (
          <li
            key={rule.key}
            className={cn(
              "flex items-center gap-1.5 text-overline",
              rule.passed ? "text-scoring-green" : "text-muted-foreground",
            )}
          >
            {rule.passed ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
