import * as React from "react";
import { ArrowUp, FileText, MessageCircleQuestion, Mic, Paperclip, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";
import { VoiceWaveVisualizer } from "@/components/chat/VoiceWaveVisualizer";

export type ChatboxAttachedFile = {
  id: string;
  name: string;
};

export type ChatboxVariant = "compact" | "expanded";

type ChatboxProps = {
  className?: string;
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  /**
   * Compact = Figma Type=Compact (60px pill). Expanded = Type=Expanded multi-line shell.
   * Defaults to expanded when attachments/Ask are active via the host.
   */
  variant?: ChatboxVariant;
  /**
   * Single-file convenience API (design-system demos / simple hosts).
   * Prefer `attachedFiles` when multiple chips are needed.
   */
  attachedFileName?: string | null;
  onRemoveFile?: () => void;
  /** Multi-file chips rendered above the textarea (Figma attachment placement). */
  attachedFiles?: ChatboxAttachedFile[];
  onRemoveAttachedFile?: (id: string) => void;
  onUploadClick?: () => void;
  onMicClick?: () => void;
  /** Highlights the mic control while voice dictation is active. */
  isListening?: boolean;
  disabled?: boolean;
  /** Hides the upload affordance for steps that don't accept attachments. */
  showUploadAction?: boolean;
  /**
   * Labels the upload control (e.g. "Upload resume") instead of the bare
   * paperclip — for steps where the attachment IS the primary action and an
   * icon alone undersells it.
   */
  uploadLabel?: string;
  /**
   * Ask / FAQ control. Icon-only when idle (same in compact + expanded);
   * when `isActive`, matches Figma State=Asking (pill with label + X).
   */
  askAction?: {
    isActive: boolean;
    label?: string;
    onToggle: () => void;
  };
  /**
   * Ambient AI glow (opt-in): a slow brand-cyan light pass around the shell's
   * rim plus a soft outer halo — brighter on focus, receding while the user
   * types. Visuals live in `globals.css` under `chatbox-ai-glow`.
   */
  aiGlow?: boolean;
  /**
   * Fades the glow out while keeping it mounted — used when another ambient
   * visual (the AI orb) takes over the AI's presence. Unmounting instead
   * would pop; this cross-fades.
   */
  /** Optional content above attachments/textarea (e.g. FAQ / coach thread). */
  leading?: React.ReactNode;
  /** Status / helper copy below the toolbar (voice errors, unsupported browser). */
  status?: React.ReactNode;
  textareaProps?: Omit<
    React.ComponentProps<"textarea">,
    "value" | "onChange" | "placeholder" | "disabled" | "className" | "rows"
  >;
  textareaRef?: React.Ref<HTMLTextAreaElement | HTMLInputElement>;
};

/**
 * AI reply textbox — Figma "Chatbox" (node 333:7350).
 * Compact: pill, single-line row. Expanded: rounded-20 multi-line with footer actions.
 * Shell stroke / padding / surface / shadow / send size: `globals.css` `[data-slot="chatbox"]`.
 */

/** Line box for the expanded composer, so every height is a whole number of
 *  lines — a box sized to 2.6 lines is what slices the third one in half. */
const CHATBOX_LINE = 20;
const CHATBOX_MIN_LINES = 2;
const CHATBOX_MAX_LINES = 8;

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

/**
 * Grow the composer with the answer.
 *
 * It used to live in a fixed 88px box, so a pasted or dictated answer of any
 * length scrolled inside roughly two and a half lines and the third line was
 * cut through the middle — which reads as broken rather than as "there is more
 * below". Now it sizes to its content up to eight lines and only then scrolls,
 * and every height it takes is a whole number of lines, so a half-line never
 * shows. It is bottom-anchored, so the growth pushes the box upward and the
 * caret stays where the user is looking.
 */
function useAutosizeTextarea(value: string, disabled: boolean) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    el.style.height = "auto";
    const lines = Math.round(el.scrollHeight / CHATBOX_LINE);
    const clamped = Math.min(
      Math.max(lines, CHATBOX_MIN_LINES),
      CHATBOX_MAX_LINES,
    );
    el.style.height = `${clamped * CHATBOX_LINE}px`;
    el.style.overflowY = lines > CHATBOX_MAX_LINES ? "auto" : "hidden";
  }, [value, disabled]);

  return ref;
}

function Chatbox({
  className,
  value,
  onValueChange,
  onSend,
  placeholder = "Reply (paste here or upload)",
  variant = "expanded",
  attachedFileName,
  onRemoveFile,
  attachedFiles,
  onRemoveAttachedFile,
  onUploadClick,
  onMicClick,
  isListening = false,
  disabled,
  showUploadAction = true,
  uploadLabel,
  askAction,
  aiGlow = false,
  leading,
  status,
  textareaProps,
  textareaRef,
}: ChatboxProps) {
  const files: ChatboxAttachedFile[] =
    attachedFiles ??
    (attachedFileName
      ? [{ id: attachedFileName, name: attachedFileName }]
      : []);

  const isCompact = variant === "compact";
  const autosizeRef = useAutosizeTextarea(value, isCompact);
  const isAsking = Boolean(askAction?.isActive);
  const canSend = !disabled && (value.trim().length > 0 || files.length > 0);
  const hasLeading = Boolean(leading);
  const showUpload = showUploadAction && !isAsking;
  const micDisabled = Boolean(disabled || isAsking);

  const fileChips =
    !isCompact && files.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex w-fit min-w-16 shrink-0 items-center gap-1 rounded-lg border border-border bg-muted/70 px-1.5 py-1 backdrop-blur-[16px]"
          >
            <FileText className="size-4 shrink-0" />
            <span className="px-1 text-overline font-medium leading-6 whitespace-nowrap text-text-primary">
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => {
                if (attachedFiles) onRemoveAttachedFile?.(file.id);
                else onRemoveFile?.();
              }}
              aria-label={`Remove ${file.name}`}
              className="flex size-4 shrink-0 items-center justify-center"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    ) : null;

  const askControl = askAction ? (
    isAsking ? (
      <button
        type="button"
        onClick={askAction.onToggle}
        aria-label={`Close ${askAction.label ?? "Ask"}`}
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-1 text-primary"
      >
        <MessageCircleQuestion className="size-[13px] shrink-0" aria-hidden />
        <span className="text-[12px] leading-[1.25] whitespace-nowrap">
          {askAction.label ?? "Ask"}
        </span>
        <X className="size-[13px] shrink-0" aria-hidden />
      </button>
    ) : (
      <IconButton
        variant="ghost"
        onClick={askAction.onToggle}
        aria-label={askAction.label ?? "Ask"}
        className="text-primary"
      >
        <MessageCircleQuestion className="size-[13px]" />
      </IconButton>
    )
  ) : null;

  const micControl = (
    <>
      {isListening ? <VoiceWaveVisualizer /> : null}
      <IconButton
        variant="ghost"
        onClick={onMicClick}
        disabled={micDisabled}
        aria-label={isListening ? "Stop voice" : "Record voice reply"}
        aria-pressed={isListening}
        className={cn(
          "text-primary",
          isListening ? "bg-primary text-primary-foreground" : undefined,
          micDisabled ? "opacity-50" : undefined,
        )}
      >
        <Mic />
      </IconButton>
    </>
  );

  const sendControl = (
    <IconButton
      variant="solid"
      onClick={onSend}
      disabled={!canSend}
      aria-label="Send reply"
      data-slot="chatbox-send"
      className="disabled:bg-primary disabled:text-primary-foreground disabled:opacity-(--disabled-opacity)"
    >
      <ArrowUp />
    </IconButton>
  );

  const compactUpload = showUpload ? (
    uploadLabel ? (
      <button
        type="button"
        onClick={onUploadClick}
        disabled={disabled}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-1000 py-1 pl-2.5 pr-3 text-primary transition hover:bg-brand-900 disabled:pointer-events-none disabled:opacity-(--disabled-opacity)"
      >
        <Paperclip className="size-4 shrink-0" aria-hidden />
        <span className="text-overline font-medium leading-6 whitespace-nowrap">
          {uploadLabel}
        </span>
      </button>
    ) : (
      <IconButton
        variant="ghost"
        onClick={onUploadClick}
        disabled={disabled}
        aria-label="Upload"
        className="text-primary"
      >
        <Paperclip />
      </IconButton>
    )
  ) : null;

  const expandedUpload = showUpload ? (
    <button
      type="button"
      onClick={onUploadClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-w-16 shrink-0 items-center justify-center gap-0 rounded-full px-2 py-0.5 text-primary transition hover:bg-muted disabled:pointer-events-none disabled:opacity-(--disabled-opacity)",
        uploadLabel && "bg-brand-1000 hover:bg-brand-900",
      )}
    >
      <Paperclip className="size-4 shrink-0" aria-hidden />
      <span className="px-1 text-overline font-medium leading-6 whitespace-nowrap">
        {uploadLabel ?? "Upload"}
      </span>
    </button>
  ) : null;

  const textareaClass = cn(
    "w-full resize-none bg-transparent text-text-primary outline-none",
    "placeholder:text-text-secondary disabled:cursor-not-allowed disabled:opacity-(--disabled-opacity)",
    isCompact
      ? "block h-7 min-h-7 overflow-hidden whitespace-nowrap py-0 text-body-sm leading-7"
      : // 16px text at leading-[1.25] = the 20px line box the autosize hook
        // measures in. Height is set inline by that hook, so no flex-1 here —
        // a flex-grow would fight the measured value.
        "min-h-10 text-body-sm leading-[1.25] [scrollbar-width:thin]",
  );

  return (
    <div
      data-slot="chatbox"
      data-variant={variant}
      data-thread={hasLeading ? "true" : undefined}
      data-ai-glow={aiGlow ? "" : undefined}
      // Glow recedes while the user types (their words take the stage) and
      // while the composer is disabled (nothing to invite).
      data-ai-glow-quiet={
        aiGlow && (disabled || value.trim().length > 0) ? "" : undefined
      }
      className={cn(
        "relative w-full max-w-[800px]",
        isCompact ? "rounded-full" : "rounded-[20px]",
        hasLeading && "flex min-h-0 flex-col",
        className,
      )}
    >
      {aiGlow ? (
        <>
          <div aria-hidden data-slot="chatbox-ai-glow-halo" />
          <div aria-hidden data-slot="chatbox-ai-glow-rim" />
        </>
      ) : null}
      <div
        data-slot="chatbox-surface"
        className={cn(
          "overflow-clip outline-none ring-0 focus-within:outline-none focus-within:ring-0",
          isCompact ? "rounded-full" : "rounded-[20px]",
          hasLeading && "!p-0 flex min-h-0 flex-1 flex-col",
        )}
      >
        {hasLeading ? (
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">{leading}</div>
        ) : null}

        <div
          data-slot="chatbox-composer"
          className={cn(
            "flex w-full flex-col",
            hasLeading ? "shrink-0 gap-2.5 py-3 pr-3 pl-6" : isCompact ? null : "gap-2.5",
          )}
        >
          {fileChips}

          {isCompact ? (
            <div className="flex h-9 w-full items-center gap-2">
              <input
                ref={textareaRef as React.Ref<HTMLInputElement>}
                type="text"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder={isListening ? "Speak now…" : placeholder}
                disabled={disabled}
                className="h-7 min-w-0 flex-1 bg-transparent py-0 text-body-sm leading-7 text-text-primary outline-none placeholder:text-text-secondary disabled:cursor-not-allowed disabled:opacity-(--disabled-opacity)"
                onFocus={textareaProps?.onFocus as React.FocusEventHandler<HTMLInputElement> | undefined}
                onBlur={textareaProps?.onBlur as React.FocusEventHandler<HTMLInputElement> | undefined}
                onKeyDown={textareaProps?.onKeyDown as React.KeyboardEventHandler<HTMLInputElement> | undefined}
              />
              <div className="flex shrink-0 items-center gap-2">
                {compactUpload}
                {askControl}
                {micControl}
                {sendControl}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[88px] w-full flex-col justify-between">
              <textarea
                ref={mergeRefs(autosizeRef, textareaRef)}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder={isListening ? "Speak now…" : placeholder}
                disabled={disabled}
                rows={2}
                className={textareaClass}
                {...textareaProps}
              />
              <div className="flex flex-col gap-1">
                {status ? <div className="min-h-0">{status}</div> : null}
                <div className="flex h-9 w-full items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center">{expandedUpload}</div>
                  <div className="flex shrink-0 items-center gap-2">
                    {askControl}
                    {micControl}
                    {sendControl}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { Chatbox };
