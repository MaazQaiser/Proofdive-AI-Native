"use client";

import { Ban, CheckCircle2, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import { DetailField, DetailGrid, DetailSection } from "@/components/ui/detail-field";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AVAILABLE_COURSES, type CompetencyFramework } from "@/lib/superAdminOrganizationWizard";
import { ORGANIZATION_TYPE_LABEL, type Organization } from "@/lib/superAdminOrganizations";
import { SUCCESS_DRIVER_ORDER, SUCCESS_DRIVERS } from "@/lib/successDrivers";
import { SuccessDriverCompetencyPill } from "@/components/ui/success-driver-card";

import { OrganizationStatusPill } from "./StatusPills";

function ManageButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className="bg-extended-light-cyan text-extended-green-blue hover:bg-extended-light-cyan/80"
    >
      <Pencil className="h-3.5 w-3.5" />
      {children}
    </Button>
  );
}

type OrganizationDetailDrawerProps = {
  organization: Organization | null;
  onOpenChange: (open: boolean) => void;
  frameworks: CompetencyFramework[];
  onRequestStatusChange: (org: Organization) => void;
};

export function OrganizationDetailDrawer({
  organization,
  onOpenChange,
  frameworks,
  onRequestStatusChange,
}: OrganizationDetailDrawerProps) {
  const router = useRouter();

  if (!organization) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  const assignedFramework = frameworks.find((f) => f.id === organization.competencyFrameworkId);
  const assignedCourses = AVAILABLE_COURSES.filter((c) => organization.courseIds.includes(c.id));

  function goToEdit(section: string) {
    onOpenChange(false);
    router.push(`/superadmin/organizations/${organization!.id}/edit?section=${section}`);
  }

  return (
    <Sheet open={!!organization} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="flex flex-col gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="flex min-h-14 shrink-0 flex-row items-center justify-end gap-2 space-y-0 border-b border-border py-4 pl-6 pr-4">
          <SheetTitle className="sr-only">{organization.name}</SheetTitle>
          <Button
            size="sm"
            variant={organization.status === "active" ? "destructive" : "default"}
            onClick={() => onRequestStatusChange(organization)}
          >
            {organization.status === "active" ? (
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
          <Button size="sm" variant="outline" onClick={() => goToEdit("details")}>
            <Pencil className="h-3.5 w-3.5" />
            Edit Details
          </Button>
          <SheetClose asChild>
            <Button size="sm" variant="ghost" className="size-8 shrink-0 p-0!" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col gap-0">
          <TabsList variant="underline" className="shrink-0 px-6">
            <TabsTrigger variant="underline" value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger variant="underline" value="competencies">
              Competencies
            </TabsTrigger>
            <TabsTrigger variant="underline" value="courses">
              Courses
            </TabsTrigger>
            <TabsTrigger variant="underline" value="payment">
              Payment
            </TabsTrigger>
            <TabsTrigger variant="underline" value="users">
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="mb-8 flex min-w-0 flex-col gap-1">
              <p className="text-overline text-muted-foreground">
                {ORGANIZATION_TYPE_LABEL[organization.type]}
              </p>
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-h4 text-foreground">{organization.name}</p>
                <OrganizationStatusPill status={organization.status} />
              </div>
            </div>
            <div className="flex flex-col gap-8">
              <DetailSection title="Basic Details">
                <DetailGrid>
                  <DetailField label="Industry / Domain" value={organization.industry} />
                  <DetailField label="Domain" value={organization.domain} />
                  <DetailField
                    label="Logo"
                    value={organization.logoFileName || "Not uploaded"}
                    muted={!organization.logoFileName}
                  />
                </DetailGrid>
              </DetailSection>

              <Separator />

              <DetailSection title="Location">
                <DetailGrid>
                  <DetailField label="Country" value={organization.country} />
                  <DetailField label="City" value={organization.city} />
                  <DetailField label="Region" value={organization.region} />
                </DetailGrid>
              </DetailSection>

              <Separator />

              <DetailSection title="Point of Contact">
                <div className="flex flex-col gap-1">
                  <p className="text-body-sm font-medium text-text-primary">{organization.contactName}</p>
                  <p className="text-caption text-muted-foreground">{organization.contactDesignation}</p>
                </div>
                <DetailGrid>
                  <DetailField label="Email" value={organization.contactEmail} />
                  <DetailField
                    label="Phone"
                    value={`${organization.contactCountryCode} ${organization.contactPhone}`}
                  />
                </DetailGrid>
              </DetailSection>
            </div>
          </TabsContent>

          <TabsContent value="competencies" className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-body font-semibold tracking-tight text-foreground">
                  Assigned Competency Framework
                </h3>
                <ManageButton onClick={() => goToEdit("competencies")}>Manage Competencies</ManageButton>
              </div>
              <div className="flex flex-col gap-3 rounded-md border border-border p-4">
                <span className="text-body-sm font-medium text-foreground">
                  {assignedFramework?.name ?? "Not assigned"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUCCESS_DRIVER_ORDER.map((driverId) => (
                    <SuccessDriverCompetencyPill
                      key={driverId}
                      driver={driverId}
                      label={SUCCESS_DRIVERS[driverId].label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-body font-semibold tracking-tight text-foreground">Assigned Courses</h3>
                <ManageButton onClick={() => goToEdit("courses")}>Manage Courses</ManageButton>
              </div>
              {assignedCourses.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">No courses assigned.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {assignedCourses.map((course) => (
                    <div key={course.id} className="flex items-center gap-2 rounded-md border border-border p-3">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-scoring-green" />
                      <span className="text-body-sm text-foreground">{course.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="payment" className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-body font-semibold tracking-tight text-foreground">
                  Subscription Configuration
                </h3>
                <ManageButton onClick={() => goToEdit("payment")}>Manage Payment</ManageButton>
              </div>
              <DetailGrid>
                <DetailField label="Assigned Plan" value={organization.subscriptionPlan} />
                <DetailField label="Number of Users" value={organization.numberOfUsers} />
                <DetailField label="Subscription Start Date" value={organization.subscriptionStartDate} />
                <DetailField label="Subscription Expiry Date" value={organization.subscriptionExpiryDate} />
                <DetailField
                  label="Applied Discount"
                  value={organization.discountPercent ? `${organization.discountPercent}%` : "None"}
                  muted={!organization.discountPercent}
                />
              </DetailGrid>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-4">
              <h3 className="text-body font-semibold tracking-tight text-foreground">User Summary</h3>
              <KpiRow banded className="-mx-6">
                <KpiCard label="Total Users" value={String(organization.totalUsers)} />
                <KpiCard label="Active Users" value={String(organization.activeUsers)} />
                <KpiCard label="Inactive Users" value={String(organization.inactiveUsers)} />
              </KpiRow>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
