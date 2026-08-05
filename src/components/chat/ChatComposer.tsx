"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";
import { createPortal } from "react-dom";
import { Maximize2, MessageCircleQuestion, X, type LucideIcon } from "lucide-react";

import { cn } from "@/components/cn";
import { useSpeechDictation } from "@/components/chat/useSpeechDictation";
import { Chatbox, type ChatboxVariant } from "@/components/ui/chatbox";
import { IconButton } from "@/components/ui/icon-button";
import { SelectionChip } from "@/components/ui/selection-chip";
import { BackgroundGlow, type BackgroundGlowIntensity } from "@/components/shared/BackgroundGlow";

export type ChatComposerQuickChip = { label: string; value: string; id?: string };

/** Ask / FAQ entry — icon-only when idle; Asking state shows label + close in Chatbox. */
export type ChatComposerModeToggle = {
  isActive: boolean;
  icon: LucideIcon;
  activeLabel: string;
  onToggle: () => void;
};

export function ChatComposer({
  placeholder = "Reply (paste here or upload)",
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
  /** Ask / FAQ toggle — see `ChatComposerModeToggle`. */
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
  /** Full-screen FAQ portal (Maximize), not the compact/expanded Chatbox variant. */
  const [fullscreen, setFullscreen] = useState(false);
  const [textOverflows, setTextOverflows] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const skipOpenOnNextFocusRef = useRef(false);
  const measureRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (disabled) skipOpenOnNextFocusRef.current = false;
  }, [disabled]);

  useEffect(() => {
    if (!thread) setFullscreen(false);
  }, [thread]);

  // Full-screen FAQ agent — lock page scroll and allow Escape to exit.
  useEffect(() => {
    if (!fullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen]);

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

  const forceExpanded =
    pendingUploads.length > 0 || Boolean(modeToggle?.isActive) || Boolean(thread);
  const variant: ChatboxVariant =
    forceExpanded || textOverflows ? "expanded" : "compact";

  // Measure against a compact single-line mirror so we can collapse again when text fits.
  useLayoutEffect(() => {
    if (forceExpanded) {
      setTextOverflows(false);
      return;
    }
    const el = measureRef.current;
    if (!el) return;
    setTextOverflows(el.scrollWidth > el.clientWidth + 1);
  }, [displayText, forceExpanded]);

  // Keep the measure mirror as wide as the live compact input when available.
  useLayoutEffect(() => {
    const live = inputRef.current;
    const mirror = measureRef.current;
    if (!live || !mirror || variant !== "compact") return;
    mirror.style.width = `${live.clientWidth}px`;
    setTextOverflows(mirror.scrollWidth > mirror.clientWidth + 1);
  }, [displayText, variant, forceExpanded]);

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
    if (!payload && pendingUploads.length === 0) return;
    if (payload) {
      onSend(payload);
    } else {
      onSend(`📎 ${pendingUploads.map((f) => f.name).join(", ")}`);
    }
    setText("");
    setPendingUploads([]);
    setQuickPromptsOpen(false);
    setTextOverflows(false);
    stop();
    inputRef.current?.focus();
  }

  function handleThreadClose() {
    setFullscreen(false);
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

  const threadLeading = thread ? (
    <>
      <div
        data-slot="chatbox-thread-header"
        className={cn(
          "relative flex w-full shrink-0 items-center justify-between gap-3 p-3",
          "bg-[linear-gradient(189.44deg,rgba(255,255,255,0.2)_50.11%,rgba(14,154,181,0.1)_110.8%),linear-gradient(#fff,#fff)]",
        )}
        role="group"
        aria-label={`${threadHeaderTitle} header`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <MessageCircleQuestion className="size-4" aria-hidden />
          </span>
          <span className="truncate font-gilroy text-[20px] font-medium leading-[1.2] text-extended-cyan-green">
            {threadHeaderTitle}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            variant="ghost"
            size="md"
            onClick={() => setFullscreen(true)}
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
        data-slot="chatbox-thread-log"
        className="flex min-h-0 w-full max-h-[min(380px,42dvh)] flex-1 flex-col border-b border-[#d4d4d2]"
      >
        <div
          className="min-h-0 w-full flex-1 overflow-y-auto scroll-smooth py-0 pr-3 pl-6"
          tabIndex={0}
          role="log"
          aria-relevant="additions"
        >
          {thread}
        </div>
      </div>
    </>
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
    forceVariant?: ChatboxVariant;
  }) {
    return (
      <Chatbox
        className={cn(!!thread && "min-h-0 flex-1", opts?.className)}
        variant={opts?.forceVariant ?? variant}
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
        askAction={
          modeToggle
            ? {
                isActive: modeToggle.isActive,
                label: modeToggle.activeLabel === "AI Assistant" ? "Ask" : modeToggle.activeLabel,
                onToggle: modeToggle.onToggle,
              }
            : undefined
        }
        leading={opts?.leading}
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

  return (
    <>
      {/* Hidden measure mirror for compact single-line overflow detection. */}
      <input
        ref={measureRef}
        aria-hidden
        tabIndex={-1}
        readOnly
        value={displayText || " "}
        className="pointer-events-none invisible absolute top-0 left-0 h-7 w-[min(100%,520px)] overflow-hidden whitespace-nowrap text-body-sm leading-7"
      />

      <BackgroundGlow intensity={backgroundGlowIntensity} />
      <div
        className={cn(
          "relative z-10 flex items-end gap-2",
          !!thread && !fullscreen && "max-h-[600px] w-full min-h-0",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-2",
            !!thread && !fullscreen && "min-h-0 max-h-full",
          )}
        >
          {chipsInDom && quickPromptChips?.length && !fullscreen ? (
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
                  setPendingUploads((prev) =>
                    uploadMultiple ? [...prev, ...files] : files,
                  );
                  onUpload?.(files);
                }
                e.currentTarget.value = "";
              }}
            />
          ) : null}

          {!fullscreen ? chatbox : null}
        </div>
      </div>

      {fullscreen && typeof document !== "undefined"
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={threadHeaderTitle ?? "Full screen assistant"}
              className="fixed inset-0 z-[60] flex h-dvh w-screen flex-col overflow-hidden bg-white"
            >
              <div className="app-canvas app-canvas--motif pointer-events-none absolute inset-0" aria-hidden />

              <IconButton
                variant="ghost"
                size="lg"
                onClick={() => setFullscreen(false)}
                className="absolute top-4 right-4 z-20 text-text-secondary hover:text-text-primary"
                aria-label="Close full screen"
              >
                <X strokeWidth={2} />
              </IconButton>

              <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[800px] flex-col px-6 pt-14 pb-6">
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
                    className: "max-w-none",
                    forceVariant: "expanded",
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
