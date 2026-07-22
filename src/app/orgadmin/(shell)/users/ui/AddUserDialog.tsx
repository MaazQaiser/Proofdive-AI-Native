"use client";

import { FileSpreadsheet, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrgAdminUser } from "@/lib/orgAdminUsers";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [mode, setMode] = useState<"manual" | "bulk">("manual");
  const [emails, setEmails] = useState<string[]>([""]);
  const [emailErrors, setEmailErrors] = useState<Array<string | undefined>>([undefined]);

  const [csvFileName, setCsvFileName] = useState("");
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [csvError, setCsvError] = useState("");

  useEffect(() => {
    if (open) return;
    setMode("manual");
    setEmails([""]);
    setEmailErrors([undefined]);
    setCsvFileName("");
    setCsvEmails([]);
    setCsvError("");
  }, [open]);

  function updateEmailAt(index: number, value: string) {
    setEmails((prev) => prev.map((email, i) => (i === index ? value : email)));
    setEmailErrors((prev) => prev.map((error, i) => (i === index ? undefined : error)));
  }

  function addEmailField() {
    setEmails((prev) => [...prev, ""]);
    setEmailErrors((prev) => [...prev, undefined]);
  }

  function removeEmailField(index: number) {
    setEmails((prev) => prev.filter((_, i) => i !== index));
    setEmailErrors((prev) => prev.filter((_, i) => i !== index));
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
      const parsedEmails = text
        .split(/\r?\n/)
        .map((line) => line.split(",")[0]?.trim() ?? "")
        .filter((value) => EMAIL_PATTERN.test(value))
        .map((value) => value.toLowerCase());
      const uniqueEmails = Array.from(new Set(parsedEmails)).filter(
        (email) => !existingLower.includes(email),
      );
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

  function handleSubmitManual() {
    const trimmedEmails = emails.map((email) => email.trim());
    const nextErrors: Array<string | undefined> = trimmedEmails.map(() => undefined);
    const seenLower = new Set<string>();

    trimmedEmails.forEach((email, index) => {
      if (!email) return;
      if (!EMAIL_PATTERN.test(email)) {
        nextErrors[index] = "Enter a valid email address.";
        return;
      }
      const lower = email.toLowerCase();
      if (existingEmails.some((existing) => existing.toLowerCase() === lower)) {
        nextErrors[index] = "A user with this email already exists.";
        return;
      }
      if (seenLower.has(lower)) {
        nextErrors[index] = "You already entered this email address.";
        return;
      }
      seenLower.add(lower);
    });

    const validEmails = trimmedEmails.filter(
      (email, index) => email && !nextErrors[index],
    );

    if (validEmails.length === 0 && trimmedEmails.every((email) => !email)) {
      nextErrors[0] = "Enter at least one email address.";
    }

    if (nextErrors.some(Boolean) || validEmails.length === 0) {
      setEmailErrors(nextErrors);
      return;
    }

    const invitedDate = new Date().toISOString().slice(0, 10);
    onCreate(
      validEmails.map((email, index) => ({
        id: `orguser_${Date.now()}_${index}`,
        name: nameFromEmail(email),
        email,
        status: "invited",
        invitedDate,
        joinedDate: null,
      })),
    );
  }

  function handleSubmitBulk() {
    if (csvEmails.length === 0) return;
    const invitedDate = new Date().toISOString().slice(0, 10);
    onCreate(
      csvEmails.map((email, index) => ({
        id: `orguser_${Date.now()}_${index}`,
        name: nameFromEmail(email),
        email,
        status: "invited",
        invitedDate,
        joinedDate: null,
      })),
    );
  }

  const validEmailCount = emails.filter((email) => EMAIL_PATTERN.test(email.trim())).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "manual" | "bulk")}>
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">
              Add by Email
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex-1">
              Bulk Invite via CSV
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === "manual" ? (
          <div className="flex flex-col gap-3">
            <Label>Email</Label>
            {emails.map((email, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="candidate@company.com"
                    value={email}
                    onChange={(e) => updateEmailAt(index, e.target.value)}
                    aria-invalid={!!emailErrors[index]}
                  />
                  {emailErrors[index] && (
                    <p className="mt-1 text-caption text-destructive">{emailErrors[index]}</p>
                  )}
                </div>
                {emails.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEmailField(index)}
                    aria-label="Remove email"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addEmailField}>
              <Plus className="h-4 w-4" />
              Add another email
            </Button>
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
          {mode === "manual" ? (
            <Button onClick={handleSubmitManual}>
              {validEmailCount > 1 ? "Send Invites" : "Send Invite"}
            </Button>
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
