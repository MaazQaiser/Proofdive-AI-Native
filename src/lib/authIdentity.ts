import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { readJson, writeJson } from "@/lib/storage";

/** Who signed in, as far as the app knows. Social providers hand us a name;
 * the email form only gives an address, so the name is derived from it (and
 * may be empty, in which case greetings stay generic). */
export type AuthIdentity = {
  name: string;
  email: string;
  provider: "linkedin" | "google" | "email";
};

/** Mock provider profile — stands in for the name/email a real LinkedIn or
 * Google OAuth callback would return. */
export const MOCK_SOCIAL_IDENTITY = {
  name: "Sara Ahmed",
  email: "sara.ahmed@example.com",
} as const;

/** "sara.ahmed@example.com" → "Sara Ahmed". Empty when the local part has no
 * name-like tokens (e.g. "info@", "hr2024@"). */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const tokens = local
    .split(/[._\-+]+/)
    .filter((t) => /^[a-zA-Z]{2,}$/.test(t))
    .slice(0, 2);
  return tokens
    .map((t) => t[0]!.toUpperCase() + t.slice(1).toLowerCase())
    .join(" ");
}

/** "Sara Ahmed" → "Sara". Greetings use the first name only. */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

export function writeAuthIdentity(identity: AuthIdentity) {
  writeJson(StorageKeys.authIdentity, identity);
}

export function readAuthIdentity(): AuthIdentity | null {
  return readJson<AuthIdentity>(StorageKeys.authIdentity);
}
