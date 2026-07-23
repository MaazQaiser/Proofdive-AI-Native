"use client";

import { useCallback, useMemo, useState } from "react";

import {
  FAQ_ROOT_ITEMS,
  getFaqRootItem,
  type FaqAnswer,
  type FaqFollowup,
  type FaqRootItem,
  type FaqRootItemId,
} from "@/lib/faqAssistantContent";
import { useLatestInterviewReport } from "@/lib/interviewReports";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { Experience, RoleProfile, StoryboardFromCraft, TrainingJourneyProgress } from "@/lib/proofdiveTypes";
import { deriveJourneySignals, pickRecommendedNextStep } from "@/lib/recommendedNextStep";
import {
  createStoryboardDraft,
  normalizeStoryboardDocument,
  overallCompetencyStrength,
  type StoryboardDraftStore,
} from "@/lib/storyboardDraft";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

type FaqView =
  | { screen: "root" }
  | { screen: "item"; itemId: FaqRootItemId }
  | { screen: "followup"; itemId: FaqRootItemId; followupId: string };

export type FaqScreenData =
  | {
      kind: "root";
      showGreeting: boolean;
      candidateName: string;
      items: { id: FaqRootItemId; label: string }[];
    }
  | { kind: "item"; item: FaqRootItem; answer: FaqAnswer }
  | { kind: "followup"; item: FaqRootItem; answer: FaqAnswer; followup: FaqFollowup };

/**
 * Self-contained FAQ Assistant state machine — reads the same localStorage sources as the
 * Dashboard (role, reports, training progress, storyboard draft) so it can resolve dynamic
 * answers ("What's next", "View Latest Report") from any page, not just `/coach`.
 *
 * `faqView` is deliberately plain React state (not persisted): closing FAQ mode does not
 * reset it, so reopening within the same mount resumes the exact last screen; a page
 * refresh/new tab naturally resets it by remounting the host component.
 */
export function useFaqAssistant() {
  const [isFaqMode, setIsFaqMode] = useState(false);
  const [faqView, setFaqView] = useState<FaqView>({ screen: "root" });
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasSeenGreeting, setHasSeenGreeting] = useLocalStorageState(
    StorageKeys.faqAssistantGreetingSeen,
    false,
  );

  const [roleProfile] = useLocalStorageState<RoleProfile | null>(StorageKeys.roleProfile, null);
  const [experiences] = useLocalStorageState<Experience[]>(StorageKeys.experiences, []);
  const [trainingJourneyProgressMap] = useLocalStorageState<Record<string, TrainingJourneyProgress>>(
    StorageKeys.trainingProgress,
    {},
  );
  const [draftStore] = useLocalStorageState<StoryboardDraftStore>(StorageKeys.storyboardDraft, {
    version: 1,
    byRole: {},
  });
  const [fromCraft] = useLocalStorageState<StoryboardFromCraft | null>(
    StorageKeys.storyboardFromCraft,
    null,
  );
  const latestReport = useLatestInterviewReport();

  const role = roleProfile?.targetRole?.trim() ?? "";
  const candidateName = roleProfile?.name?.trim() || "there";

  const roleExperienceCount = useMemo(
    () => experiences.filter((e) => (e.role ?? "").trim() === role).length,
    [experiences, role],
  );

  const storyOverallScore = useMemo(() => {
    if (!role) return 0;
    const raw = draftStore.byRole[role] ?? createStoryboardDraft(role);
    return overallCompetencyStrength(normalizeStoryboardDocument(raw));
  }, [draftStore, role]);

  const { hasCraftedStoryboard, hasCreatedStoryboard } = useMemo(
    () => deriveJourneySignals({ role, fromCraft, roleExperienceCount, storyOverallScore }),
    [role, fromCraft, roleExperienceCount, storyOverallScore],
  );

  const recommendedNextStep = useMemo(
    () =>
      pickRecommendedNextStep({
        role,
        trainingJourneyProgressMap,
        hasCraftedStoryboard,
        hasCreatedStoryboard,
      }),
    [role, trainingJourneyProgressMap, hasCraftedStoryboard, hasCreatedStoryboard],
  );

  const resolverCtx = useMemo(
    () => ({ recommendedNextStep, latestReport }),
    [recommendedNextStep, latestReport],
  );

  const consumeGreeting = useCallback(() => setShowGreeting(false), []);

  const enterFaqMode = useCallback(() => {
    setIsFaqMode(true);
    if (!hasSeenGreeting) {
      setShowGreeting(true);
      setHasSeenGreeting(true);
    }
  }, [hasSeenGreeting, setHasSeenGreeting]);

  const exitFaqMode = useCallback(() => {
    setIsFaqMode(false);
    consumeGreeting();
  }, [consumeGreeting]);

  const selectRootItem = useCallback(
    (itemId: FaqRootItemId) => {
      setFaqView({ screen: "item", itemId });
      consumeGreeting();
    },
    [consumeGreeting],
  );

  const selectFollowup = useCallback((followupId: string) => {
    setFaqView((prev) =>
      prev.screen === "root" ? prev : { screen: "followup", itemId: prev.itemId, followupId },
    );
  }, []);

  const backToItemMenu = useCallback(() => {
    setFaqView((prev) => (prev.screen === "root" ? prev : { screen: "item", itemId: prev.itemId }));
  }, []);

  const backToRootMenu = useCallback(() => {
    setFaqView({ screen: "root" });
  }, []);

  const screenData = useMemo<FaqScreenData>(() => {
    if (faqView.screen === "root") {
      return {
        kind: "root",
        showGreeting,
        candidateName,
        items: FAQ_ROOT_ITEMS.map((i) => ({ id: i.id, label: i.menuLabel })),
      };
    }

    const item = getFaqRootItem(faqView.itemId);
    const answer = item.getAnswer(resolverCtx);

    if (faqView.screen === "followup") {
      const followup = answer.followups?.find((f) => f.id === faqView.followupId);
      if (followup) {
        return { kind: "followup", item, answer, followup };
      }
      // Stale follow-up (e.g. underlying context changed, like a role switch) — fall back
      // to the item's own answer instead of rendering a missing follow-up.
    }

    return { kind: "item", item, answer };
  }, [faqView, resolverCtx, showGreeting, candidateName]);

  return {
    isFaqMode,
    screenData,
    enterFaqMode,
    exitFaqMode,
    selectRootItem,
    selectFollowup,
    backToItemMenu,
    backToRootMenu,
  };
}
