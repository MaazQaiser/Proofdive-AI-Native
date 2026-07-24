"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";
import { Maximize2, Minimize2, X, type LucideIcon } from "lucide-react";

import { cn } from "@/components/cn";
import { useSpeechDictation } from "@/components/chat/useSpeechDictation";
import { Chatbox } from "@/components/ui/chatbox";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IconButton } from "@/components/ui/icon-button";
import { SelectionChip } from "@/components/ui/selection-chip";
import { BackgroundGlow, type BackgroundGlowIntensity } from "@/components/shared/BackgroundGlow";

export type ChatComposerQuickChip = { label: string; value: string; id?: string };

/** A persistent, always-visible footer icon that toggles into a labeled pill once active —
 * e.g. the FAQ Assistant entry point. Unlike `quickPromptChips`, this is never gated by
 * focus, and (see render below) is deliberately never disabled by the composer's own
 * `disabled` prop, since toggling it off is exactly how a caller un-disables the composer. */
export type ChatComposerModeToggle = {
  isActive: boolean;
  icon: LucideIcon;
  /** Shown next to the icon only while `isActive` is true. */
  activeLabel: string;
  onToggle: () => void;
};

const headerIconButtonClassName =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-muted hover:text-text-primary active:bg-muted";

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
  /** Persistent footer icon/pill toggle (e.g. FAQ Assistant) — see `ChatComposerModeToggle`. */
  modeToggle?: ChatComposerModeToggle;
  thread?: ReactNode;
  /** Dismiss the in-card thread (e.g. clear messages); shows a close control when set. */
  onThreadClose?: () => void;
  threadHeaderTitle?: string;
  backgroundGlowIntensity?: BackgroundGlowIntensity;
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

  const modeToggleControl = modeToggle ? (
    modeToggle.isActive ? (
      <button
        type="button"
        onClick={modeToggle.onToggle}
        aria-label={`Exit ${modeToggle.activeLabel}`}
        className="flex h-7 shrink-0 items-center gap-1 rounded-full border border-border bg-muted/70 py-1 pl-2 pr-1.5 backdrop-blur-[16px]"
      >
        <modeToggle.icon className="size-4 shrink-0" />
        <span className="text-text-primary px-0.5 text-overline font-medium leading-6 whitespace-nowrap">
          {modeToggle.activeLabel}
        </span>
        <X className="size-4 shrink-0" />
      </button>
    ) : (
      <IconButton
        variant="ghost"
        onClick={modeToggle.onToggle}
        aria-label={modeToggle.activeLabel}
      >
        <modeToggle.icon />
      </IconButton>
    )
  ) : null;

  const threadLeading = thread ? (
    <div
      className={cn(
        "flex w-full min-h-0 flex-1 flex-col border-b border-border",
        expanded ? "max-h-none" : "max-h-[min(380px,42dvh)]",
      )}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-5"
        role="group"
        aria-label="AI Coach header"
      >
        <div className="flex min-w-0 items-center gap-2">
          <StarInCircleIcon className="h-4 w-4 text-scoring-yellow" />
          <span className="text-caption text-text-primary">{threadHeaderTitle}</span>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={headerIconButtonClassName}
            aria-label={expanded ? "Exit full screen" : "Expand to full screen"}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          {onThreadClose ? (
            <button
              type="button"
              onClick={handleThreadClose}
              className={headerIconButtonClassName}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      <div
        className="w-full min-h-0 flex-1 overflow-y-auto scroll-smooth px-5 py-2"
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

  const chatbox = (
    <Chatbox
      className={cn(
        !!thread && "min-h-0 flex-1",
        expanded && "h-full max-h-full w-full max-w-none",
      )}
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
      leading={threadLeading}
      footerTrailing={modeToggleControl}
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

  return (
    <>
      {/* Soft brand wash behind every candidate composer — sits under the
          interactive chrome via z-index so the frosted Chatbox stays crisp. */}
      <BackgroundGlow intensity={backgroundGlowIntensity} />
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

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-50 flex h-dvh w-screen items-center justify-center p-4 outline-none sm:p-6"
          >
            <DialogTitle className="sr-only">{threadHeaderTitle}</DialogTitle>
            {expanded ? (
              <div className="flex h-full max-h-[min(840px,90dvh)] w-full max-w-[800px] flex-col">
                {chatbox}
              </div>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}

function StarInCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("shrink-0", className)} fill="currentColor" aria-hidden>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
