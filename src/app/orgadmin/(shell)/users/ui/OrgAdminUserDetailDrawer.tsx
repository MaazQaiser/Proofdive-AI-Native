"use client";

import { Ban, CheckCircle2, SquarePen, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DetailField, DetailGrid } from "@/components/ui/detail-field";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { OrgAdminUser } from "@/lib/orgAdminUsers";

import { OrgAdminUserStatusPill } from "./OrgAdminUserStatusPill";

type OrgAdminUserDetailDrawerProps = {
  user: OrgAdminUser | null;
  onOpenChange: (open: boolean) => void;
  onRequestStatusChange: (user: OrgAdminUser) => void;
  onRequestEdit: (user: OrgAdminUser) => void;
};

export function OrgAdminUserDetailDrawer({
  user,
  onOpenChange,
  onRequestStatusChange,
  onRequestEdit,
}: OrgAdminUserDetailDrawerProps) {
  if (!user) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  return (
    <Sheet open={!!user} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="flex flex-col gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="flex min-h-14 shrink-0 flex-row items-center justify-between gap-3 space-y-0 border-b border-border py-4 pl-6 pr-4">
          <SheetTitle className="min-w-0 flex-1 truncate text-left">{user.name}</SheetTitle>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant={user.status === "active" ? "destructive" : "default"}
              onClick={() => onRequestStatusChange(user)}
            >
              {user.status === "active" ? (
                <>
                  <Ban className="h-3.5 w-3.5" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Activate
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRequestEdit(user)}
              aria-label="Edit user details"
            >
              <SquarePen className="h-3.5 w-3.5" />
              Edit
            </Button>
            <SheetClose asChild>
              <Button size="sm" variant="ghost" className="size-8 shrink-0 p-0!" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-8 flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-h4 leading-none text-foreground">{user.name}</p>
              <OrgAdminUserStatusPill status={user.status} />
            </div>
            <p className="truncate text-caption text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-col gap-8">
            <DetailGrid>
              <DetailField label="Invited Date" value={user.invitedDate} />
              <DetailField label="Joined Date" value={user.joinedDate} />
            </DetailGrid>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
