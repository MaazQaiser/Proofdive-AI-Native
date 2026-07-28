"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";
import { createPortal } from "react-dom";
import { Maximize2, MessageCircleQuestion, X, type LucideIcon } from "lucide-react";

import { cn } from "@/components/cn";
import { useSpeechDictation } from "@/components/chat/useSpeechDictation";
import { Chatbox } from "@/components/ui/chatbox";
import { IconButton } from "@/components/ui/icon-button";
import { SelectionChip } from "@/components/ui/selection-chip";
import { BackgroundGlow, type BackgroundGlowIntensity } from "@/components/shared/BackgroundGlow";

export type ChatComposerQuickChip = { label: string; value: string; id?: string };

/** A persistent, always-visible footer icon that toggles into a labeled pill once active —
 * e.g. the AI Assistant entry point. Unlike `quickPromptChips`, this is never gated by
 * focus, and (see render below) is deliberately never disabled by the composer's own
 * `disabled` prop, since toggling it off is exactly how a caller un-disables the composer. */
export type ChatComposerModeToggle = {
  isActive: boolean;
  icon: LucideIcon;
  /** Shown next to the icon while active, and on the compact-idle open control. */
  activeLabel: string;
  onToggle: () => void;
};

export function ChatComposer({
  placeholder = "Type a message…",
  onSend,
  onUpload,
  uploadAccept,
  uploadMultiple = false,
  disabled = false,
  prefill = "",
  quickPromptChips,
  onQuickPromptChipSelect,
  showUploadButton = true,
  modeToggle,
  /** Renders above the text field, inside the white composer card (e.g. in-thread chat). */
  thread,
  onThreadClose,
  threadHeaderTitle = "AI Coach",
  /** Onboarding keeps the full wash; other candidate pages default to a softer glow. */
  backgroundGlowIntensity = "soft",
  /**
   * When true and the assistant mode toggle is inactive, render a compact pill instead of
   * the full chatbox. Tapping the pill opens the assistant via `modeToggle.onToggle`.
   */
  compactWhenIdle = false,
}: {
  placeholder?: string;
  onSend: (text: string) => void;
  onUpload?: (files: File[]) => void;
  uploadAccept?: string;
  uploadMultiple?: boolean;
  /** Hides the attachment control when the host handles uploads in context (e.g. a later step). */
  showUploadButton?: boolean;
  /** When set, the field is read-only and send/voice are inactive (e.g. end-of-flow choices). */
  disabled?: boolean;
  /** Initial value; parent can remount the composer (e.g. with `key={stepId}`) to reset. */
  prefill?: string;
  /**
   * Coach-style quick prompts: a row of chips is rendered **above** the white input and is shown
   * only while the textarea is focused; it hides when the field loses focus (e.g. toolbar, outside).
   */
  quickPromptChips?: ChatComposerQuickChip[];
  /** If provided and returns `true`, the chip’s value is not prefilled (parent handles the action). */
  onQuickPromptChipSelect?: (chip: ChatComposerQuickChip) => boolean;
  /** Persistent footer icon/pill toggle (e.g. AI Assistant) — see `ChatComposerModeToggle`. */
  modeToggle?: ChatComposerModeToggle;
  thread?: ReactNode;
  /** Dismiss the in-card thread (e.g. clear messages); shows a close control when set. */
  onThreadClose?: () => void;
  threadHeaderTitle?: string;
  backgroundGlowIntensity?: BackgroundGlowIntensity;
  compactWhenIdle?: boolean;
}) {
  const [text, setText] = useState(prefill);
  const [quickPromptsOpen, setQuickPromptsOpen] = useState(false);
  const [chipsInDom, setChipsInDom] = useState(false);
  const [chipsAnimVisible, setChipsAnimVisible] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const skipOpenOnNextFocusRef = useRef(false);

  // A chip selection that hands off to a mode where `disabled` becomes true (e.g. FAQ
  // Assistant) never gets to consume this flag via its own scheduled refocus (you can't
  // focus a disabled textarea) — left stuck `true`, it would otherwise swallow the very
  // next real focus once the composer re-enables. Clear it as soon as we go disabled.
  useEffect(() => {
    if (disabled) skipOpenOnNextFocusRef.current = false;
  }, [disabled]);

  useEffect(() => {
    if (!thread) setExpanded(false);
  }, [thread]);

  // Full-screen FAQ agent — lock page scroll and allow Escape to exit.
  useEffect(() => {
    if (!expanded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const appendFinalTranscript = useCallback((segment: string) => {
    setText((prev) => {
      if (!segment) return prev;
      if (!prev) return segment;
      const needsSpace = !prev.endsWith(" ") && !segment.startsWith(" ");
      return needsSpace ? `${prev} ${segment}` : `${prev}${segment}`;
    });
  }, []);

  const { isSupported, isListening, interim, start, stop, voiceError } = useSpeechDictation({
    onFinalTranscript: appendFinalTranscript,
  });

  const interimSpacer =
    interim && text && !text.endsWith(" ") && !interim.startsWith(" ") ? " " : "";
  const displayText = `${text}${interim ? `${interimSpacer}${interim}` : ""}`;

  function handleTextChange(next: string) {
    if (!interim) {
      setText(next);
      return;
    }
    const suffix = `${interimSpacer}${interim}`;
    if (next.endsWith(suffix)) {
      setText(next.slice(0, next.length - suffix.length));
      return;
    }
    setText(next);
    stop();
  }

  function send() {
    if (disabled) return;
    const payload = displayText.trim();
    if (!payload) return;
    onSend(payload);
    setText("");
    setPendingUploads([]);
    setQuickPromptsOpen(false);
    stop();
    inputRef.current?.focus();
  }

  function handleThreadClose() {
    setExpanded(false);
    onThreadClose?.();
  }

  const hasQuickChips = Boolean(quickPromptChips?.length);

  useEffect(() => {
    if (!hasQuickChips) {
      setChipsInDom(false);
      setChipsAnimVisible(false);
      return;
    }
    if (quickPromptsOpen) {
      setChipsInDom(true);
      let raf2: number | null = null;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setChipsAnimVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2 != null) cancelAnimationFrame(raf2);
      };
    }
    setChipsAnimVisible(false);
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setChipsInDom(false);
    }
  }, [hasQuickChips, quickPromptsOpen]);

  function handleChipsRowTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "opacity") return;
    if (!quickPromptsOpen) {
      setChipsInDom(false);
    }
  }

  function handleTextareaFocus() {
    if (!hasQuickChips || disabled) return;
    if (skipOpenOnNextFocusRef.current) {
      skipOpenOnNextFocusRef.current = false;
      return;
    }
    setQuickPromptsOpen(true);
  }

  function handleTextareaBlur() {
    if (!hasQuickChips) return;
    window.requestAnimationFrame(() => {
      if (document.activeElement !== inputRef.current) {
        setQuickPromptsOpen(false);
      }
    });
  }

  function applyQuickChipFromChipObject(chip: ChatComposerQuickChip) {
    if (onQuickPromptChipSelect?.(chip) === true) {
      setQuickPromptsOpen(false);
      skipOpenOnNextFocusRef.current = true;
      stop();
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    setText(chip.value);
    setQuickPromptsOpen(false);
    skipOpenOnNextFocusRef.current = true;
    stop();
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  // While the assistant is open, exit via the thread header close — do not show an
  // "AI Assistant" footer pill with an X. When idle (non-compact hosts), keep the
  // ghost icon so users can still open the assistant from the full chatbox.
  const modeToggleControl =
    modeToggle && !modeToggle.isActive ? (
      <IconButton
        variant="ghost"
        onClick={modeToggle.onToggle}
        aria-label={modeToggle.activeLabel}
      >
        <modeToggle.icon />
      </IconButton>
    ) : null;

  const threadLeading = thread ? (
    <div
      className={cn(
        "flex w-full min-h-0 flex-1 flex-col border-b border-border",
        "max-h-[min(380px,42dvh)]",
      )}
    >
      <div
        className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-brand-900/80 bg-brand-1000/50 px-5 py-3"
        role="group"
        aria-label={`${threadHeaderTitle} header`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <MessageCircleQuestion className="size-4" aria-hidden />
          </span>
          <span className="truncate text-body-sm font-medium text-extended-cyan-green">
            {threadHeaderTitle}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            variant="ghost"
            size="md"
            onClick={() => setExpanded(true)}
            className="text-text-secondary hover:text-text-primary active:bg-muted"
            aria-label="Expand to full screen"
          >
            <Maximize2 />
          </IconButton>
          {onThreadClose ? (
            <IconButton
              variant="ghost"
              size="md"
              onClick={handleThreadClose}
              className="text-text-secondary hover:text-text-primary active:bg-muted"
              aria-label="Close"
            >
              <X />
            </IconButton>
          ) : null}
        </div>
      </div>
      <div
        className="w-full min-h-0 flex-1 overflow-y-auto scroll-smooth px-5 py-3"
        tabIndex={0}
        role="log"
        aria-relevant="additions"
      >
        {thread}
      </div>
    </div>
  ) : null;

  const voiceStatus = voiceError ? (
    <p className="text-caption text-destructive" role="status">
      {voiceError}
    </p>
  ) : !isSupported ? (
    <p className="text-caption text-text-secondary">
      Voice needs Chrome, Edge, or Safari (not Firefox).
    </p>
  ) : null;

  function renderChatbox(opts?: {
    leading?: ReactNode;
    className?: string;
    hideFooterTrailing?: boolean;
  }) {
    return (
      <Chatbox
        className={cn(!!thread && "min-h-0 flex-1", opts?.className)}
        value={displayText}
        onValueChange={handleTextChange}
        onSend={send}
        placeholder={placeholder}
        disabled={disabled}
        showUploadAction={showUploadButton}
        onUploadClick={() => fileInputRef.current?.click()}
        attachedFiles={pendingUploads.map((file) => ({
          id: `${file.name}-${file.lastModified}`,
          name: file.name,
        }))}
        onRemoveAttachedFile={(id) =>
          setPendingUploads((prev) =>
            prev.filter((f) => `${f.name}-${f.lastModified}` !== id),
          )
        }
        onMicClick={() => {
          if (isListening) stop();
          else void start();
        }}
        isListening={isListening}
        leading={opts?.leading}
        footerTrailing={opts?.hideFooterTrailing ? undefined : modeToggleControl}
        status={voiceStatus}
        textareaRef={inputRef}
        textareaProps={{
          onFocus: handleTextareaFocus,
          onBlur: handleTextareaBlur,
          onKeyDown: (e) => {
            if (disabled) return;
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          },
        }}
      />
    );
  }

  const chatbox = renderChatbox({ leading: threadLeading ?? undefined });

  const isCompactIdle = Boolean(compactWhenIdle && modeToggle && !modeToggle.isActive);

  return (
    <>
      {/* Soft brand wash behind every candidate composer — sits under the
          interactive chrome via z-index so the frosted Chatbox stays crisp. */}
      <BackgroundGlow intensity={backgroundGlowIntensity} />
      {isCompactIdle && modeToggle ? (
        <div className="relative z-10 w-full">
          <button
            type="button"
            onClick={modeToggle.onToggle}
            aria-label={`Open ${modeToggle.activeLabel}`}
            className={cn(
              "flex h-14 w-full max-w-[800px] items-center gap-3 rounded-full p-1.5 pr-4 text-left",
              "border border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-[42px]",
              "[background:linear-gradient(rgba(255,255,255,0.72),rgba(255,255,255,0.72))_padding-box,linear-gradient(180deg,#f2f2f2,var(--extended-light-cyan)_41%,#fff)_border-box]",
              "transition hover:shadow-[0_10px_32px_rgba(0,0,0,0.08)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <modeToggle.icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 truncate text-[16px] font-medium leading-[1.3] text-text-secondary">
              {modeToggle.activeLabel}
            </span>
            <Maximize2 className="size-4 shrink-0 text-text-secondary" aria-hidden />
          </button>
        </div>
      ) : (
      <div
        className={cn(
          "relative z-10 flex items-end gap-2",
          !!thread && !expanded && "max-h-[600px] w-full min-h-0",
        )}
      >
        <div className={cn("flex min-w-0 flex-1 flex-col gap-2", !!thread && !expanded && "min-h-0 max-h-full")}>
          {chipsInDom && quickPromptChips?.length && !expanded ? (
            <div
              onTransitionEnd={handleChipsRowTransitionEnd}
              className={cn(
                "flex min-h-0 flex-wrap gap-2 px-0.5 will-change-transform",
                "origin-bottom transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [transition-property:transform,opacity]",
                "motion-reduce:duration-0 motion-reduce:transition-none",
                chipsAnimVisible
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1.5 opacity-0",
              )}
              aria-hidden={!chipsAnimVisible}
            >
              {quickPromptChips.map((chip) => (
                <SelectionChip
                  key={chip.label}
                  disabled={disabled}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyQuickChipFromChipObject(chip)}
                >
                  {chip.label}
                </SelectionChip>
              ))}
            </div>
          ) : null}

          {showUploadButton ? (
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={uploadAccept}
              multiple={uploadMultiple}
              onChange={(e) => {
                const files = Array.from(e.currentTarget.files ?? []);
                if (files.length) {
                  setPendingUploads((prev) => (uploadMultiple ? [...prev, ...files] : files));
                  onUpload?.(files);
                }
                e.currentTarget.value = "";
              }}
            />
          ) : null}

          {!expanded ? chatbox : null}
        </div>
      </div>
      )}

      {expanded && typeof document !== "undefined"
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={threadHeaderTitle ?? "Full screen assistant"}
              className="fixed inset-0 z-50 flex h-dvh w-screen flex-col bg-background"
            >
              {/* Brand wash behind the bottom composer. No extra orbs — the PNG is
                  fully opaque, so any backdrop behind it reads as a hard mid-screen seam. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/onboarding-gradient.png"
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-auto w-full select-none"
              />

              <IconButton
                variant="ghost"
                size="lg"
                onClick={() => setExpanded(false)}
                className="absolute top-4 right-4 z-20 text-text-secondary hover:text-text-primary"
                aria-label="Close full screen"
              >
                <X strokeWidth={2} />
              </IconButton>

              <div className="relative z-10 mx-auto flex h-full w-full max-w-[800px] flex-col px-6 pt-14 pb-6">
                <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
                  <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-6">
                    {threadHeaderTitle ? (
                      <div className="flex flex-col items-center gap-3 pt-4 text-center">
                        <MessageCircleQuestion
                          className="size-9 text-foreground"
                          strokeWidth={1.6}
                          aria-hidden
                        />
                        <h1 className="text-h2 font-normal tracking-tight text-foreground">
                          {threadHeaderTitle}
                        </h1>
                      </div>
                    ) : null}
                    <div
                      className="w-full"
                      tabIndex={0}
                      role="log"
                      aria-relevant="additions"
                      aria-label="Assistant responses"
                    >
                      {thread}
                    </div>
                  </div>
                </div>

                <div className="relative z-[2] mx-auto w-full max-w-2xl shrink-0 pt-3">
                  {renderChatbox({
                    className: "max-w-none shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
                    hideFooterTrailing: true,
                  })}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
