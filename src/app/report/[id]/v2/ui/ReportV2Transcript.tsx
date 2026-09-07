"use client";

import { AudioLines, Mic, UserRound, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { InterviewReport } from "@/lib/proofdiveTypes";
import { scoringBadgeClass } from "@/lib/scoringPalette";
import { cn } from "@/lib/utils";

import { fmtClock, fmtDuration } from "./reportV2Model";

type Props = { report: InterviewReport };

/**
 * The conversation, as it happened.
 *
 * No player. The old report drew a Play button that opened `window.alert`
 * and three chips (±10s, 1×, PiP) styled as transport controls that did
 * nothing — controls that look real and are not cost more trust than they
 * buy. Until playback exists, what the user actually has is the transcript,
 * so it gets the whole card: a proper reading measure, the speaker on every
 * turn, the clock in the margin, and the coach's flag exactly where the
 * answer lost points. The recording facts (audio, video, length) are stated
 * once in the header as facts, not as buttons.
 */
export function ReportV2Transcript({ report }: Props) {
  const { hasAudio, hasVideo, durationSeconds } = report.meta;

  return (
    <div className="rounded-[16px] border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <span className="text-overline font-medium uppercase tracking-wide text-text-secondary">
          Full transcript
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {hasAudio ? (
            <Badge>
              <AudioLines aria-hidden />
              Audio
            </Badge>
          ) : null}
          {hasVideo ? (
            <Badge>
              <Video aria-hidden />
              Video
            </Badge>
          ) : null}
          <Badge>{fmtDuration(durationSeconds)}</Badge>
        </div>
      </div>

      <ol className="divide-y divide-border px-6">
        {report.transcript.map((line, idx) => {
          const you = line.speaker === "Candidate";
          return (
            <li key={`${line.timeSeconds}-${idx}`} className="grid gap-x-4 gap-y-2 py-5 sm:grid-cols-[auto_1fr]">
              <div className="flex items-center gap-2 sm:w-36">
                <span
                  aria-hidden
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full",
                    you ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {you ? <UserRound className="size-3.5" /> : <Mic className="size-3.5" />}
                </span>
                <div className="min-w-0 leading-tight">
                  <div className="text-caption font-semibold text-text-primary">
                    {you ? "You" : "Interviewer"}
                  </div>
                  <div className="text-overline tabular-nums text-text-secondary">
                    {fmtClock(line.timeSeconds)}
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <p className="max-w-[68ch] text-body-sm leading-7 text-text-primary">{line.text}</p>
                {line.flag ? (
                  <Badge variant="outline" className={cn("mt-2", scoringBadgeClass("Not ready"))}>
                    {line.flag}
                  </Badge>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
