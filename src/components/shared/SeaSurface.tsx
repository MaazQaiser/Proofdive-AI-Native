"use client";

import { useEffect, useRef } from "react";

import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * The sea at the foot of a light page — the marketing website's hero water,
 * seen from just above the surface, fading into the page at the horizon.
 *
 * The website draws it with its three.js scene (Proofdive-Website-,
 * src/gl/water.ts, the "live sea" at the crossing). Shipping three.js to the
 * auth pages for one strip of water would cost them far more than it is worth,
 * so this is that same water as ONE fragment shader on a bare WebGL canvas:
 * the website's four slow sines and its five trains of chop on deep-water
 * dispersion (ω = √(gk)), its lighting (a sun ahead and low, so a slope reads
 * as a moving band of light and dark), its crests and its glitter, and its
 * colours (#0E9AB5 troughs, #E7F5F8 tint, #E8EFF1 paper). Every pixel is a ray
 * from an eye a little above the water, meeting the plane; the horizon sits
 * just above the strip's top edge and the sea fades to nothing before it, so
 * there is no hard line — the page simply becomes water towards its foot.
 *
 * Light only, alpha to zero at the horizon, so it lies on any ground; a darker
 * palette in dark. Runs only while on screen and the tab is visible; with
 * reduced motion it draws one still frame; without WebGL it draws nothing.
 * Decorative (aria-hidden) and pointer-events: none.
 */

type Palette = { tint: number[]; primary: number[]; paper: number[]; strength: number };

const LIGHT: Palette = {
  tint: [0xe7 / 255, 0xf5 / 255, 0xf8 / 255],
  primary: [0x0e / 255, 0x9a / 255, 0xb5 / 255],
  paper: [0xe8 / 255, 0xef / 255, 0xf1 / 255],
  strength: 1,
};
/** Dark: the same sea at night — the tint is a lit deep teal, glints in the brand's light. */
const DARK: Palette = {
  tint: [0x1d / 255, 0x6d / 255, 0x83 / 255],
  primary: [0x07 / 255, 0x3e / 255, 0x4c / 255],
  paper: [0x7f / 255, 0xd4 / 255, 0xe6 / 255],
  strength: 0.85,
};

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;        // drawing-buffer size
uniform float uTime;
uniform vec3 uTint;
uniform vec3 uPrimary;
uniform vec3 uPaper;
uniform float uStrength;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

// The website's swell: four directional sines, gradient summed analytically.
vec2 swell(vec2 p, float t) {
  vec2 g = vec2(0.0);
  #define W(d, f, s, a) { vec2 dd = normalize(d); float ph = dot(p, dd) * f + t * s; g += a * f * cos(ph) * dd; }
  W(vec2(1.0, 0.35),   0.42, 0.42, 0.165)
  W(vec2(-0.6, 1.0),   0.75, 0.55, 0.085)
  W(vec2(0.2, -1.0),   1.45, 0.90, 0.035)
  W(vec2(-1.0, -0.4),  2.60, 1.30, 0.015)
  return g;
}

// The website's chop: five trains on deep-water dispersion; xy slope, z height,
// each fading where it would be under a few px on screen.
vec3 chop(vec2 p, float t, float dist) {
  vec3 g = vec3(0.0);
  #define C(d, k, a, o) { vec2 dd = normalize(d); float ph = dot(p, dd) * k - t * sqrt(1.6 * k) + o; float aa = a * (1.0 - smoothstep(110.0 / k, 200.0 / k, dist)); g.xy += aa * k * cos(ph) * dd; g.z += aa * sin(ph); }
  C(vec2(-0.9, 0.4),  2.4, 0.0400, 0.7)
  C(vec2(0.2, 1.0),   3.6, 0.0240, 0.0)
  C(vec2(0.8, 0.6),   5.2, 0.0150, 1.3)
  C(vec2(-0.6, 0.8),  7.5, 0.0085, 2.9)
  C(vec2(1.0, -0.3), 11.0, 0.0045, 4.4)
  return g;
}
const float CHOP_TOP = 0.092;
const float EYE = 1.6;    // the eye's height above the water
const float LIFT = 0.012; // the horizon sits this fraction of the frame above the strip's top

void main() {
  // A camera looking level out to sea, as if this strip were the foot of a
  // frame 1.6x as wide as it is tall: so the perspective is the same on a
  // phone and a wide desk, whatever the strip's own proportions.
  float vh = uRes.x / 1.6;
  float f = (vh * 0.5) / tan(radians(29.0));
  float below = (uRes.y - gl_FragCoord.y) + LIFT * vh;  // px under the horizon
  vec3 dir = normalize(vec3((gl_FragCoord.x - uRes.x * 0.5) / f, -below / f, -1.0));
  float t = EYE / max(-dir.y, 1e-4);
  vec3 cam = vec3(0.0, EYE, 0.0);
  vec3 pos = cam + dir * t;
  float dist = length(pos.xz);

  vec2 g = swell(pos.xz, uTime);
  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
  float detail = 1.0 - smoothstep(10.0, 34.0, dist);
  vec3 cw = chop(pos.xz, uTime, dist);
  vec2 cg = cw.xy * 1.4 * detail;
  vec3 Nd = normalize(N + vec3(-cg.x, 0.0, -cg.y));
  float crest = smoothstep(0.22, 0.75, cw.z / CHOP_TOP) * detail;
  vec3 V = -dir;

  // the website's live sea, lit from a sun ahead and low
  float fl = pow(1.0 - max(dot(Nd, V), 0.0), 5.0);
  float lit = dot(Nd, normalize(vec3(0.1, 0.55, -1.0)));
  float shade = smoothstep(0.24, 0.76, lit + 0.5 * fl);
  vec3 sea = mix(uPrimary * 0.7, uTint, 0.08 + 0.85 * shade);
  sea = mix(sea, uPaper, crest * 0.5);
  vec3 L = normalize(vec3(-0.35, 0.9, 0.25));
  float spec = pow(max(dot(reflect(-L, Nd), V), 0.0), 26.0);
  vec3 S = normalize(vec3(0.1, 0.4, -1.0));
  float lobe = pow(max(dot(reflect(-S, Nd), V), 0.0), 10.0);
  float spark = smoothstep(0.8, 0.97, noise(pos.xz * 14.0 + vec2(uTime * 1.1, -uTime * 0.8)));
  float glit = lobe * spark * detail * smoothstep(2.5, 5.0, dist);
  sea += uPaper * (glit * 0.7 + spec * 0.2);

  float a = clamp(0.62 + 0.2 * (1.0 - shade) + 0.2 * crest + 0.4 * glit, 0.0, 1.0);
  // the far sea dissolves into the page, so the strip has no top edge
  a *= 1.0 - smoothstep(16.0, 70.0, dist);
  a *= smoothstep(0.0, 0.18, 1.0 - gl_FragCoord.y / uRes.y + 0.02);
  a *= uStrength;
  gl_FragColor = vec4(sea * a, a);
}
`;

export function SeaSurface({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<Palette>(LIGHT);
  const redrawRef = useRef<() => void>(() => {});
  const { resolved } = useTheme();

  useEffect(() => {
    paletteRef.current = resolved === "dark" ? DARK : LIGHT;
    redrawRef.current();
  }, [resolved]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;

    function compile(type: number, src: string): WebGLShader | null {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return gl!.getShaderParameter(s, gl!.COMPILE_STATUS) ? s : null;
    }
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uTint = gl.getUniformLocation(prog, "uTint");
    const uPrimary = gl.getUniformLocation(prog, "uPrimary");
    const uPaper = gl.getUniformLocation(prog, "uPaper");
    const uStrength = gl.getUniformLocation(prog, "uStrength");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;
    let onScreen = true;

    function size(): void {
      // the strip is soft water, not type: 1.25x is as sharp as it needs to be
      const dpr = Math.min(1.25, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(canvas!.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas!.clientHeight * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
      gl!.viewport(0, 0, w, h);
    }

    function draw(time: number): void {
      const p = paletteRef.current;
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, time);
      gl!.uniform3fv(uTint, p.tint);
      gl!.uniform3fv(uPrimary, p.primary);
      gl!.uniform3fv(uPaper, p.paper);
      gl!.uniform1f(uStrength, p.strength);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    // a still sea for reduced motion, at a moment with some light on it
    const STILL_T = 12.5;
    function frame(now: number): void {
      raf = 0;
      if (!onScreen || document.hidden) return;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    }
    function wake(): void {
      if (reduced) {
        draw(STILL_T);
        return;
      }
      if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
    }
    redrawRef.current = () => {
      if (reduced || !raf) draw(reduced ? STILL_T : (performance.now() - start) / 1000);
    };

    size();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { size(); redrawRef.current(); }) : null;
    ro?.observe(canvas);
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => {
            onScreen = e.isIntersecting;
            if (onScreen) wake();
          })
        : null;
    io?.observe(canvas);
    const onVisibility = () => {
      if (!document.hidden) wake();
    };
    document.addEventListener("visibilitychange", onVisibility);
    wake();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      redrawRef.current = () => {};
      // No loseContext(): in development a remount reuses this canvas, and a
      // context lost on purpose cannot be had back.
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={cn("pointer-events-none block", className)} />;
}
