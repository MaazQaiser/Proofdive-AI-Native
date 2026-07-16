"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";

import { cn } from "@/components/cn";
import { useSpeechDictation } from "@/components/chat/useSpeechDictation";

export type ChatComposerQuickChip = { label: string; value: string; id?: string };

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
              <button
                key={chip.label}
                type="button"
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyQuickChipFromChipObject(chip)}
                className="rounded-full border border-black/10 bg-white/90 px-3.5 py-1.5 text-left text-overline text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-[color,background-color,border-color] duration-200 ease-out hover:bg-white hover:border-black/15 active:bg-black/[.03] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>
        ) : null}
        <div
          className={cn(
            "min-w-0 min-h-0 flex-1 overflow-hidden rounded-[24px] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]",
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
                    <CloseXIcon className="h-4 w-4" />
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
              "min-h-12 w-full resize-none bg-transparent px-4 py-3 text-body-sm leading-6 outline-none disabled:cursor-not-allowed disabled:opacity-60",
              thread ? "shrink-0 rounded-none rounded-b-[20px] pt-3" : "rounded-[24px]",
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
            <div className="px-4 pb-2">
              <div className="flex flex-col gap-2">
                {pendingUploads.map((file) => (
                  <div
                    key={`${file.name}-${file.lastModified}`}
                    className="flex items-center justify-between gap-3 rounded-[16px] border border-white/50 bg-white/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-overline text-gray-800">
                        {file.name}
                      </div>
                      <div className="text-overline text-[var(--app-muted)]">Document selected</div>
                    </div>
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
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-black transition hover:bg-white/80 active:bg-black/[.1]"
                    >
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
                        <path
                          d="M18 6 6 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-col gap-1 px-4 pb-3">
            {voiceError ? (
              <div className="text-overline text-red-600" role="status">
                {voiceError}
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <div className="text-overline text-[var(--app-muted)]">
                Enter to send • Shift+Enter for new line
              </div>
              <div className="flex items-center gap-2">
                {showUploadButton ? (
                  <button
                    type="button"
                    aria-label="Upload"
                    title="Upload"
                    disabled={disabled}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-black transition hover:bg-white/80 active:bg-black/[.1] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-4 w-4"
                    >
                      <path
                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 10l5-5 5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 5v12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : null}
                {isSupported ? (
                  <button
                    type="button"
                    aria-label={isListening ? "Stop voice" : "Start voice"}
                    title={isListening ? "Stop voice" : "Start voice"}
                    disabled={disabled}
                    onClick={() => {
                      if (isListening) stop();
                      else void start();
                    }}
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-full transition",
                      isListening ? "bg-black text-white" : "bg-white/60 text-black",
                      disabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-4 w-4"
                    >
                      <path
                        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 11a7 7 0 0 1-14 0"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 18v3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <div className="text-overline text-[var(--app-muted)]">
                    Voice needs Chrome, Edge, or Safari (not Firefox).
                  </div>
                )}

                <button
                  type="button"
                  aria-label="Send"
                  title="Send"
                  disabled={disabled}
                  onClick={send}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/90 active:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path
                      d="M22 2 11 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 2 15 22l-4-9-9-4 20-7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
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

function CloseXIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
