"use client";

import { Bot, FilePenLine, HelpCircle, Layers, Save, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SuccessDriverMark } from "@/components/ui/success-driver-card";
import { SUCCESS_DRIVER_ORDER, SUCCESS_DRIVERS } from "@/lib/successDrivers";
import {
  competenciesByDriver,
  type CompetencyFrameworkVersion,
  type FrameworkCompetency,
} from "@/lib/superAdminCompetencyFrameworks";
import { useCompetencyFrameworks } from "@/lib/useCompetencyFrameworks";

import { Disclosure, IconLabel } from "../../../ui/Disclosure";

type Props = { frameworkId: string };

export function CompetencyFrameworkEditorScreen({ frameworkId }: Props) {
  const router = useRouter();
  const { getById, saveFrameworkContent, isNameTaken, hydrated } = useCompetencyFrameworks();
  const stored = getById(frameworkId);

  const [name, setName] = useState("");
  const [competencies, setCompetencies] = useState<FrameworkCompetency[]>([]);
  const [baseline, setBaseline] = useState<{
    name: string;
    competencies: FrameworkCompetency[];
  } | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    if (!hydrated || !stored) return;
    if (stored.isDefault) {
      toast.error("The default framework is view-only. Create a copy to edit.");
      router.replace("/superadmin/competency-engine");
      return;
    }
    setName(stored.name);
    setCompetencies(structuredClone(stored.competencies));
    setBaseline({
      name: stored.name,
      competencies: structuredClone(stored.competencies),
    });
  }, [hydrated, stored, router]);

  const dirty = useMemo(() => {
    if (!baseline) return false;
    return (
      name.trim() !== baseline.name.trim() ||
      JSON.stringify(competencies) !== JSON.stringify(baseline.competencies)
    );
  }, [baseline, name, competencies]);

  function updateCompetency(
    competencyId: string,
    patch: Partial<Pick<FrameworkCompetency, "definition" | "coreQuestion">>,
  ) {
    setCompetencies((prev) =>
      prev.map((c) => (c.id === competencyId ? { ...c, ...patch } : c)),
    );
  }

  function updateLevel(
    competencyId: string,
    level: number,
    patch: Partial<{ humanDescriptor: string; aiDescriptor: string }>,
  ) {
    setCompetencies((prev) =>
      prev.map((c) => {
        if (c.id !== competencyId) return c;
        return {
          ...c,
          levels: c.levels.map((lv) => (lv.level === level ? { ...lv, ...patch } : lv)),
        };
      }),
    );
  }

  function persist(status: CompetencyFrameworkVersion["status"], leaveAfter: boolean) {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Framework name is required.");
      return;
    }
    if (isNameTaken(trimmed, frameworkId)) {
      toast.error("A framework with that name already exists.");
      return;
    }
    saveFrameworkContent(frameworkId, { name: trimmed, competencies }, status);
    setBaseline({ name: trimmed, competencies: structuredClone(competencies) });
    toast.success(status === "draft" ? "Draft saved." : "Framework published.");
    if (leaveAfter) router.push("/superadmin/competency-engine");
  }

  function handleClose() {
    if (dirty) {
      setDiscardOpen(true);
      return;
    }
    router.push("/superadmin/competency-engine");
  }

  if (!hydrated) {
    return (
      <div className="-m-6 flex h-full items-center justify-center">
        <p className="text-body-sm text-muted-foreground">Loading framework…</p>
      </div>
    );
  }

  if (!stored || stored.isDefault) {
    return null;
  }

  return (
    <div className="-m-6 flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-12 py-4">
        <div className="min-w-0 space-y-0.5">
          <p className="text-overline font-medium tracking-wide text-muted-foreground uppercase">
            Competency framework
          </p>
          <h1 className="text-h6 text-foreground">Edit copy</h1>
          <p className="text-caption text-muted-foreground">
            Update definitions, core questions, and level descriptors.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => persist("draft", false)}>
            <FilePenLine className="h-4 w-4" />
            Save draft
          </Button>
          <Button type="button" onClick={() => persist("published", false)}>
            <Save className="h-4 w-4" />
            Save changes
          </Button>
          <Button type="button" variant="ghost" onClick={handleClose}>
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-12 py-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <section className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div>
              <h2 className="text-body font-semibold text-foreground">Framework identity</h2>
              <p className="mt-0.5 text-caption text-muted-foreground">
                Display name shown in the frameworks list and organization assignment.
              </p>
            </div>
            <div className="flex max-w-xl flex-col gap-1.5">
              <IconLabel htmlFor="framework-name">Framework name</IconLabel>
              <Input
                id="framework-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-body font-semibold text-foreground">
                Success Drivers & competencies
              </h2>
              <p className="mt-0.5 text-caption text-muted-foreground">
                Expand a driver, then a competency, to edit definition, core question, and
                descriptors for each level.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {SUCCESS_DRIVER_ORDER.map((driverId) => {
                const driver = SUCCESS_DRIVERS[driverId];
                const comps = competenciesByDriver(competencies, driverId);
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
                          <div className="flex flex-col gap-5">
                            <div className="space-y-3">
                              <h4 className="text-overline font-medium tracking-wide text-muted-foreground uppercase">
                                Competency overview
                              </h4>
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1.5">
                                  <IconLabel htmlFor={`${comp.id}-definition`}>
                                    Definition
                                  </IconLabel>
                                  <Textarea
                                    id={`${comp.id}-definition`}
                                    value={comp.definition}
                                    onChange={(e) =>
                                      updateCompetency(comp.id, { definition: e.target.value })
                                    }
                                    rows={3}
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <IconLabel
                                    htmlFor={`${comp.id}-question`}
                                    icon={HelpCircle}
                                  >
                                    Core question
                                  </IconLabel>
                                  <Textarea
                                    id={`${comp.id}-question`}
                                    value={comp.coreQuestion}
                                    onChange={(e) =>
                                      updateCompetency(comp.id, {
                                        coreQuestion: e.target.value,
                                      })
                                    }
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-overline inline-flex items-center gap-1.5 font-medium tracking-wide text-muted-foreground uppercase">
                                <Layers className="size-3.5 shrink-0" aria-hidden />
                                Level descriptors
                              </h4>
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
                                    <div className="flex flex-col gap-3">
                                      <div className="flex flex-col gap-1.5">
                                        <IconLabel
                                          htmlFor={`${comp.id}-l${level.level}-human`}
                                          icon={User}
                                        >
                                          Human descriptor
                                        </IconLabel>
                                        <Textarea
                                          id={`${comp.id}-l${level.level}-human`}
                                          value={level.humanDescriptor}
                                          onChange={(e) =>
                                            updateLevel(comp.id, level.level, {
                                              humanDescriptor: e.target.value,
                                            })
                                          }
                                          rows={3}
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1.5">
                                        <IconLabel
                                          htmlFor={`${comp.id}-l${level.level}-ai`}
                                          icon={Bot}
                                        >
                                          AI descriptor
                                        </IconLabel>
                                        <Textarea
                                          id={`${comp.id}-l${level.level}-ai`}
                                          value={level.aiDescriptor}
                                          onChange={(e) =>
                                            updateLevel(comp.id, level.level, {
                                              aiDescriptor: e.target.value,
                                            })
                                          }
                                          rows={4}
                                        />
                                      </div>
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
      </div>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              You have unsaved edits. Closing now will lose changes since the last save.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDiscardOpen(false)}>
              Keep editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setDiscardOpen(false);
                router.push("/superadmin/competency-engine");
              }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
