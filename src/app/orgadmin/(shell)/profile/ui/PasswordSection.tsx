import { KeyRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PasswordSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Password & Authentication</CardTitle>
        <CardDescription>Regain access to your account securely.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4 rounded-md border border-border p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-4 w-4" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-body-sm font-medium text-foreground">Reset your password</p>
            <p className="text-caption text-muted-foreground">
              For security, password changes are handled from the login screen rather than from here. Log out and
              use the &quot;Forgot Password?&quot; link to set a new one.
            </p>
            <Button variant="outline" size="sm" className="mt-2 w-fit" asChild>
              <Link href="/forgot-password">Go to Forgot Password</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
