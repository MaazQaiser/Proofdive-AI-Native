"use client";

import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * What the AI itself is doing. The composer supplies the user-side states
 * (attentive / typing / listening) from its own focus, text and mic; a host
 * only ever reports these four.
 */
export type AiPresenceActivity = "idle" | "thinking" | "responding" | "error";

/**
 * Every state the mark can express. Each one is a UX moment, not a
 * decoration:
 *   idle       — present, not addressed; the mark is simply the logo and
 *                the ring is a still catch-light
 *   attentive  — the field has focus; the light wakes, turns slowly, and
 *                takes one look in (a dive of light through the mark)
 *   typing     — the user's words are going in; each keystroke is a dive at
 *                the user's own tempo, and the ring recedes so the words own
 *                the stage
 *   listening  — voice dictation is on; the bloom breathes
 *   thinking   — the AI is working; the four tiles come apart, gather into
 *                one block and land back as the logo, over and over
 *   responding — the answer is appearing; light surfaces up through the mark
 *                once and the ring comes to rest facing the words
 *   error      — something needs reading; the four tiles gather into an
 *                information "i" and turn warm, and so does the light
 */
export type AiPresenceState =
  | AiPresenceActivity
  | "attentive"
  | "typing"
  | "listening";

export type AiPresenceHandle = {
  /** One unit of user input landed (a keystroke, a dictated word). */
  tick: () => void;
};

type TileId = "d" | "b" | "a" | "c";

/* The four tiles of public/brand/logo-mark.svg, verbatim (viewBox 0 0 95 95).
 * D left bar, B upper square, A lower square, C right bar. Kept as separate
 * paths — unlike the CSS-mask LogoMark — because each tile moves on its own. */
const TILE_PATHS: Record<TileId, string> = {
  d: "M0.000114441 91.5562V44.088C0.000114441 42.2181 1.51047 40.6933 3.39481 40.6933H27.1289V91.5562C27.1289 93.4262 25.6186 94.9509 23.7342 94.9509H3.39481C1.52485 94.9509 0.000114441 93.4406 0.000114441 91.5562Z",
  b: "M50.8651 40.6931H27.131V16.959C27.131 15.0891 28.6413 13.5643 30.5257 13.5643H50.8651C52.735 13.5643 54.2598 15.0747 54.2598 16.959V37.2984C54.2598 39.1684 52.7494 40.6931 50.8651 40.6931Z",
  a: "M44.089 54.2578H67.8231V77.9919C67.8231 79.8619 66.3128 81.3866 64.4284 81.3866H44.089C42.2191 81.3866 40.6943 79.8763 40.6943 77.9919V57.6525C40.6943 55.7825 42.2047 54.2578 44.089 54.2578Z",
  c: "M94.9511 3.3947V50.8629C94.9511 52.7328 93.4407 54.2576 91.5564 54.2576H67.8223V3.3947C67.8223 1.52474 69.3326 0 71.217 0H91.5564C93.4263 0 94.9511 1.51035 94.9511 3.3947Z",
};

const TILE_IDS: TileId[] = ["d", "b", "a", "c"];

/* Light travels through the mark in an order the geometry dictates. A DOWN
 * pass (a dive) lights tiles by top edge — C 0, B 13.56, D 40.69, A 54.26; an
 * UP pass (surfacing) by bottom edge — D 94.95, A 81.39, C 54.26, B 40.69.
 * Because the mark is 180°-symmetric the two orders are exact mirrors, and
 * the onset fractions (edge / 95) are the same list read from either end. */
const DOWN: TileId[] = ["c", "b", "d", "a"];
const UP: TileId[] = ["d", "a", "c", "b"];
const ONSETS = [0, 0.143, 0.428, 0.571];

/* Poses are per-tile translations in viewBox units (a tile's own size is one
 * grid unit, 27.13). Each is a real arrangement of all four tiles with
 * nothing hidden or overlapping:
 *   logo      — the mark
 *   open      — the tiles pushed to the four corners: taken apart to be
 *               examined
 *   gathered  — the tiles packed into one 2×3 block: pulled together into a
 *               single document
 *   info      — the four tiles reassemble into an information "i": the two
 *               squares stack exactly on each other to make the dot, the
 *               two bars stack exactly to make the stem. Nothing is hidden
 *               and nothing is added; the mark simply says something needs
 *               reading. Each pair's sharp corners land on opposite ends,
 *               so the glyph keeps the mark's own stepped corners.
 * Thinking cycles logo → open → gathered → logo, so the AI is seen taking
 * the problem apart, consolidating it and landing back on the brand. */
type Pose = Record<TileId, readonly [number, number]>;
const POSE: Record<"logo" | "open" | "gathered" | "info", Pose> = {
  logo: { d: [0, 0], b: [0, 0], a: [0, 0], c: [0, 0] },
  open: { d: [0, -40.69], b: [40.69, -13.56], a: [-40.69, 13.56], c: [0, 40.69] },
  gathered: {
    d: [20.37, -6.76],
    b: [-6.76, -6.76],
    a: [6.81, -47.46],
    c: [-20.32, 33.94],
  },
  /* Dot at y 5, stem from y 38.91 to 93.17, both in the centre column
     (x 33.91-61.04, so the glyph's axis is the mark's own centre); the gap
     between them is a quarter grid unit. */
  info: {
    d: [33.91, -1.78],
    b: [6.78, -8.56],
    a: [-6.78, -49.26],
    c: [-33.91, 38.91],
  },
};
type PoseId = keyof typeof POSE;

/* One thinking cycle: dwell as the logo, move, hold, move, hold, land. Moves
 * are 17% (442ms) and holds 12% (312ms) of the 2600ms period; the logo gets
 * the longest dwell (25%, 650ms) so the brand is what the eye rests on. */
const THINK_MS = 2600;
const THINK_SEQUENCE: ReadonlyArray<{ pose: PoseId; offset: number }> = [
  { pose: "logo", offset: 0 },
  { pose: "logo", offset: 0.15 },
  { pose: "open", offset: 0.32 },
  { pose: "open", offset: 0.44 },
  { pose: "gathered", offset: 0.61 },
  { pose: "gathered", offset: 0.73 },
  { pose: "logo", offset: 0.9 },
  { pose: "logo", offset: 1 },
];
const MOVE_EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
/** How long a CSS pose transition takes (must match `.ai-presence-tile`). */
const POSE_MS = 440;

/* The ring is one continuous angle. It is never restarted: states either
 * spin it (an infinite rotation whose speed is ramped), land it forward on a
 * meaningful angle, or freeze it where it is. The conic's bright arc peaks
 * 42° from the top, so rotating the layer by 258° parks that peak at
 * 10 o'clock — a still catch-light, as in the client's reference — and 48°
 * puts it at 3 o'clock, facing the words being written. */
const ROTOR_BASE_MS = 3600;
const PARK_DEG = 258;
const FACE_TEXT_DEG = 48;
/** Spin rate against the 3.6s base turn, per spinning state. */
const SPIN_RATE: Partial<Record<AiPresenceState, number>> = {
  attentive: 0.225, // 16s
  typing: 0.15, // 24s — the AI recedes while the words take the stage
  listening: 0.225, // 16s
  thinking: 0.409, // 8.8s
};
const RAMP_MS = 600;

/* Light passes. `window` spreads the four onsets; each tile then rises,
 * holds and falls. Period ≥ last onset + envelope. */
type PassSpec = {
  order: TileId[];
  window: number;
  rise: number;
  plateau: number;
  fall: number;
  peak: number;
  period: number;
};
/** A keystroke: a quick dive, 423ms end to end. */
const TICK_PASS: PassSpec = {
  order: DOWN,
  window: 320,
  rise: 80,
  plateau: 0,
  fall: 160,
  peak: 0.45,
  period: 423,
};
/** Focus arrives: one slower look in. */
const LOOK_PASS: PassSpec = {
  order: DOWN,
  window: 480,
  rise: 120,
  plateau: 0,
  fall: 240,
  peak: 0.42,
  period: 634,
};
/** The answer arrives: light surfaces up through the mark, once. */
const SURFACE_PASS: PassSpec = {
  order: UP,
  window: 640,
  rise: 220,
  plateau: 40,
  fall: 320,
  peak: 0.45,
  period: 1000,
};

function passKeyframes(spec: PassSpec, index: number): Keyframe[] {
  const onset = ONSETS[index] * spec.window;
  // Clamped: the last tile's envelope ends within a rounding error of the
  // period, and an offset a hair over 1 is a rejected keyframe list.
  const at = (ms: number) => Math.min(1, ms / spec.period);
  return [
    { opacity: 0, offset: 0 },
    { opacity: 0, offset: at(onset), easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
    { opacity: spec.peak, offset: at(onset + spec.rise), easing: "linear" },
    {
      opacity: spec.peak,
      offset: at(onset + spec.rise + spec.plateau),
      easing: "cubic-bezier(0.4, 0, 0.6, 1)",
    },
    { opacity: 0, offset: at(onset + spec.rise + spec.plateau + spec.fall) },
    { opacity: 0, offset: 1 },
  ];
}

function translateOf(pose: Pose, id: TileId) {
  const [x, y] = pose[id];
  return `translate(${x}px, ${y}px)`;
}

/** The rotor's current angle, read from its computed transform so it is
 * right whatever animation (spin, landing, none) is driving it. */
function rotorAngleOf(el: HTMLElement): number {
  const m = getComputedStyle(el).transform;
  if (!m || m === "none") return 0;
  const v = m.match(/matrix\(([^)]+)\)/)?.[1]?.split(",").map(Number);
  if (!v || v.length < 2 || Number.isNaN(v[0]) || Number.isNaN(v[1])) return 0;
  return ((Math.atan2(v[1], v[0]) * 180) / Math.PI + 360) % 360;
}

/**
 * The product's AI presence: a 36px disc inside the chat composer holding
 * the ProofDive mark, with a thin brand-light ring around it.
 *
 * The mark is the performer. Its four tiles are addressed individually, so
 * the logo can come apart, regroup and land back on itself while the AI
 * works, and light can pass through the tiles in the order the geometry
 * gives (down = a dive, up = surfacing). The ring is the room light: still
 * at rest, turning only while the AI is engaged, landing to face the words
 * while it answers, warm and stopped on an error, where the mark itself
 * reassembles into an information "i". It is a glow, not a drawn
 * ring: one conic painted twice, as a soft filament on the disc's edge and
 * a wide blurred halo outside it, so what the user sees is light in the air
 * around the mark.
 *
 * Rendering split, and why:
 *   - Levels (ring/bloom opacity, ink tint, surface) are CSS custom
 *     properties keyed on `data-state`, with CSS transitions — so any state
 *     change morphs, and at rest nothing runs at all.
 *   - Poses are inline transforms on the tile groups with a CSS transition,
 *     so a pose change from ANY starting point eases into place.
 *   - The ring's turn, the thinking cycle and the light passes are Web
 *     Animations, because they need what CSS keyframes cannot do: a rotation
 *     whose speed changes without a jump, a landing on a chosen angle from
 *     wherever the light is, a loop that can be frozen mid-flight and eased
 *     home, and a pulse fired from a ref with no React render.
 *   - No canvas, no WebGL, no continuous requestAnimationFrame: the only rAF
 *     is the 600ms speed ramp, and it ends.
 *
 * Reduced motion: the ring never turns and nothing loops; state is carried
 * by the static ring/bloom levels and ink tint alone. Decorative
 * (`aria-hidden`) — the screen's own status copy carries meaning.
 */
export const AiPresence = memo(
  forwardRef<
    AiPresenceHandle,
    {
      state: AiPresenceState;
      /** Where the ring's light was when a previous instance went away. The
       * composer renders a different tree for its compact and expanded
       * shells, so switching between them remounts this component mid-turn;
       * handing the angle across keeps the one light continuous instead of
       * teleporting it back to its resting position. */
      angleRef?: { current: number };
      className?: string;
    }
  >(function AiPresence({ state, angleRef, className }, ref) {
      const rotorRef = useRef<HTMLSpanElement | null>(null);
      const tileRefs = useRef<Partial<Record<TileId, SVGGElement>>>({});
      const lightRefs = useRef<Partial<Record<TileId, SVGPathElement>>>({});

      const stateRef = useRef<AiPresenceState>(state);
      const reducedRef = useRef(false);
      const rotorAnim = useRef<Animation | null>(null);
      const landingAnim = useRef<Animation | null>(null);
      const rampRaf = useRef(0);
      const poseRef = useRef<PoseId>("logo");
      /** When the tiles will have finished easing into `poseRef` — a pose is
       * a CSS transition, so it is still travelling after the pose is set. */
      const settleUntil = useRef(0);
      const tileLoops = useRef<Animation[]>([]);
      const tickAnims = useRef<Animation[]>([]);
      const pendingTick = useRef(false);
      const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

      /* --- ring ------------------------------------------------------------ */

      function createSpin(startDeg: number, rate: number): Animation | null {
        const rotor = rotorRef.current;
        if (!rotor) return null;
        const anim = rotor.animate(
          [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
          { duration: ROTOR_BASE_MS, iterations: Infinity, easing: "linear" },
        );
        anim.currentTime = (startDeg / 360) * ROTOR_BASE_MS;
        anim.playbackRate = rate;
        // A parked ring is genuinely paused, not an infinite animation
        // ticking at zero: at rest — which is most of this component's life,
        // on every screen — nothing should be running at all.
        if (rate === 0) anim.pause();
        return anim;
      }

      /** Stop whatever is driving the ring and return where it is. */
      function settleRotor(): number {
        cancelAnimationFrame(rampRaf.current);
        const rotor = rotorRef.current;
        const deg = rotor ? rotorAngleOf(rotor) : PARK_DEG;
        landingAnim.current?.cancel();
        landingAnim.current = null;
        rotorAnim.current?.cancel();
        rotorAnim.current = null;
        return deg;
      }

      /** Ramp the spin to `target` speed over RAMP_MS — a change of pace,
       * never a jump in position. */
      function rampRotor(target: number) {
        const anim = rotorAnim.current;
        if (!anim) return;
        cancelAnimationFrame(rampRaf.current);
        const from = anim.playbackRate;
        if (from === target && anim.playState !== "paused") return;
        if (anim.playState === "paused") anim.play();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / RAMP_MS);
          const eased = 1 - Math.pow(1 - p, 3);
          // The plain setter, not updatePlaybackRate(): the async version
          // leaves the rate pending for well over a second when the spin is
          // coming from a standstill (rate 0), so the ring sat still after
          // focus. The setter preserves currentTime exactly on the main
          // thread; with steps this small any compositor jitter is invisible.
          anim.playbackRate = from + (target - from) * eased;
          if (p < 1) rampRaf.current = requestAnimationFrame(step);
        };
        rampRaf.current = requestAnimationFrame(step);
      }

      /** Turn at `rate`, continuing from wherever the light is. */
      function spinRotor(rate: number) {
        if (reducedRef.current) return;
        if (landingAnim.current || !rotorAnim.current) {
          const deg = settleRotor();
          rotorAnim.current = createSpin(deg, 0);
        }
        rampRotor(rate);
      }

      /** Glide forward to `targetDeg` and rest there. */
      function landRotor(targetDeg: number) {
        if (reducedRef.current) return;
        const rotor = rotorRef.current;
        if (!rotor) return;
        const from = settleRotor();
        let delta = (targetDeg - from + 360) % 360;
        if (delta < 2) {
          rotorAnim.current = createSpin(targetDeg, 0);
          return;
        }
        // Always a visible glide, never a nudge: a short remaining arc goes
        // the long way round.
        if (delta < 30) delta += 360;
        const duration = Math.min(900, Math.max(300, (delta / 360) * 1400));
        const land = rotor.animate(
          [
            { transform: `rotate(${from}deg)` },
            { transform: `rotate(${from + delta}deg)` },
          ],
          { duration, easing: "cubic-bezier(0.2, 0, 0, 1)", fill: "forwards" },
        );
        landingAnim.current = land;
        land.onfinish = () => {
          if (landingAnim.current !== land) return;
          land.cancel();
          landingAnim.current = null;
          rotorAnim.current = createSpin(targetDeg, 0);
        };
      }

      /** Stop where it is. */
      function freezeRotor() {
        if (reducedRef.current) return;
        const deg = settleRotor();
        rotorAnim.current = createSpin(deg, 0);
      }

      /* --- tiles ----------------------------------------------------------- */

      function tiles(): Array<[TileId, SVGGElement]> {
        return TILE_IDS.flatMap((id) => {
          const el = tileRefs.current[id];
          return el ? [[id, el] as [TileId, SVGGElement]] : [];
        });
      }

      /** Ease every tile to a pose from wherever it is (CSS transition). */
      function moveTo(pose: PoseId) {
        for (const [id, el] of tiles()) {
          el.style.transform = translateOf(POSE[pose], id);
        }
        poseRef.current = pose;
      }

      /** Stop the thinking cycle without a snap: freeze each tile where it
       * is, then let the CSS transition carry it to the target pose. */
      function landTiles(pose: PoseId) {
        if (startTimer.current) {
          clearTimeout(startTimer.current);
          startTimer.current = null;
        }
        if (tileLoops.current.length) {
          for (const anim of tileLoops.current) {
            try {
              anim.commitStyles();
            } catch {
              /* not rendered — nothing to freeze */
            }
            anim.cancel();
          }
          tileLoops.current = [];
          // Flush style so the committed transform is the before-change value.
          const first = tiles()[0]?.[1];
          if (first) void getComputedStyle(first).transform;
        }
        if (poseRef.current !== pose || tileLoops.current.length) {
          settleUntil.current = performance.now() + POSE_MS;
        }
        moveTo(pose);
      }

      function startThinking() {
        if (reducedRef.current) return;
        const begin = () => {
          startTimer.current = null;
          tileLoops.current = tiles().map(([id, el]) =>
            el.animate(
              THINK_SEQUENCE.map(({ pose, offset }, i) => ({
                transform: translateOf(POSE[pose], id),
                offset,
                // A keyframe's easing shapes the segment after it; holds are
                // flat anyway, so every segment can take the move curve.
                easing: i < THINK_SEQUENCE.length - 1 ? MOVE_EASE : undefined,
              })),
              { duration: THINK_MS, iterations: Infinity },
            ),
          );
        };
        // The cycle starts from the logo, so the tiles have to BE there:
        // frame one of the loop is the seated mark, and starting it while
        // they are elsewhere — an error's "i", or a seat that is
        // still easing home from a cycle that was just cancelled — would
        // jump them the rest of the way.
        const remaining = settleUntil.current - performance.now();
        if (poseRef.current !== "logo") {
          moveTo("logo");
          startTimer.current = setTimeout(begin, POSE_MS);
        } else if (remaining > 0) {
          startTimer.current = setTimeout(begin, remaining);
        } else {
          begin();
        }
      }

      /* --- light ----------------------------------------------------------- */

      function runPass(spec: PassSpec): Animation[] {
        return spec.order.flatMap((id, i) => {
          const el = lightRefs.current[id];
          if (!el) return [];
          return [el.animate(passKeyframes(spec, i), { duration: spec.period })];
        });
      }

      function tick() {
        if (reducedRef.current) return;
        // Only the thinking cycle owns the tiles outright. While an answer
        // is still surfacing the user may already be typing their next one,
        // and that first keystroke should light the mark like any other.
        if (stateRef.current === "thinking") return;
        if (tickAnims.current.some((a) => a.playState === "running")) {
          // Never restart a pass mid-flight (that reads as flicker); replay
          // once when it ends, so fast typing becomes one continuous cascade.
          pendingTick.current = true;
          return;
        }
        const anims = runPass(TICK_PASS);
        tickAnims.current = anims;
        const last = anims[anims.length - 1];
        if (last) {
          last.onfinish = () => {
            tickAnims.current = [];
            if (pendingTick.current) {
              pendingTick.current = false;
              tick();
            }
          };
        }
      }

      useImperativeHandle(ref, () => ({ tick }));

      /* --- one place that puts the disc into a state ----------------------- */
      /** Ring, tiles and light for `next`. `arriving` is true when the state
       * is being ENTERED — on a real change, or on a mount that lands mid-
       * conversation because the host remounted the composer — and false
       * when it is only being restored (a motion preference changing back). */
      function enterState(next: AiPresenceState, arriving: boolean) {
        // Ring: spin, land or freeze — one continuous angle throughout.
        const rate = SPIN_RATE[next];
        if (rate) spinRotor(rate);
        else if (next === "responding") landRotor(FACE_TEXT_DEG);
        else if (next === "error") freezeRotor();
        else landRotor(PARK_DEG);

        // Tiles: thinking runs the cycle; error gathers the mark into an
        // information "i"; everything else is the logo.
        if (next === "thinking") {
          landTiles(poseRef.current);
          startThinking();
        } else if (next === "error") {
          // The tiles do not scatter: they regroup into the "i", the same
          // kind of move the thinking cycle makes, so a failure reads as
          // the mark saying something rather than breaking.
          landTiles("info");
        } else {
          landTiles("logo");
        }

        // Light: an answer arriving surfaces up through the mark, once.
        if (arriving && !reducedRef.current && next === "responding") {
          runPass(SURFACE_PASS);
        }
      }

      /* --- mount ----------------------------------------------------------- */
      useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        reducedRef.current = mq.matches;
        // Captured once: this node is rendered unconditionally, so it is the
        // same element for the whole life of the effect — including the
        // cleanup, where its angle is what gets handed to the next instance.
        const rotor = rotorRef.current;

        /* A motion preference can change mid-session, and the guards on the
         * helpers only cover what happens NEXT — so switching reduce on has
         * to stop what is already running, and switching it off has to give
         * the current state its motion back. */
        const onChange = () => {
          reducedRef.current = mq.matches;
          if (mq.matches) {
            cancelAnimationFrame(rampRaf.current);
            if (startTimer.current) {
              clearTimeout(startTimer.current);
              startTimer.current = null;
            }
            const deg = settleRotor();
            if (rotor) rotor.style.transform = `rotate(${deg}deg)`;
            landTiles(stateRef.current === "error" ? "info" : "logo");
            for (const a of tickAnims.current) a.cancel();
            tickAnims.current = [];
            return;
          }
          rotorAnim.current = createSpin(
            rotor ? rotorAngleOf(rotor) : PARK_DEG,
            0,
          );
          enterState(stateRef.current, false);
        };
        mq.addEventListener("change", onChange);

        const s = stateRef.current;
        // A pose is a still frame, so it applies under reduced motion too.
        if (s === "error") moveTo("info");
        if (!mq.matches) {
          // Start from wherever a previous instance left the light (the
          // composer remounts this component when its shell changes shape),
          // then enter the state as an arrival: a host that swaps the whole
          // composer per step would otherwise skip the moment entirely and
          // the disc would simply appear mid-answer.
          rotorAnim.current = createSpin(angleRef?.current ?? PARK_DEG, 0);
          enterState(s, true);
        }

        return () => {
          mq.removeEventListener("change", onChange);
          if (angleRef && rotor) angleRef.current = rotorAngleOf(rotor);
          cancelAnimationFrame(rampRaf.current);
          if (startTimer.current) clearTimeout(startTimer.current);
          landingAnim.current?.cancel();
          landingAnim.current = null;
          rotorAnim.current?.cancel();
          rotorAnim.current = null;
          for (const a of tileLoops.current) a.cancel();
          for (const a of tickAnims.current) a.cancel();
          tileLoops.current = [];
          tickAnims.current = [];
        };
        // Mount only: the state effect below owns every later change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      /* --- state changes: every quantity morphs, nothing snaps ------------- */
      useEffect(() => {
        const prev = stateRef.current;
        stateRef.current = state;
        if (prev === state) return;

        enterState(state, true);

        // Focus arriving takes one look in.
        if (
          !reducedRef.current &&
          state === "attentive" &&
          (prev === "idle" || prev === "error")
        ) {
          runPass(LOOK_PASS);
        }
        // The helpers above read only refs, so they are stable across
        // renders; listing them would re-run this on every render for nothing.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [state]);

      return (
        <span
          aria-hidden
          data-slot="ai-presence"
          data-state={state}
          className={cn("ai-presence", className)}
        >
          {/* The plate first, so the light above can spill over its edge.
              Then one rotating layer carrying both passes of the glow, so
              they never drift out of register. The inline angle is the
              resting position, which is all a reduced-motion viewer ever
              sees; Web Animations override it while the light moves. */}
          <span className="ai-presence-disc" />
          <span
            ref={rotorRef}
            className="ai-presence-rotor"
            style={{ transform: `rotate(${PARK_DEG}deg)` }}
          >
            <span className="ai-presence-glow" />
            <span className="ai-presence-arc" />
          </span>
          <span className="ai-presence-error-ring" />
          <svg className="ai-presence-mark" viewBox="0 0 95 95" fill="none">
            {TILE_IDS.map((id) => (
              <g
                key={id}
                ref={(el) => {
                  tileRefs.current[id] = el ?? undefined;
                }}
                className="ai-presence-tile"
                data-tile={id}
              >
                <path className="ai-presence-ink" d={TILE_PATHS[id]} />
                <path
                  ref={(el) => {
                    lightRefs.current[id] = el ?? undefined;
                  }}
                  className="ai-presence-light"
                  d={TILE_PATHS[id]}
                />
              </g>
            ))}
          </svg>
        </span>
      );
    },
  ),
);
