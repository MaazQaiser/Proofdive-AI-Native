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
          className="rounded-lg border border-[var(--app-hairline)] bg-[var(--glass-from)] px-4 py-4 text-left transition hover:border-[var(--app-hairline-strong)] hover:bg-[var(--hover-veil-strong)] active:bg-card"
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

