"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * What the AI is doing right now, expressed as the orb's motion. Each state
 * maps to a UX moment, not a decoration:
 *   idle       — present and ready (slow breathing, calm surface)
 *   attentive  — the input has focus; the AI is listening
 *   typing     — acknowledging the user's input without competing with it
 *   thinking   — a request is being processed (fast inner currents, deep swell)
 *   responding — an answer is streaming out (calm, rhythmic motion)
 *   error      — something needs attention (motion settles, palette warms)
 */
export type AiOrbState =
  | "idle"
  | "attentive"
  | "typing"
  | "thinking"
  | "responding"
  | "error";

/** Motion + palette targets per state. The render loop eases toward these
 * every frame (frame-rate independent), so state changes morph the orb
 * instead of swapping animations. `energy` drives silhouette swell, surface
 * turbulence, inner-current speed and glow; `warm` mixes the error palette. */
const TARGETS: Record<AiOrbState, { energy: number; warm: number }> = {
  idle: { energy: 0.2, warm: 0 },
  attentive: { energy: 0.44, warm: 0 },
  typing: { energy: 0.58, warm: 0 },
  thinking: { energy: 0.95, warm: 0 },
  responding: { energy: 0.45, warm: 0 },
  error: { energy: 0.26, warm: 1 },
};

/* Attentive and typing sit deliberately CLOSE together (0.44 / 0.58). The
 * visible answer to typing is meant to come from the per-keystroke kick,
 * which tracks the user's actual rhythm — not from crossing a threshold into
 * a different preset. A narrow gap, eased over ~385ms, means the state change
 * itself is imperceptible and only the input reads. */

/* Canvas space → sphere space, shared with the shader (see FRAG's `sp`):
 * the sphere's center sits SP_Y_OFFSET canvas-half-heights below the bottom
 * edge, and one sphere radius is 1/SP_SCALE of those half-heights. The bar
 * rect is converted with the same numbers so the resting glow lands exactly
 * on the composer's outline. */
const SP_SCALE = 0.4742;
const SP_Y_OFFSET = 1.87;

/** One full turn of the traveling light, in seconds. Matches the 8s cycle the
 * composer's CSS rim glow uses everywhere else in the product, so the AI's
 * ambient rhythm is the same object here as it is on every other screen. */
const SWEEP_PERIOD = 8;

/** The morph's spring. Critically damped (zeta slightly over 1) so the light
 * gathers and settles without a rubbery overshoot, and an interruption
 * mid-morph carries its velocity through instead of restarting. */
const MORPH_K = 34;
const MORPH_C = 2 * Math.sqrt(MORPH_K) * 1.04;

/** Bar geometry in sphere space: center, the rounded rect's INNER half-extent
 * (half-size minus corner radius), and that radius. Parameterizing by the
 * inner box is what lets a pill and a circle be the same expression — the
 * inner box collapses to a point and the radius becomes the sphere's. */
type BarGeometry = { cx: number; cy: number; bix: number; biy: number; rad: number };

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/* One AI presence, two ends of one continuous form.
 *
 * The resting state and the active state are NOT two visuals that swap. They
 * are a single signed-distance outline whose parameters are interpolated by
 * uMorph:
 *
 *   uMorph 0 — the outline IS the chat bar's pill, and only a thin lit band
 *              straddles it: the traveling rim glow.
 *   uMorph 1 — the pill's inner box has collapsed to a point and its corner
 *              radius has grown into the sphere's, while the lit band has
 *              thickened past the radius: a solid liquid-glass orb.
 *
 * Everything in between is real geometry, not a cross-fade — the corners
 * release, the top bows up out of the bar, the bottom drops away, and the
 * band fills inward into a volume. The traveling light never stops: the same
 * constant-rate sweep that lit the bar's edge keeps riding the surface as it
 * becomes a sphere, and it goes on driving the orb's core highlight. Run the
 * parameter backwards and the body thins back into a rim that settles onto
 * the bar.
 *
 * Material, once there is a body: a fake sphere normal lit by a drifting key
 * light (glass), color saturating toward the rim (fresnel), a domain-warped
 * noise field for inner currents, and a soft exponential bloom outside the
 * silhouette. No dots, no rings, no particles. */
const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;   // surface clock, scaled by energy
uniform float uSweep;  // traveling-light phase, CONSTANT rate (radians)
uniform float uEnergy; // interaction energy 0..~1
uniform float uWarm;   // error palette mix 0..1
uniform float uKick;   // transient submit / keystroke pulse 0..1
uniform float uMorph;  // 0 = rim on the chat bar, 1 = sphere
uniform vec4 uBar;     // bar center (xy) + inner half-extent (zw), sphere space
uniform float uBarR;   // bar corner radius, sphere space
uniform float uDark;   // 0 = light canvas, 1 = dark canvas (eased, not switched)

// --- 3D simplex noise (Ashima Arts / Stefan Gustavson, public domain) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  // Canvas space (y up, bottom edge at -1), then sphere space: the blob's
  // center sits ~1.87 canvas-half-heights BELOW the bottom edge, so only the
  // crown rises into view behind the chat bar and the body bleeds off the
  // bottom of the page. Blob radius = 1.0 in sphere units.
  vec2 ndc = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x, uRes.y);
  vec2 sp = (ndc + vec2(0.0, 1.87)) * 0.4742;
  float t = uTime;

  // Two sub-curves off the one morph parameter. The outline reshapes and
  // sinks slightly AHEAD of the volume filling in behind it — that lead is
  // what makes the change read as light condensing into a body rather than
  // as one uniform tween. Reversed, the body thins back into a rim first,
  // then the rim climbs back onto the bar.
  float sShape = smoothstep(0.0, 0.86, uMorph);
  float sFill = smoothstep(0.22, 1.0, uMorph);

  // How hard the AI is working right now, as ONE continuous scalar: the eased
  // state energy plus the decaying per-keystroke kick. Every expressive term
  // below hangs off this, and it is deliberately dominated by the KICK — so
  // what the user sees is their own typing rhythm coming back at them, not a
  // state machine stepping between presets. Nothing here is ever switched;
  // it only ever eases.
  float act = clamp(uEnergy * 0.55 + uKick * 0.75, 0.0, 1.0);

  // A whisper of space-warp keeps the form organic. Held near zero while the
  // outline is still the chat bar: the resting glow has to hug the bar's real
  // edge, so it cannot afford a wobble there.
  float warpAmt = (0.012 + 0.010 * uEnergy + 0.014 * uKick)
    * mix(0.14, 1.0, sShape);
  vec2 warpA = vec2(
    snoise(vec3(sp * 0.8, t * 0.14)),
    snoise(vec3(sp * 0.8 + 5.3, t * 0.11)));
  vec2 p = sp + warpA * warpAmt;

  // ---- the single morphing outline ---------------------------------------
  // Pill (bar center, wide inner box, small radius) → circle (sphere center
  // at the origin, inner box collapsed, radius 1). One rounded-box field,
  // interpolated parameters.
  // The body itself drifts while it works — a slow buoyant sway whose
  // amplitude follows activity. Translation only, so the sphere stays
  // perfectly round while it visibly lives; and because the key light below
  // only follows half of it, the surface gains parallax (read: depth) exactly
  // when the user is interacting.
  vec2 sway = vec2(0.030 * sin(t * 0.31), 0.018 * sin(t * 0.23 + 1.7))
    * (0.25 + 0.90 * act);
  vec2 cen = mix(uBar.xy, sway, sShape);
  vec2 bi = mix(uBar.zw, vec2(0.0), sShape);
  vec2 rel = p - cen;
  float ang = atan(rel.y, rel.x);

  // Interaction feedback lives in breath: the idle sway, a sustained swell
  // while the user is engaged (energy), and a bigger transient swell per
  // keystroke (kick, decaying). The harmonics are long-wavelength (k=3 / k=4
  // traveling, k=9 fixed and faint) so the sphere reads round yet alive.
  float breath = 1.0 + 0.012 * sin(t * 0.4) + uEnergy * 0.030 + uKick * 0.100;
  float harm = 1.0
    + 0.012 * cos(2.0 * ang)
    + 0.007 * cos(9.0 * ang - t * 0.35)
    + (0.007 + 0.009 * uEnergy + 0.034 * uKick) * cos(3.0 * ang - t * 1.1)
    + (0.005 + 0.006 * uEnergy + 0.020 * uKick) * cos(4.0 * ang - t * 0.22);
  float rad = mix(uBarR, breath * harm, sShape);

  vec2 q = abs(rel) - bi;
  float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rad;

  // ---- rim band → volume -------------------------------------------------
  // The lit region is the space between the outline (pushed grow outward,
  // so the resting band sits OUTSIDE the bar's opaque surface rather than
  // under it) and that same outline shrunk by thick. Grow the thickness
  // past the radius and the annulus closes into a solid disc — the rim
  // becomes the body through one expression, never a second layer.
  float thick = mix(0.055, 3.0, sFill);
  float grow = mix(0.030, 0.0, sFill);
  float feather = mix(0.024, 0.050, sFill);
  float sdo = sd - grow;
  float outer = smoothstep(feather, -feather, sdo);
  float inner = smoothstep(feather, -feather, sdo + thick);
  float shell = clamp(outer - inner, 0.0, 1.0);

  // ---- the traveling light -----------------------------------------------
  // Two soft arcs on a constant-rate sweep — the same "only a stretch of the
  // edge is lit at any moment" light pass the CSS rim glow does, expressed
  // angularly around whatever the outline currently is. Constant rate, by
  // design: states change its CONTRAST, never its speed, so nothing ever
  // reads as speeding up.
  float s1 = pow(max(0.0, cos(ang + uSweep)), 5.0);
  float s2 = pow(max(0.0, cos(ang + uSweep - 2.60)), 8.0) * 0.5;
  float sweep = clamp(s1 + s2, 0.0, 1.0);
  // Rim: two narrow arcs on an edge that is otherwise DARK, not dimly lit —
  // that near-zero floor is what makes it read as a light passing over the
  // bar rather than a pool sitting under it (the conic gradient this replaces
  // is transparent between its arcs, and the resting screen has to be the one
  // the client already signed off). Sphere: a barely-there graze, so the
  // body's own shading leads but the rhythm is visibly the same light.
  float lo = mix(0.05, 0.86 - 0.12 * act, sFill);
  float lightMul = lo + (1.0 - lo) * sweep;

  // Two palettes for one object, crossfaded by uDark.
  //
  // LIGHT — Figma fill stack (node 2509:5338): the orb is brand INK laid on
  // white, so it is pale and nearly opaque.
  //   body   radial white -> #BCEEF5
  //   stroke white -> #B9EFF4 (56%), 19px, blurred (the light rim)
  //   faint  #20C3C9 -> #1C8C9D teal whisper (the 8%-opacity underlayer)
  //
  // DARK — the same object becomes a light SOURCE, which inverts the logic
  // rather than the hex. The body deepens to a mid brand cyan so its edge can
  // sink into the page, the core brightens to a genuine luminous center, and
  // the rim/accent brighten because on a dark field the edge is where emitted
  // light is strongest. A pale-on-dark body (the naive inversion) would just
  // be a giant white dome.
  vec3 bodyL = vec3(0.66, 0.91, 0.945);
  // Held well below the obvious values: on white the orb's crown sits at
  // about 1.15:1 against the page (a wash you feel more than see). Matched
  // literally that would be invisible on dark, so the target here is instead
  // "reads as a soft presence" — roughly 3-4.5:1 at the brightest visible
  // band. Brighter than that and it stops being ambience and becomes a lamp.
  vec3 bodyD = vec3(0.085, 0.315, 0.395);
  vec3 coreL = vec3(1.0, 1.0, 1.0);
  vec3 coreD = vec3(0.42, 0.74, 0.82);
  vec3 rimLL = vec3(0.725, 0.937, 0.957);
  vec3 rimLD = vec3(0.360, 0.800, 0.895);
  vec3 aquaL = vec3(0.125, 0.765, 0.788);
  vec3 aquaD = vec3(0.245, 0.825, 0.905);
  vec3 tealL = vec3(0.110, 0.549, 0.616);
  vec3 tealD = vec3(0.130, 0.520, 0.605);

  vec3 cBody = mix(mix(bodyL, bodyD, uDark), vec3(0.955, 0.80, 0.62), uWarm);
  vec3 cCore = mix(mix(coreL, coreD, uDark), vec3(1.0, 0.97, 0.94), uWarm);
  vec3 cRimL = mix(mix(rimLL, rimLD, uDark), vec3(0.96, 0.80, 0.62), uWarm);
  vec3 cAqua = mix(mix(aquaL, aquaD, uDark), vec3(0.80, 0.30, 0.22), uWarm);
  vec3 cTeal = mix(mix(tealL, tealD, uDark), vec3(0.68, 0.16, 0.14), uWarm);

  // Working deepens the glass. The body pulls toward a more saturated brand
  // cyan as activity rises, so "responding" reads as more COLOR and not only
  // more motion. A partial mix, on purpose: at full tilt it is still the same
  // pale Figma glass, one shade richer — never a second palette.
  // On dark, "working" means BRIGHTER (more light emitted), not deeper —
  // the light-mode direction would push the body toward the page and read as
  // the orb dimming while the user types.
  vec3 cBodyRich = mix(
    mix(vec3(0.480, 0.845, 0.915), vec3(0.160, 0.500, 0.600), uDark),
    vec3(0.935, 0.71, 0.52), uWarm);
  cBody = mix(cBody, cBodyRich, act * 0.70);

  // Body: the SVG's radial gradient — white core easing to #BCEEF5. The core
  // is carried by the SAME sweep phase that lit the bar, so the bright spot
  // the user watched travel around the composer goes on travelling across the
  // sphere. That continuity is the whole point.
  vec2 corePos = vec2(
    0.08 + 0.05 * sin(t * 0.13) + 0.10 * cos(uSweep),
    0.52 + 0.04 * cos(t * 0.10) + 0.03 * sin(uSweep)) + sway * 0.5;
  // Working also tightens the white core, so more of the crown the user can
  // actually see falls in the tinted part of the gradient. (The core's own
  // center sits behind the chat bar; without this, deepening cBody alone
  // barely reaches the visible band.)
  float g = clamp(length(p - corePos) / (1.05 - 0.16 * act), 0.0, 1.0);
  vec3 body = mix(cCore, cBody, g);

  // ...and a brand-cyan veil crosses the whole body, core included, so the
  // shift is legible in the visible crown rather than only at the submerged
  // edge. Small factor, palette colors only — richer, never a second hue.
  vec3 cVeil = mix(mix(cAqua, cRimL, 0.35), vec3(0.90, 0.62, 0.45), uWarm);
  body = mix(body, cVeil, act * 0.18);

  // Inner currents: a domain-warped field lifts slow ribbons of light through
  // the glass, so the body has depth that MOVES instead of a flat gradient.
  // Three rules keep it premium: it only ever lightens (dark interior
  // mottling reads as fungus — earlier client feedback), it scales with g so
  // the white core stays clean, and it is gated on sFill, whose value comes
  // from a uniform — so the resting rim never pays for these noise samples.
  if (sFill > 0.01) {
    float w = snoise(vec3(p * 1.4 + 11.0, t * 0.19));
    float curr = snoise(vec3(p * 2.0 + w * 0.5, t * 0.25));
    float ribbon = max(curr, 0.0) * (0.050 + 0.160 * act) * sFill * g;
    body = mix(body, cCore, min(ribbon, 0.22));
  }

  // Light rim stroke: white toward the top of the blob, #B9EFF4 below, in a
  // gaussian band straddling the silhouette (the blurred 19px stroke).
  float rimBand = exp(-pow(sd * 18.0, 2.0));
  float bottomness = clamp(1.0 - p.y, 0.0, 1.0);
  body = mix(body, mix(vec3(1.0), cRimL, bottomness * 0.6), rimBand * 0.55);
  // Teal whisper at the very edge — barely-there brand accent.
  body = mix(body, mix(cAqua, cTeal, bottomness * 0.4),
    rimBand * (0.08 + 0.05 * uEnergy + 0.14 * act));

  // Rim palette: the composer glow's own brand cyans (#0E9AB5 / #56B8CB), so
  // the resting light is the exact color it is on every other screen. As the
  // band becomes a volume the color lightens into the glass body — thick
  // glass reads pale, a thin lit edge reads deep.
  vec3 cGlowA = mix(
    mix(vec3(0.055, 0.604, 0.710), vec3(0.355, 0.840, 0.920), uDark),
    vec3(0.86, 0.42, 0.30), uWarm);
  vec3 cGlowB = mix(
    mix(vec3(0.337, 0.722, 0.796), vec3(0.155, 0.590, 0.700), uDark),
    vec3(0.95, 0.68, 0.44), uWarm);
  vec3 glowCol = mix(cGlowB, cGlowA, sweep);

  vec3 col = mix(glowCol, body, sFill);

  // The sweep modulates the rim's ALPHA (a light pass has to actually go dark
  // between arcs) but not the sphere's, which would read as a translucency
  // wobble across the body.
  // Dark lifts the resting rim (a lit edge on a dark bar is the signal) and
  // eases the formed body back, so the crown's edge dissolves into the page
  // instead of ending on a hard rim.
  float restA = mix(0.50, 0.62, uDark);
  float fullA = mix(0.95, 0.72, uDark) + 0.03 * uKick;
  float alpha = shell
    * mix(restA, fullA, sFill)
    * mix(lightMul, 1.0, sFill);
  alpha = min(alpha, 0.98);

  // Soft bloom just outside the lit band — the glow's spill, not a ring. At
  // rest this is the composer's halo; once formed, the sphere's own bloom.
  // Steeper falloff while it is a rim: a thin edge light spills a little, a
  // submerged body spills a lot. Keeps the resting footprint the same size
  // the CSS halo had, so the idle screen is unchanged.
  float bloom = exp(-max(sdo, 0.0) * mix(18.0, 8.0, sFill)) * (1.0 - shell);
  // Light bleeds much further into darkness than into white, so the bloom
  // carries more of the presence on dark — that is what keeps the orb from
  // looking like a flat cutout pasted on the page.
  float bloomGain = mix(1.0, 1.65, uDark);
  float bloomA = bloom * bloomGain
    * mix(0.13 * lightMul,
          0.09 + 0.06 * uEnergy + 0.08 * uKick + 0.08 * act, sFill);

  vec3 rgb = col * alpha + mix(glowCol, cBody, sFill) * bloomA;

  // Frame fade: everything dissolves well before the canvas's own edges, so
  // the stage never reads as a rectangle — only the light exists.
  float frame = (1.0 - smoothstep(2.15, 2.63, abs(ndc.x)))
    * (1.0 - smoothstep(0.65, 0.98, ndc.y));
  gl_FragColor = vec4(rgb * frame, (alpha + bloomA) * frame);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * The product's signature AI presence, rendered per-pixel in WebGL: at rest a
 * traveling light riding the chat bar's edge, and — the moment the user
 * engages the chat — that same light condensing into a liquid-glass sphere
 * rising out of the bar. One canvas, one shader, one morph parameter, so the
 * two states are provably the same entity rather than two visuals crossing
 * over (see FRAG). `engaged` drives the morph; `state` drives motion energy
 * and palette (TARGETS); entering "thinking" fires a one-shot kick, and
 * `pulseRef` bumps add decaying nudges so wave energy follows the FREQUENCY
 * of typing.
 *
 * The resting glow has to land exactly on the composer's outline, so the orb
 * measures that element itself (`anchorSelector`, searched inside the orb's
 * offset parent) and feeds its rect to the shader. Nothing about the sphere's
 * presence is expressed as a CSS transform on this element, because a
 * transform would slide the measured geometry out from under the glow.
 *
 * Theme: the shader carries both a light and a dark palette and crossfades
 * between them (uDark) when the `dark` class changes on <html> — on dark the
 * orb stops being brand ink on white and becomes an actual light source, so
 * the body deepens, the core brightens and the bloom does more of the work.
 *
 * Reduced motion: no traveling light and no surface drift; the morph and the
 * palette snap. No WebGL: a static CSS orb fallback (data-fallback) so
 * nothing breaks.
 */
export function AiOrb({
  state,
  engaged = true,
  pulseRef,
  anchorSelector = '[data-slot="chatbox"]',
  className,
}: {
  state: AiOrbState;
  /**
   * True once the user is engaged with the chat (focus, or text still in it),
   * or whenever the AI itself owns the moment (parsing, failure). Drives the
   * rim → sphere morph, and reverses it just as smoothly on the way out.
   */
  engaged?: boolean;
  /**
   * A ref whose `.current` the host BUMPS on each user input event
   * (keystroke). The render loop reads it every frame and adds a decaying
   * kick — so the blob answers the frequency of interaction. Using a ref
   * (not a prop/state) means keystrokes never re-render React, which would
   * disrupt the controlled composer input. See the composer capture-handler
   * note in project memory.
   */
  pulseRef?: { current: number };
  /** The element the resting glow traces — the chat bar, by default. */
  anchorSelector?: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<AiOrbState>(state);
  const engagedRef = useRef(engaged);
  const barRef = useRef<BarGeometry | null>(null);
  const kickRef = useRef(0);
  /** Where the kick is heading. Bumps land here and decay; `kickRef` chases
   * it, which turns each keystroke into a smooth rise-and-settle instead of
   * an instant jump. */
  const kickTargetRef = useRef(0);
  const lastPulseRef = useRef(0);
  /** Set by the engaged effect so a reduced-motion viewer — whose loop is
   * otherwise parked — still repaints when the morph target changes. */
  const wakeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // The kick is the "request received" beat: fired once on the transition
    // into thinking, decayed by the render loop.
    if (state === "thinking" && stateRef.current !== "thinking") {
      kickTargetRef.current = 1;
    }
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    engagedRef.current = engaged;
    wakeRef.current?.();
  }, [engaged]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    root.removeAttribute("data-fallback"); // fresh attempt (Fast Refresh reuses DOM)

    /* Convert the anchor's rect into sphere space. Measured against the orb's
     * OWN box, so the shorter-laptop scale-down needs no second set of
     * numbers: whatever the CSS box's height is, the canvas maps it to
     * ndc.y -1..1, and one ndc unit is half that height in CSS pixels. */
    const measure = () => {
      const host = (root.offsetParent ?? root.parentElement) as HTMLElement | null;
      const bar = host?.querySelector(anchorSelector) as HTMLElement | null;
      const rr = root.getBoundingClientRect();
      if (!bar || rr.height < 1) {
        barRef.current = null;
        return;
      }
      const br = bar.getBoundingClientRect();
      if (br.height < 1) {
        barRef.current = null;
        return;
      }
      const unit = rr.height / 2;
      const ndcCx = br.x + br.width / 2 - (rr.x + rr.width / 2);
      const ndcCy = rr.y + rr.height / 2 - (br.y + br.height / 2);
      const hx = br.width / 2 / unit;
      const hy = br.height / 2 / unit;
      // `rounded-full` reports a huge radius; a pill's is simply half its
      // height, and no radius can exceed that.
      const cssRadius = parseFloat(getComputedStyle(bar).borderRadius) || 0;
      const radius = Math.min(cssRadius || br.height / 2, br.height / 2) / unit;
      barRef.current = {
        cx: (ndcCx / unit) * SP_SCALE,
        cy: (ndcCy / unit + SP_Y_OFFSET) * SP_SCALE,
        bix: Math.max(0, hx - radius) * SP_SCALE,
        biy: Math.max(0, hy - radius) * SP_SCALE,
        rad: radius * SP_SCALE,
      };
    };

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    }) as WebGLRenderingContext | null;

    if (!gl) {
      root.setAttribute("data-fallback", "true");
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      root.setAttribute("data-fallback", "true");
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      root.setAttribute("data-fallback", "true");
      return;
    }
    gl.useProgram(prog);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Wide, shallow stage: the chat bar, the crown band above it, and the
    // color field flowing under it to the page bottom. Must match the
    // `.ai-orb` CSS box's aspect ratio (1240 : 460) or the sphere distorts.
    canvas.width = 1240 * dpr;
    canvas.height = 460 * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uSweep = gl.getUniformLocation(prog, "uSweep");
    const uEnergy = gl.getUniformLocation(prog, "uEnergy");
    const uWarm = gl.getUniformLocation(prog, "uWarm");
    const uKick = gl.getUniformLocation(prog, "uKick");
    const uMorph = gl.getUniformLocation(prog, "uMorph");
    const uBar = gl.getUniformLocation(prog, "uBar");
    const uBarR = gl.getUniformLocation(prog, "uBarR");
    const uDark = gl.getUniformLocation(prog, "uDark");
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* The canvas cannot read CSS tokens, so the orb watches the theme class
     * itself. Eased rather than switched: flipping the palette in one frame
     * would be the one hard cut in a screen whose whole point is that the AI
     * never snaps between states. */
    const isDark = () => document.documentElement.classList.contains("dark");
    let darkTarget = isDark() ? 1 : 0;
    const themeObserver = new MutationObserver(() => {
      darkTarget = isDark() ? 1 : 0;
      wakeRef.current?.();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    const host = (root.offsetParent ?? root.parentElement) as HTMLElement | null;
    if (host) ro.observe(host);
    const bar = host?.querySelector(anchorSelector);
    if (bar) ro.observe(bar);
    window.addEventListener("resize", measure);

    let raf = 0;
    let lost = false;
    let t = 4.2; // arbitrary phase so the first frame isn't a noise zero-crossing
    let sweep = 0;
    let last = performance.now();
    // Eased motion values — start at the current state's targets so the
    // first frame is already correct (no entry animation on mount).
    let energy = TARGETS[stateRef.current].energy;
    let warm = TARGETS[stateRef.current].warm;
    let morph = engagedRef.current ? 1 : 0;
    let morphVel = 0;
    let dark = darkTarget;

    function draw(now: number) {
      if (!gl) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const target = TARGETS[stateRef.current];
      // Frame-rate independent easing: ~385ms to a new energy target. Slow
      // enough that starting to type reads as the surface waking, not
      // snapping; a touch slower again for the palette so error warms gently.
      energy += (target.energy - energy) * (1 - Math.exp(-dt * 2.6));
      warm += (target.warm - warm) * (1 - Math.exp(-dt * 2.6));
      // Per-keystroke nudge: read the host's pulse counter (bumped via a ref,
      // never React state) and add a decaying kick when it advances, so the
      // blob rolls while typing and settles on a pause.
      if (pulseRef && pulseRef.current !== lastPulseRef.current) {
        lastPulseRef.current = pulseRef.current;
        // Each keystroke is a real beat, and sustained typing accumulates
        // into a clearly alive swell — but under a hard ceiling, so fast
        // typing can never run away into something flashy.
        kickTargetRef.current = Math.min(0.72, kickTargetRef.current + 0.2);
      }
      // The target fades; the visible kick eases toward it (~295ms attack), so
      // no single keystroke can produce a step — the swell rises through the
      // beats and settles on a pause. Slower than the target's own decay, so
      // the surface always lags the input slightly, the way something with
      // mass would.
      kickTargetRef.current *= Math.exp(-dt * 1.1);
      kickRef.current +=
        (kickTargetRef.current - kickRef.current) * (1 - Math.exp(-dt * 3.4));

      // With no anchor to trace there is no rim to be — show the sphere and
      // let the shader's own center/radius stand in for the bar's.
      const geo = barRef.current;
      const morphTarget = geo ? (engagedRef.current ? 1 : 0) : 1;

      // ~480ms palette crossfade on a theme switch — long enough to read as
      // the surface changing material, short enough not to feel laggy.
      if (reduceMotion) {
        dark = darkTarget;
      } else {
        dark += (darkTarget - dark) * (1 - Math.exp(-dt * 6.0));
        if (Math.abs(darkTarget - dark) < 0.002) dark = darkTarget;
      }

      if (reduceMotion) {
        morph = morphTarget;
        morphVel = 0;
      } else {
        morphVel += ((morphTarget - morph) * MORPH_K - morphVel * MORPH_C) * dt;
        morph += morphVel * dt;
        if (morph <= 0) {
          morph = 0;
          if (morphVel < 0) morphVel = 0;
        } else if (morph >= 1) {
          morph = 1;
          if (morphVel > 0) morphVel = 0;
        }
        // Activity buys a little speed but mostly AMPLITUDE (see the shader):
      // a surface that races reads as agitated, one that swells reads as
      // alive.
      t += dt * (0.55 + energy * 0.85 + kickRef.current * 0.4);
        sweep = (sweep + (dt * 2 * Math.PI) / SWEEP_PERIOD) % (Math.PI * 2);
      }

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uSweep, sweep);
      gl.uniform1f(uEnergy, energy);
      gl.uniform1f(uWarm, warm);
      gl.uniform1f(uKick, kickRef.current);
      gl.uniform1f(uMorph, morph);
      gl.uniform4f(uBar, geo?.cx ?? 0, geo?.cy ?? 0, geo?.bix ?? 0, geo?.biy ?? 0);
      gl.uniform1f(uBarR, geo?.rad ?? 1);
      gl.uniform1f(uDark, dark);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (lost) return;
      if (reduceMotion) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(draw);
    }

    // Reduced motion parks the loop after each paint; this restarts it for a
    // single frame when the morph target flips.
    wakeRef.current = () => {
      if (!reduceMotion || lost || raf) return;
      raf = requestAnimationFrame(draw);
    };
    // The theme observer above fires before this assignment on the very first
    // run only, which is harmless: `dark` is seeded from darkTarget anyway.


    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      root.setAttribute("data-fallback", "true");
    };
    canvas.addEventListener("webglcontextlost", onLost);

    draw(performance.now());

    // No loseContext() here: StrictMode re-runs this effect on the same
    // canvas, and a force-lost context can never be re-acquired — the GC
    // frees it with the canvas element instead.
    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      themeObserver.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", measure);
      canvas.removeEventListener("webglcontextlost", onLost);
    };
  }, [anchorSelector]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-state={state}
      data-engaged={engaged ? "true" : "false"}
      className={cn("ai-orb", className)}
    >
      <div className="ai-orb-halo" />
      <div className="ai-orb-halo-warm" />
      <canvas ref={canvasRef} className="ai-orb-canvas" />
      <div className="ai-orb-fallback" />
    </div>
  );
}
