"use client";

import { Bot, Copy, HelpCircle, Layers, Pencil, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { SuccessDriverMark } from "@/components/ui/success-driver-card";
import { SUCCESS_DRIVER_ORDER, SUCCESS_DRIVERS } from "@/lib/successDrivers";
import {
  competenciesByDriver,
  type CompetencyFrameworkVersion,
} from "@/lib/superAdminCompetencyFrameworks";
import { cn } from "@/lib/utils";

import { Disclosure, FieldBlock } from "./Disclosure";

function FrameworkStatusPill({ status }: { status: CompetencyFrameworkVersion["status"] }) {
  const published = status === "published";
  return (
    <span
      className={cn(
        "text-overline inline-flex h-6 w-fit items-center rounded-full border px-2 whitespace-nowrap",
        published
          ? "border-scoring-green/25 bg-scoring-green/15 text-scoring-green-fg"
          : "border-scoring-yellow/30 bg-scoring-yellow/20 text-scoring-yellow-fg",
      )}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

type Props = {
  framework: CompetencyFrameworkVersion | null;
  /** All frameworks — used to list copies derived from the open framework. */
  frameworks: CompetencyFrameworkVersion[];
  onOpenChange: (open: boolean) => void;
  onCreateCopy: (framework: CompetencyFrameworkVersion) => void;
  onSelectFramework: (id: string) => void;
};

export function FrameworkDetailDrawer({
  framework,
  frameworks,
  onOpenChange,
  onCreateCopy,
  onSelectFramework,
}: Props) {
  const router = useRouter();
  const copies = framework
    ? frameworks.filter((f) => f.sourceFrameworkId === framework.id)
    : [];

  return (
    <Sheet open={framework !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-1/2 max-w-[50vw] gap-0 overflow-y-auto sm:max-w-[50vw]" side="right">
        {framework ? (
          <>
            <div className="shrink-0 space-y-3 border-b border-border px-6 py-4 pr-12">
              <div className="space-y-1.5">
                <p className="text-overline font-medium tracking-wide text-muted-foreground uppercase">
                  Framework details
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <SheetTitle className="text-h6 leading-tight">{framework.name}</SheetTitle>
                  {framework.isDefault ? (
                    <Badge variant="secondary">Default</Badge>
                  ) : (
                    <Badge variant="outline">Custom</Badge>
                  )}
                  <FrameworkStatusPill status={framework.status} />
                </div>
                <SheetDescription className="text-body-sm text-muted-foreground">
                  {framework.competencies.length} competencies · {SUCCESS_DRIVER_ORDER.length}{" "}
                  Success Drivers
                  {framework.isDefault
                    ? ". Default is view-only — create a copy to edit."
                    : "."}
                </SheetDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => onCreateCopy(framework)}>
                  <Copy className="h-3.5 w-3.5" />
                  Create copy
                </Button>
                {!framework.isDefault ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      router.push(`/superadmin/competency-engine/${framework.id}/edit`);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit copy
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-5 p-5">
              <section className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-body-sm font-semibold text-foreground">Copies</h3>
                  <span className="text-caption text-muted-foreground">
                    {copies.length === 0
                      ? "None yet"
                      : `${copies.length} version${copies.length === 1 ? "" : "s"}`}
                  </span>
                </div>
                {copies.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-caption text-muted-foreground">
                    No copies of this framework yet. Use Create copy to duplicate it as an editable
                    draft.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {copies.map((copy) => (
                      <li
                        key={copy.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <button
                            type="button"
                            className="truncate text-left text-body-sm font-medium text-foreground hover:underline"
                            onClick={() => onSelectFramework(copy.id)}
                          >
                            {copy.name}
                          </button>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <FrameworkStatusPill status={copy.status} />
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onSelectFramework(copy.id)}
                          >
                            View
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onOpenChange(false);
                              router.push(`/superadmin/competency-engine/${copy.id}/edit`);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-body-sm font-semibold text-foreground">
                  Success Drivers & competencies
                </h3>
                <div className="flex flex-col gap-3">
                  {SUCCESS_DRIVER_ORDER.map((driverId) => {
                    const driver = SUCCESS_DRIVERS[driverId];
                    const comps = competenciesByDriver(framework.competencies, driverId);
                    return (
                      <Disclosure
                        key={driverId}
                        tone="driver"
                        title={<SuccessDriverMark driver={driverId} label="full" />}
                        subtitle={`${comps.length} competencies · ${driver.shortLabel}`}
                        defaultOpen={driverId === "thinking"}
                      >
                        <div className="flex flex-col gap-3">
                          {comps.map((comp) => (
                            <Disclosure key={comp.id} tone="competency" title={comp.name}>
                              <div className="flex flex-col gap-4">
                                <FieldBlock label="Definition">{comp.definition}</FieldBlock>
                                <FieldBlock label="Core question" icon={HelpCircle}>
                                  {comp.coreQuestion}
                                </FieldBlock>
                                <div className="space-y-2">
                                  <div className="text-overline inline-flex items-center gap-1.5 font-medium tracking-wide text-muted-foreground uppercase">
                                    <Layers className="size-3.5 shrink-0" aria-hidden />
                                    Levels
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {comp.levels.map((level) => (
                                      <Disclosure
                                        key={level.level}
                                        tone="level"
                                        title={
                                          <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                            <span className="text-caption font-semibold text-muted-foreground">
                                              Level {level.level}
                                            </span>
                                            <span>{level.label}</span>
                                          </span>
                                        }
                                      >
                                        <div className="flex flex-col gap-4">
                                          <FieldBlock label="Human descriptor" icon={User}>
                                            {level.humanDescriptor}
                                          </FieldBlock>
                                          <FieldBlock label="AI descriptor" icon={Bot}>
                                            {level.aiDescriptor}
                                          </FieldBlock>
                                        </div>
                                      </Disclosure>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </Disclosure>
                          ))}
                        </div>
                      </Disclosure>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export { FrameworkStatusPill };
