"use client";

import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { RoleProfile } from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

const ROLE_SUGGESTIONS = [
  "Product Manager",
  "Software Engineer",
  "Data Analyst",
  "UX Designer",
  "Project Manager",
] as const;

/** Radix Select forbids empty item values; map placeholder ↔ stored empty role. */
const PICK_ROLE_VALUE = "__pick_role__";

export function AppShellHeaderRoleSelector() {
  const [roleProfile, setRoleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );

  const role = roleProfile?.targetRole?.trim() ?? "";

  const roleOptions = useMemo(() => {
    const set = new Set<string>(ROLE_SUGGESTIONS as unknown as string[]);
    if (role) set.add(role);
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [role]);

  function handleRoleChange(nextTargetRole: string) {
    const trimmed = nextTargetRole.trim();
    setRoleProfile((prev) => {
      if (!trimmed && !prev) return null;
      if (!prev) return { targetRole: trimmed, createdAt: new Date().toISOString() };
      return { ...prev, targetRole: trimmed };
    });
  }

  return (
    <Select
      value={role || PICK_ROLE_VALUE}
      onValueChange={(next) =>
        handleRoleChange(next === PICK_ROLE_VALUE ? "" : next)
      }
    >
      <SelectTrigger
        id="appshell-target-role"
        size="sm"
        aria-label="Target role"
        className="h-auto min-h-0 w-auto max-w-[min(100vw-2rem,20rem)] gap-1.5 rounded-none border-0 bg-transparent px-0 py-0 text-caption font-medium text-text-primary shadow-none hover:bg-transparent focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent data-[size=sm]:h-auto [&_svg]:size-3 [&_svg]:opacity-40"
      >
        <span className="shrink-0 font-normal text-text-secondary">Preparing for</span>
        <SelectValue placeholder="Pick a role" />
      </SelectTrigger>
      <SelectContent
        align="end"
        side="bottom"
        sideOffset={8}
        position="popper"
        className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] rounded-lg data-[side=bottom]:translate-y-0 data-[side=top]:translate-y-0"
      >
        <SelectItem value={PICK_ROLE_VALUE} className="text-caption text-text-secondary">
          Pick a role
        </SelectItem>
        {roleOptions.map((opt) => (
          <SelectItem key={opt} value={opt} className="text-caption">
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
