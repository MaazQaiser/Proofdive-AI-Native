"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  SUPER_ADMIN_DEMO_PROFILE,
  type SuperAdminProfile,
} from "@/lib/superAdminProfileData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

function initialsFor(name: string): string {
  const first = name.trim()[0];
  return first ? first.toUpperCase() : "";
}

export function SuperAdminUserMenu() {
  const router = useRouter();
  const [overrides] = useLocalStorageState<Partial<SuperAdminProfile>>(
    StorageKeys.superAdminProfileOverrides,
    {},
  );
  const name = overrides.fullName ?? SUPER_ADMIN_DEMO_PROFILE.fullName;
  const email = overrides.email ?? SUPER_ADMIN_DEMO_PROFILE.email;
  const initials = initialsFor(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted text-caption font-medium text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0">
        <div className="flex items-center gap-3 p-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-body-sm font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-body-sm font-semibold text-foreground">{name}</span>
            <span className="truncate text-caption text-muted-foreground">{email}</span>
          </div>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem
          className="gap-2 rounded-none px-4 py-3 text-caption font-medium text-foreground [&_svg]:text-foreground"
          onClick={() => router.push("/login")}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
