import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type WizardStepperStep = {
  id: string;
  title: string;
};

type OrganizationWizardStepperProps = {
  steps: WizardStepperStep[];
  /** Index of the current step in `steps`, or `-1` when on the landing prelude. */
  currentIndex: number;
};

/** Horizontal step indicator for the Add Organization full-screen wizard. */
export function OrganizationWizardStepper({
  steps,
  currentIndex,
}: OrganizationWizardStepperProps) {
  return (
    <nav aria-label="Organization setup steps" className="w-full">
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;
          const isUpcoming = currentIndex < index;

          return (
            <li
              key={step.id}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-2",
                index === steps.length - 1 && "flex-none",
              )}
            >
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <div
                    className={cn(
                      "h-px flex-1",
                      isCompleted || isCurrent ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden
                  />
                ) : (
                  <div className="flex-1" aria-hidden />
                )}
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border text-caption font-semibold",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-primary text-primary-foreground",
                    isUpcoming && "border-border bg-background text-muted-foreground",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <Check className="size-3.5" strokeWidth={2.5} /> : index + 1}
                </span>
                {index < steps.length - 1 ? (
                  <div
                    className={cn(
                      "h-px flex-1",
                      isCompleted ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden
                  />
                ) : (
                  <div className="flex-1" aria-hidden />
                )}
              </div>
              <span
                className={cn(
                  "max-w-[7.5rem] text-center text-overline leading-snug",
                  isCurrent || isCompleted
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
