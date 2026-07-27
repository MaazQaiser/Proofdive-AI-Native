"use client";

import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";

/**
 * Coach home bottom dock — compact AI Assistant entry (replaces the former
 * freeform coach chat / quick chips / plan-new-role flow).
 */
export function CoachConversationalDock() {
  return <CoachBottomChatBar compactWhenIdle />;
}
