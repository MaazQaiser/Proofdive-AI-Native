"use client";

import { useMemo } from "react";

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

const CHEVRON =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1.25 1.75L5 4.75L8.75 1.75' fill='none' stroke='black' stroke-opacity='0.4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  );

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
    <div className="flex min-w-0 items-center gap-0 sm:flex-row sm:flex-wrap sm:items-center">
      <p className="shrink-0 pr-1 text-caption leading-7 text-muted-foreground">
        Preparing for
      </p>
      <label className="sr-only" htmlFor="appshell-target-role">
        Target role
      </label>
      <div className="flex min-w-0 items-center overflow-visible">
        <select
          id="appshell-target-role"
          value={role}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="min-h-0 min-w-0 cursor-pointer appearance-none border-0 bg-transparent py-0.5 pl-0 pr-5 text-left text-caption leading-snug text-foreground shadow-none outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0"
          style={{
            backgroundImage: `url("${CHEVRON}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0 center",
            backgroundSize: "10px 6px",
          }}
        >
          <option value="">Pick a role</option>
          {roleOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
