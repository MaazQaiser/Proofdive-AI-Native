import { DEFAULT_FRAMEWORK_COMPETENCIES } from "@/lib/competencyFrameworkDefaultSeed";
import type { CompetencyId, PillarId } from "@/lib/storyboardDraft";
import type { SuccessDriverId } from "@/lib/successDrivers";

export type CompetencyLevel = 1 | 2 | 3 | 4 | 5;
export type FrameworkStatus = "published" | "draft";

export type CompetencyLevelContent = {
  level: CompetencyLevel;
  label: string;
  humanDescriptor: string;
  aiDescriptor: string;
};

export type FrameworkCompetency = {
  id: CompetencyId;
  driverId: SuccessDriverId;
  name: string;
  definition: string;
  coreQuestion: string;
  levels: CompetencyLevelContent[];
};

export type CompetencyFrameworkVersion = {
  id: string;
  name: string;
  isDefault: boolean;
  status: FrameworkStatus;
  createdAt: string;
  updatedAt: string;
  sourceFrameworkId?: string;
  competencies: FrameworkCompetency[];
};

/** Shallow picker shape used by the org create/edit wizard. */
export type CompetencyFrameworkSummary = {
  id: string;
  name: string;
  isDefault: boolean;
};

export const DEFAULT_FRAMEWORK_ID = "framework_default";

export function createDefaultCompetencyFramework(
  now: string = new Date().toISOString(),
): CompetencyFrameworkVersion {
  return {
    id: DEFAULT_FRAMEWORK_ID,
    name: "ProofDive Default Competency Framework",
    isDefault: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
    competencies: structuredClone(DEFAULT_FRAMEWORK_COMPETENCIES),
  };
}

export function ensureDefaultFramework(
  frameworks: CompetencyFrameworkVersion[],
): CompetencyFrameworkVersion[] {
  const hasDefault = frameworks.some((f) => f.id === DEFAULT_FRAMEWORK_ID || f.isDefault);
  if (hasDefault) return frameworks;
  return [createDefaultCompetencyFramework(), ...frameworks];
}

export function toFrameworkSummary(
  framework: CompetencyFrameworkVersion,
): CompetencyFrameworkSummary {
  return {
    id: framework.id,
    name: framework.name,
    isDefault: framework.isDefault,
  };
}

export function deepCloneFramework(
  source: CompetencyFrameworkVersion,
  name: string,
  now: string = new Date().toISOString(),
): CompetencyFrameworkVersion {
  return {
    id: `framework_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    isDefault: false,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    sourceFrameworkId: source.id,
    competencies: structuredClone(source.competencies),
  };
}

export function competenciesByDriver(
  competencies: FrameworkCompetency[],
  driverId: PillarId,
): FrameworkCompetency[] {
  return competencies.filter((c) => c.driverId === driverId);
}

export function isFrameworkNameTaken(
  frameworks: CompetencyFrameworkVersion[],
  name: string,
  excludeId?: string,
): boolean {
  const normalized = name.trim().toLowerCase();
  return frameworks.some(
    (f) => f.id !== excludeId && f.name.trim().toLowerCase() === normalized,
  );
}
