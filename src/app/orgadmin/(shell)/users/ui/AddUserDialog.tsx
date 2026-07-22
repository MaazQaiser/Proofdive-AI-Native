"use client";

import { FileSpreadsheet, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ORG_ADMIN_USER_ROLE_LABEL,
  type OrgAdminUser,
  type OrgAdminUserRole,
} from "@/lib/orgAdminUsers";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Record<string, string>;

type SingleFormState = {
  name: string;
  email: string;
  role: OrgAdminUserRole;
  phone: string;
};

const INITIAL_SINGLE_FORM: SingleFormState = { name: "", email: "", role: "learner", phone: "" };

function nameFromEmail(email: string): string {
  const localPart = email.split("@")[0] ?? email;
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type AddUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEmails: string[];
  onCreate: (users: OrgAdminUser[]) => void;
};

export function AddUserDialog({ open, onOpenChange, existingEmails, onCreate }: AddUserDialogProps) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [form, setForm] = useState<SingleFormState>(INITIAL_SINGLE_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [csvFileName, setCsvFileName] = useState("");
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [csvError, setCsvError] = useState("");

  useEffect(() => {
    if (open) return;
    setMode("single");
    setForm(INITIAL_SINGLE_FORM);
    setErrors({});
    setCsvFileName("");
    setCsvEmails([]);
    setCsvError("");
  }, [open]);

  function updateField<K extends keyof SingleFormState>(key: K, value: SingleFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleCsvUpload(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please upload a valid CSV file.");
      setCsvFileName("");
      setCsvEmails([]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const existingLower = existingEmails.map((email) => email.toLowerCase());
      const emails = text
        .split(/\r?\n/)
        .map((line) => line.split(",")[0]?.trim() ?? "")
        .filter((value) => EMAIL_PATTERN.test(value))
        .map((value) => value.toLowerCase());
      const uniqueEmails = Array.from(new Set(emails)).filter((email) => !existingLower.includes(email));
      if (uniqueEmails.length === 0) {
        setCsvError("Please upload a valid CSV file with at least one new email address.");
        setCsvFileName("");
        setCsvEmails([]);
        return;
      }
      setCsvError("");
      setCsvFileName(file.name);
      setCsvEmails(uniqueEmails);
    };
    reader.readAsText(file);
  }

  function handleRemoveCsv() {
    setCsvFileName("");
    setCsvEmails([]);
    setCsvError("");
  }

  function handleSubmitSingle() {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const nextErrors: FieldErrors = {};
    if (!trimmedName) nextErrors.name = "Name is required.";
    if (!trimmedEmail) nextErrors.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(trimmedEmail)) nextErrors.email = "Enter a valid email address.";
    else if (existingEmails.some((email) => email.toLowerCase() === trimmedEmail.toLowerCase()))
      nextErrors.email = "A user with this email already exists.";
    if (!trimmedPhone) nextErrors.phone = "Phone Number is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onCreate([
      {
        id: `orguser_${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        role: form.role,
        status: "invited",
        phone: trimmedPhone,
        invitedDate: new Date().toISOString().slice(0, 10),
        joinedDate: null,
      },
    ]);
  }

  function handleSubmitBulk() {
    if (csvEmails.length === 0) return;
    const invitedDate = new Date().toISOString().slice(0, 10);
    onCreate(
      csvEmails.map((email, index) => ({
        id: `orguser_${Date.now()}_${index}`,
        name: nameFromEmail(email),
        email,
        role: "learner",
        status: "invited",
        phone: "",
        invitedDate,
        joinedDate: null,
      })),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "bulk")}>
          <TabsList className="w-full">
            <TabsTrigger value="single" className="flex-1">
              Invite Single User
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex-1">
              Bulk Invite via CSV
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === "single" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-user-name">Name</Label>
              <Input
                id="add-user-name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-caption text-destructive">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-user-email">Email</Label>
              <Input
                id="add-user-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-caption text-destructive">{errors.email}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-user-role">Role</Label>
              <Select value={form.role} onValueChange={(v) => updateField("role", v as OrgAdminUserRole)}>
                <SelectTrigger id="add-user-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ORG_ADMIN_USER_ROLE_LABEL) as OrgAdminUserRole[]).map((role) => (
                    <SelectItem key={role} value={role}>
                      {ORG_ADMIN_USER_ROLE_LABEL[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-user-phone">Phone Number</Label>
              <Input
                id="add-user-phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-caption text-destructive">{errors.phone}</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-body-sm text-muted-foreground">
              Upload a CSV file of user email addresses to invite multiple users at once.
            </p>

            {!csvFileName ? (
              <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border px-6 py-10 text-center">
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="add-user-csv" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Upload CSV File
                  </label>
                </Button>
                <input
                  id="add-user-csv"
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => handleCsvUpload(e.target.files?.[0])}
                />
                {csvError && <p className="text-caption text-destructive">{csvError}</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-md border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-body-sm font-medium text-foreground">{csvFileName}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveCsv}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <p className="text-caption text-muted-foreground">
                  {csvEmails.length} user{csvEmails.length === 1 ? "" : "s"} will be invited.
                </p>
                <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md bg-muted p-2">
                  {csvEmails.slice(0, 8).map((email) => (
                    <span key={email} className="text-caption text-muted-foreground">
                      {email}
                    </span>
                  ))}
                  {csvEmails.length > 8 && (
                    <span className="text-caption text-muted-foreground">+{csvEmails.length - 8} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {mode === "single" ? (
            <Button onClick={handleSubmitSingle}>Send Invite</Button>
          ) : (
            <Button onClick={handleSubmitBulk} disabled={csvEmails.length === 0}>
              Send Invites
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
