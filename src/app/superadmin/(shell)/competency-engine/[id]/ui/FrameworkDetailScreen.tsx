"use client";

import { Bot, Copy, HelpCircle, Layers, Pencil, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { SuccessDriverMark } from "@/components/ui/success-driver-card";
import { SUCCESS_DRIVER_ORDER, SUCCESS_DRIVERS } from "@/lib/successDrivers";
import { competenciesByDriver } from "@/lib/superAdminCompetencyFrameworks";
import { useCompetencyFrameworks } from "@/lib/useCompetencyFrameworks";

import { CreateFrameworkCloneDialog } from "../../ui/CreateFrameworkCloneDialog";
import { Disclosure, FieldBlock } from "../../ui/Disclosure";
import { FrameworkStatusPill } from "../../ui/FrameworkStatusPill";

type Props = { frameworkId: string };

export function FrameworkDetailScreen({ frameworkId }: Props) {
  const router = useRouter();
  const { frameworks, getById, createClone, isNameTaken, hydrated } = useCompetencyFrameworks();
  const framework = getById(frameworkId) ?? null;
  const [cloneOpen, setCloneOpen] = useState(false);

  const clones = framework
    ? frameworks.filter((f) => f.sourceFrameworkId === framework.id)
    : [];

  function handleConfirmClone(name: string) {
    if (!framework) return;
    const created = createClone(framework.id, name);
    if (!created) {
      toast.error("Could not create framework clone.");
      return;
    }
    setCloneOpen(false);
    toast.success(`Draft "${created.name}" created.`);
    router.push(`/superadmin/competency-engine/${created.id}/edit`);
  }

  if (!hydrated) {
    return (
      <div className="-mx-6 -mb-6 flex h-full items-center justify-center">
        <p className="text-body-sm text-muted-foreground">Loading framework…</p>
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="-mx-6 -mb-6 flex h-full flex-col overflow-hidden">
        <PageHeader sticky>
          <PageBreadcrumb
            parentHref="/superadmin/competency-engine"
            parentLabel="Competency Engine"
            title="Framework not found"
          />
        </PageHeader>
        <div className="px-6 py-6">
          <p className="text-body-sm text-muted-foreground">
            Unable to load this competency framework.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-6 -mb-6 flex h-full flex-col overflow-hidden">
      <PageHeader sticky>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <PageBreadcrumb
            parentHref="/superadmin/competency-engine"
            parentLabel="Competency Engine"
            title={framework.name}
          />
          {framework.isDefault ? (
            <Badge variant="secondary">Default</Badge>
          ) : (
            <Badge variant="outline">Custom</Badge>
          )}
          <FrameworkStatusPill status={framework.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setCloneOpen(true)}>
            <Copy className="h-3.5 w-3.5" />
            Create clone
          </Button>
          {!framework.isDefault ? (
            <Button type="button" size="sm" asChild>
              <Link href={`/superadmin/competency-engine/${framework.id}/edit`}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
          ) : null}
        </div>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h3 className="text-body font-semibold tracking-tight text-foreground">Clones</h3>
            {clones.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-caption text-muted-foreground">
                No clones of this framework yet. Use Create clone to duplicate it as an editable
                draft.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {clones.map((clone) => (
                  <li
                    key={clone.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/superadmin/competency-engine/${clone.id}`}
                        className="truncate text-left text-body-sm font-medium text-foreground hover:underline"
                      >
                        {clone.name}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <FrameworkStatusPill status={clone.status} />
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Button type="button" size="sm" variant="ghost" asChild>
                        <Link href={`/superadmin/competency-engine/${clone.id}`}>View</Link>
                      </Button>
                      <Button type="button" size="sm" variant="outline" asChild>
                        <Link href={`/superadmin/competency-engine/${clone.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Separator />

          <section className="flex flex-col gap-4">
            <h3 className="text-body font-semibold tracking-tight text-foreground">
              Success Drivers & competencies
            </h3>
            <div className="flex flex-col">
              {SUCCESS_DRIVER_ORDER.map((driverId, index) => {
                const driver = SUCCESS_DRIVERS[driverId];
                const comps = competenciesByDriver(framework.competencies, driverId);
                return (
                  <div
                    key={driverId}
                    className={
                      index > 0
                        ? "mt-8 flex flex-col gap-4 border-t border-border pt-8"
                        : "flex flex-col gap-4"
                    }
                  >
                    <div className="flex flex-col gap-1">
                      <SuccessDriverMark driver={driverId} label="full" />
                      <p className="text-caption text-muted-foreground">
                        {comps.length} competencies · {driver.shortLabel}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {comps.map((comp) => (
                        <Disclosure key={comp.id} tone="competency" title={comp.name}>
                          <div className="flex flex-col gap-4">
                            <FieldBlock label="Definition">{comp.definition}</FieldBlock>
                            <Separator />
                            <FieldBlock label="Core question" icon={HelpCircle}>
                              {comp.coreQuestion}
                            </FieldBlock>
                            <Separator />
                            <div className="space-y-2">
                              <div className="text-overline inline-flex items-center gap-1.5 font-medium tracking-wide text-muted-foreground uppercase">
                                <Layers className="size-3.5 shrink-0" aria-hidden />
                                Levels
                              </div>
                              <div className="flex flex-col">
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
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <CreateFrameworkCloneDialog
        open={cloneOpen}
        source={framework}
        isNameTaken={isNameTaken}
        onOpenChange={setCloneOpen}
        onConfirm={handleConfirmClone}
      />
    </div>
  );
}
