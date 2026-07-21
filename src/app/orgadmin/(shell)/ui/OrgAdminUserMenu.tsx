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
import { ORG_ADMIN_DEMO_ORG } from "@/lib/orgAdminDemo";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function OrgAdminUserMenu() {
  const router = useRouter();
  const initials = initialsFor(ORG_ADMIN_DEMO_ORG.contactName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="mb-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <span className="truncate text-body-sm font-semibold text-foreground">
              {ORG_ADMIN_DEMO_ORG.contactName}
            </span>
            <span className="truncate text-caption text-muted-foreground">{ORG_ADMIN_DEMO_ORG.contactEmail}</span>
          </div>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem
          variant="destructive"
          className="m-1 justify-end gap-2 py-2.5 font-medium"
          onClick={() => router.push("/login")}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
