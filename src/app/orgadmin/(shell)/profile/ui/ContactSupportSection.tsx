"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ORG_ADMIN_DEMO_ORG } from "@/lib/orgAdminDemo";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

type SupportMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
};

export function ContactSupportSection() {
  const [, setMessages] = useLocalStorageState<SupportMessage[]>(StorageKeys.orgAdminSupportMessages, []);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSend() {
    if (!message.trim()) {
      setError("Please enter your message before sending.");
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `support_${Date.now()}`,
        name: ORG_ADMIN_DEMO_ORG.contactName,
        email: ORG_ADMIN_DEMO_ORG.contactEmail,
        message: message.trim(),
        submittedAt: new Date().toISOString(),
      },
    ]);
    setMessage("");
    setError(null);
    setSubmitted(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Support</CardTitle>
        <CardDescription>Raise issues, ask questions, or request assistance from the ProofDive team.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError(null);
            setSubmitted(false);
          }}
          placeholder="Describe your issue or question…"
          rows={5}
          aria-invalid={!!error}
        />
        {error ? <p className="text-caption text-destructive">{error}</p> : null}
        {submitted ? (
          <div className="flex items-center gap-2 text-caption text-scoring-green">
            <CheckCircle2 className="h-4 w-4" />
            Your support request has been submitted successfully.
          </div>
        ) : null}
        <Button onClick={handleSend} className="w-fit">
          Send
        </Button>
      </CardContent>
    </Card>
  );
}
