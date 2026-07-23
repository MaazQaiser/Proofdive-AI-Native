"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";
import { ArrowUp, FileText, Mic, Paperclip, X, type LucideIcon } from "lucide-react";

import { cn } from "@/components/cn";
import { useSpeechDictation } from "@/components/chat/useSpeechDictation";
import { IconButton } from "@/components/ui/icon-button";
import { SelectionChip } from "@/components/ui/selection-chip";

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
}) {
  const [text, setText] = useState(prefill);
  const [quickPromptsOpen, setQuickPromptsOpen] = useState(false);
  const [chipsInDom, setChipsInDom] = useState(false);
  const [chipsAnimVisible, setChipsAnimVisible] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);
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

  return (
    <div className={cn("flex items-end gap-2", !!thread && "max-h-[600px] w-full min-h-0")}>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-2", !!thread && "min-h-0 max-h-full")}>
        {chipsInDom && quickPromptChips?.length ? (
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
        <div
          className={cn(
            "min-w-0 min-h-0 flex-1 overflow-hidden rounded-[20px] border border-border bg-(--base)/60 backdrop-blur-[42px]",
            !!thread && "flex min-h-0 flex-col",
          )}
        >
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
          {thread ? (
            <div className="flex w-full min-h-0 max-h-[min(380px,42dvh)] flex-1 flex-col border-b border-black/[0.06]">
              <div
                className="flex shrink-0 items-center justify-between gap-2 border-b border-black/[0.06] pl-1 pr-0.5"
                role="group"
                aria-label="AI Coach header"
              >
                <div className="flex min-w-0 items-center gap-2 pl-1">
                  <StarInCircleIcon className="h-4 w-4 text-amber-500" />
                  <span className="text-caption text-gray-900">
                    {threadHeaderTitle}
                  </span>
                </div>
                {onThreadClose ? (
                  <button
                    type="button"
                    onClick={onThreadClose}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-black/5 hover:text-gray-800 active:bg-black/10"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <div
                className="w-full min-h-0 flex-1 overflow-y-auto scroll-smooth px-3 py-2"
                tabIndex={0}
                role="log"
                aria-relevant="additions"
              >
                {thread}
              </div>
            </div>
          ) : null}
          <textarea
            ref={inputRef}
            value={displayText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "text-text-primary placeholder:text-text-secondary min-h-12 w-full resize-none bg-transparent px-4 py-3 text-sm leading-[1.25] outline-none disabled:cursor-not-allowed disabled:opacity-60",
              thread ? "shrink-0 rounded-none rounded-b-[20px] pt-3" : "rounded-[20px]",
            )}
            rows={1}
            disabled={disabled}
            onFocus={handleTextareaFocus}
            onBlur={handleTextareaBlur}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          {pendingUploads.length ? (
            <div className="flex flex-col gap-2 px-4 pb-2">
              {pendingUploads.map((file) => (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="flex w-fit min-w-16 shrink-0 items-center gap-1 rounded-lg border border-[#D9D1CB] bg-[rgba(244,241,236,0.7)] px-1.5 py-1 backdrop-blur-[16px]"
                >
                  <FileText className="size-4 shrink-0" />
                  <span className="text-text-primary px-1 text-xs leading-6 font-medium whitespace-nowrap">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    title="Remove"
                    onClick={() =>
                      setPendingUploads((prev) =>
                        prev.filter(
                          (f) => !(f.name === file.name && f.lastModified === file.lastModified),
                        ),
                      )
                    }
                    className="flex size-4 shrink-0 items-center justify-center"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-1 px-4 pb-3">
            {voiceError ? (
              <p className="text-caption text-destructive" role="status">
                {voiceError}
              </p>
            ) : !isSupported ? (
              <p className="text-caption text-text-secondary">
                Voice needs Chrome, Edge, or Safari (not Firefox).
              </p>
            ) : null}
            <div className="flex h-7 w-full items-center">
              {showUploadButton ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="text-text-primary hover:bg-muted flex min-w-16 shrink-0 items-center justify-center gap-1 rounded-full px-2 py-0.5 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Paperclip className="size-4 shrink-0" />
                  <span className="px-1 text-xs leading-6 font-medium whitespace-nowrap">
                    Upload
                  </span>
                </button>
              ) : null}
              <div className="ml-auto flex shrink-0 items-center gap-2">
                {modeToggle ? (
                  modeToggle.isActive ? (
                    <button
                      type="button"
                      onClick={modeToggle.onToggle}
                      aria-label={`Exit ${modeToggle.activeLabel}`}
                      className="flex h-7 shrink-0 items-center gap-1 rounded-full border border-[#D9D1CB] bg-[rgba(244,241,236,0.7)] py-1 pl-2 pr-1.5 backdrop-blur-[16px]"
                    >
                      <modeToggle.icon className="size-4 shrink-0" />
                      <span className="text-text-primary px-0.5 text-xs leading-6 font-medium whitespace-nowrap">
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
                ) : null}
                <IconButton
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => {
                    if (isListening) stop();
                    else void start();
                  }}
                  aria-label={isListening ? "Stop voice" : "Start voice"}
                  className={isListening ? "bg-primary text-primary-foreground" : undefined}
                >
                  <Mic />
                </IconButton>
                <IconButton
                  variant="solid"
                  disabled={disabled}
                  onClick={send}
                  aria-label="Send"
                >
                  <ArrowUp />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarInCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("shrink-0", className)} fill="currentColor" aria-hidden>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
