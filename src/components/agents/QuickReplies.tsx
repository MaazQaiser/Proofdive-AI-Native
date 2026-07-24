"use client";

export type QuickReplyOption = { id: string; label: string; value: string; hint?: string };

export function QuickReplies({
  options,
  onPick,
}: {
  options: QuickReplyOption[];
  onPick: (value: string) => void;
}) {
  if (!options.length) return null;

  return (
    <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onPick(opt.value)}
          className="rounded-[16px] border border-[var(--app-hairline)] bg-white/60 px-4 py-4 text-left transition hover:border-[var(--app-hairline-strong)] hover:bg-white/70 active:bg-white/80"
        >
          <div className="text-caption">{opt.label}</div>
          {opt.hint ? (
            <div className="mt-1 text-overline text-[var(--app-muted)]">{opt.hint}</div>
          ) : null}
        </button>
      ))}
    </div>
  );
}

