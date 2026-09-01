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
  attentive: { energy: 0.4, warm: 0 },
  typing: { energy: 0.55, warm: 0 },
  thinking: { energy: 0.95, warm: 0 },
  responding: { energy: 0.45, warm: 0 },
  error: { energy: 0.26, warm: 1 },
};

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/* Liquid-glass orb, shaded per pixel:
 *   - silhouette: a circle whose radius is displaced by two bands of seamless
 *     simplex noise (sampled on the unit circle, so there is no seam) — the
 *     fluid, organic wobble
 *   - depth: a fake sphere normal (z from the circle equation) perturbed by
 *     flowing noise, lit by a slowly drifting key light — light moves across
 *     the surface like on glass
 *   - fresnel: color saturates toward the rim (deep brand cyan on our light
 *     canvas), the way thick glass edges do
 *   - inner currents: a domain-warped noise field lightens ribbons inside
 *     the orb — the "living energy"
 *   - halo: a soft exponential bloom just outside the silhouette (glow, not
 *     an outline)
 * No dots, no rings, no particles. */
const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uEnergy; // interaction energy 0..~1
uniform float uWarm;   // error palette mix 0..1
uniform float uKick;   // transient submit pulse 0..1

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
  // center sits ~0.87 canvas-half-heights BELOW the bottom edge, so only the
  // crown rises into view behind the chat bar and the body bleeds off the
  // bottom of the page. Blob radius = 1.0 in sphere units.
  vec2 ndc = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x, uRes.y);
  vec2 sp = (ndc + vec2(0.0, 1.87)) * 0.4742;
  float t = uTime;

  // A whisper of space-warp keeps the form organic between morphs; the
  // Figma asset is the resting frame, so this stays tiny.
  float morph = 0.012 + 0.010 * uEnergy + 0.008 * uKick;
  vec2 warpA = vec2(
    snoise(vec3(sp * 0.8, t * 0.14)),
    snoise(vec3(sp * 0.8 + 5.3, t * 0.11)));
  vec2 p = sp + warpA * morph;

  float d = length(p);
  vec2 dir = d > 0.0001 ? p / d : vec2(0.0, 1.0);
  float ang = atan(dir.y, dir.x);

  // Silhouette: essentially a clean circle (client feedback) with only a
  // whisper of the Figma blob's harmonics — nine faint scallops and a tiny
  // k=3/k=4 drift — so the sphere reads perfectly round at rest yet the
  // edge still breathes.
  // Interaction feedback lives in breath: the idle sway, a sustained swell
  // while the user is engaged (energy), and a bigger transient swell per
  // keystroke (kick, decaying). A uniform scale keeps the blob perfectly
  // round while it clearly grows in response.
  float breath = 1.0 + 0.012 * sin(t * 0.4) + uEnergy * 0.030 + uKick * 0.085;
  // Interaction response = LONG-wavelength traveling waves (k=3 / k=4) whose
  // depth follows energy and the typing kick — round and calm at rest, but
  // clearly rolling while the user interacts; the k=9 scallops stay fixed
  // and faint so the growth reads as one fluid body, not a spiky edge.
  float R = (1.0
    + 0.012 * cos(2.0 * ang)
    + 0.007 * cos(9.0 * ang - t * 0.35)
    + (0.007 + 0.009 * uEnergy + 0.024 * uKick) * cos(3.0 * ang - t * 1.1)
    + (0.005 + 0.006 * uEnergy + 0.014 * uKick) * cos(4.0 * ang - t * 0.22)) * breath;

  // The asset's 20px gaussian blur, as a symmetric feather on the edge.
  float inside = 1.0 - smoothstep(R - 0.05, R + 0.05, d);

  // Figma fill stack (node 2509:5338), warm-mixed on error:
  //   body   radial white -> #BCEEF5
  //   stroke white -> #B9EFF4 (56%), 19px, blurred (the light rim)
  //   faint  #20C3C9 -> #1C8C9D teal whisper (the 8%-opacity underlayer)
  // Slightly deeper than the SVG's #BCEEF5: after the shader's alpha (0.95)
  // and the container's CSS opacity (0.85 idle) it composites on white to
  // ~#B9EDF5 — the reference's full-strength edge tone.
  vec3 cBody = mix(vec3(0.66, 0.91, 0.945), vec3(0.955, 0.80, 0.62), uWarm);
  vec3 cCore = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.97, 0.94), uWarm);
  vec3 cRimL = mix(vec3(0.725, 0.937, 0.957), vec3(0.96, 0.80, 0.62), uWarm);
  vec3 cAqua = mix(vec3(0.125, 0.765, 0.788), vec3(0.80, 0.30, 0.22), uWarm);
  vec3 cTeal = mix(vec3(0.110, 0.549, 0.616), vec3(0.68, 0.16, 0.14), uWarm);

  // Body: the SVG's radial gradient — white core easing linearly to #BCEEF5.
  // The core drifts gently and swells on the submit kick.
  vec2 corePos = vec2(0.08 + 0.05 * sin(t * 0.13), 0.52 + 0.04 * cos(t * 0.1));
  float g = clamp(length(p - corePos) / (1.05 - 0.08 * uKick), 0.0, 1.0);
  vec3 col = mix(cCore, cBody, g);

  // Light rim stroke: white toward the top of the blob, #B9EFF4 below, in a
  // gaussian band straddling the silhouette (the blurred 19px stroke).
  float rim = exp(-pow((d - R) * 18.0, 2.0));
  float bottomness = clamp(1.0 - p.y, 0.0, 1.0);
  col = mix(col, mix(vec3(1.0), cRimL, bottomness * 0.6), rim * 0.55);
  // Teal whisper at the very edge — barely-there brand accent.
  col = mix(col, mix(cAqua, cTeal, bottomness * 0.4), rim * (0.08 + 0.05 * uEnergy));

  float alpha = (0.95 + 0.03 * uKick) * inside;
  alpha = min(alpha, 0.95);

  // Soft bloom just outside the silhouette — the blur's spill, not a ring.
  float halo = exp(-max(d - R, 0.0) * 8.0) * (1.0 - inside);
  float haloA = halo * (0.09 + 0.06 * uEnergy + 0.08 * uKick);

  vec3 rgb = col * alpha + cBody * haloA;

  // Frame fade: everything dissolves well before the canvas's own edges, so
  // the stage never reads as a rectangle — only the blob exists.
  float frame = (1.0 - smoothstep(2.15, 2.63, abs(ndc.x)))
    * (1.0 - smoothstep(0.65, 0.98, ndc.y));
  gl_FragColor = vec4(rgb * frame, (alpha + haloA) * frame);
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
 * The product's signature AI presence: a liquid-glass orb rising behind the
 * chat bar, rendered per-pixel in WebGL (see FRAG for the material). Motion
 * energy follows the interaction state (TARGETS); presence transitions
 * (opacity/lift) and the ambient halo live in `globals.css` under `.ai-orb`.
 * Entering "thinking" fires a one-shot kick — the orb visibly receives the
 * request, then settles into its processing rhythm. `pulse` is a counter the
 * host bumps on each input event: every bump adds a small decaying nudge to
 * the same kick, so the wave energy follows the FREQUENCY of interaction —
 * fast typing keeps the long waves rolling, a pause lets them settle.
 *
 * Reduced motion: one static frame, no loop. No WebGL: a static CSS orb
 * fallback (data-fallback) so the composition never breaks.
 */
export function AiOrb({
  state,
  visible = true,
  pulseRef,
  className,
}: {
  state: AiOrbState;
  /**
   * False hands the AI's presence back to the composer's rim glow: the orb
   * settles down into the bar and fades, rather than blinking out. Kept
   * mounted so the WebGL context (and its eased state) survives the handoff.
   */
  visible?: boolean;
  /**
   * A ref whose `.current` the host BUMPS on each user input event
   * (keystroke). The render loop reads it every frame and adds a decaying
   * kick — so the blob answers the frequency of interaction. Using a ref
   * (not a prop/state) means keystrokes never re-render React, which would
   * disrupt the controlled composer input. See the composer capture-handler
   * note in project memory.
   */
  pulseRef?: { current: number };
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<AiOrbState>(state);
  const kickRef = useRef(0);
  /** Where the kick is heading. Bumps land here and decay; `kickRef` chases
   * it, which turns each keystroke into a smooth rise-and-settle instead of
   * an instant jump. */
  const kickTargetRef = useRef(0);
  const lastPulseRef = useRef(0);

  useEffect(() => {
    // The kick is the "request received" beat: fired once on the transition
    // into thinking, decayed by the render loop.
    if (state === "thinking" && stateRef.current !== "thinking") {
      kickTargetRef.current = 1;
    }
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    root.removeAttribute("data-fallback"); // fresh attempt (Fast Refresh reuses DOM)

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
    // Wide, shallow stage: the crown band above the chat bar plus the color
    // field flowing under it to the page bottom. Must match the `.ai-orb`
    // CSS box's aspect ratio (1240 : 460) or the sphere distorts.
    canvas.width = 1240 * dpr;
    canvas.height = 460 * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uEnergy = gl.getUniformLocation(prog, "uEnergy");
    const uWarm = gl.getUniformLocation(prog, "uWarm");
    const uKick = gl.getUniformLocation(prog, "uKick");
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let lost = false;
    let t = 4.2; // arbitrary phase so the first frame isn't a noise zero-crossing
    let last = performance.now();
    // Eased motion values — start at the current state's targets so the
    // first frame is already correct.
    let energy = TARGETS[stateRef.current].energy;
    let warm = TARGETS[stateRef.current].warm;

    function draw(now: number) {
      if (!gl) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const target = TARGETS[stateRef.current];
      // Frame-rate independent easing: ~330ms to a new energy target. Slow
      // enough that starting to type reads as the surface waking, not
      // snapping; a touch slower again for the palette so error warms gently.
      energy += (target.energy - energy) * (1 - Math.exp(-dt * 3.0));
      warm += (target.warm - warm) * (1 - Math.exp(-dt * 2.6));
      // Per-keystroke nudge: read the host's pulse counter (bumped via a ref,
      // never React state) and add a decaying kick when it advances, so the
      // blob rolls while typing and settles on a pause.
      if (pulseRef && pulseRef.current !== lastPulseRef.current) {
        lastPulseRef.current = pulseRef.current;
        // Small bump, low ceiling: sustained typing should stay a whisper.
        kickTargetRef.current = Math.min(0.5, kickTargetRef.current + 0.14);
      }
      // The target fades; the visible kick eases toward it (~250ms attack), so
      // there is no per-keystroke step — just a gentle swell that settles.
      kickTargetRef.current *= Math.exp(-dt * 1.1);
      kickRef.current +=
        (kickTargetRef.current - kickRef.current) * (1 - Math.exp(-dt * 4.0));
      t += dt * (0.55 + energy * 0.85 + kickRef.current * 0.45);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uEnergy, energy);
      gl.uniform1f(uWarm, warm);
      gl.uniform1f(uKick, kickRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!reduceMotion && !lost) raf = requestAnimationFrame(draw);
    }

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
      canvas.removeEventListener("webglcontextlost", onLost);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-state={state}
      data-visible={visible ? "true" : "false"}
      className={cn("ai-orb", className)}
    >
      <div className="ai-orb-halo" />
      <div className="ai-orb-halo-warm" />
      <canvas ref={canvasRef} className="ai-orb-canvas" />
      <div className="ai-orb-fallback" />
    </div>
  );
}
