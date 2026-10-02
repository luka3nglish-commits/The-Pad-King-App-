/**
 * Parametric pad geometry — pure math, no three.js, so it's unit-testable.
 *
 * Coordinate system (millimetres):
 *   - pad axis = +y, face at y = 0, velcro (backing-plate side) at the top
 *   - grooves cut UP into the foam (+y), raised bosses stand proud of the face (-y)
 *
 * Every pad shape is reduced to fixed-length Float32Arrays (same vertex count for
 * every build), so switching options is a straight per-vertex lerp: a true morph,
 * not a swap.
 *
 * NOTE: profile dimensions are visual approximations for the design draft.
 * Real dimensions come from Matt later — edit the numbers here, nothing else.
 */
import type { EdgeId, FaceId, PadBuild } from "./options";

/** Faces the geometry can draw. "flat" is the stock pad face (not a maker option). */
export type FaceShape = FaceId | "flat";
/** Edges the geometry can draw. "stock" is the shop pads' own edge (not a maker option). */
export type EdgeShape = EdgeId | "stock";
/** Anything the renderer can draw: a maker build, or a stock pad. */
export type PadShape = Omit<PadBuild, "edge" | "face" | "size" | "thickness"> & {
  edge: EdgeShape;
  face: FaceShape;
  size: number;
  thickness: number;
};

export const VELCRO_T = 1.4;
export const INTERFACE_T = 1.6;

/** Lathe segments around the pad (shared by every ring so meshes stitch). */
export const SEG = 288;
/** Points along the side profile. */
export const PROFILE_N = 56;
/** Rings across the face, hole → rim. */
export const FACE_RINGS = 112;

export type Vec2 = [number, number];

export interface PadDims {
  D: number; // velcro diameter
  Rv: number; // velcro radius
  T: number; // total height
  Hf: number; // foam height
  rh: number; // centre hole radius
}

export function dimsOf(b: Pick<PadShape, "size" | "thickness">): PadDims {
  const D = b.size;
  const Rv = D / 2;
  const T = b.thickness;
  return { D, Rv, T, Hf: T - VELCRO_T - INTERFACE_T, rh: Math.max(2.2, 0.065 * D) };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/* ------------------------------------------------------------------ */
/* Edge profiles — polyline from the face edge (y = 0) up to the velcro */
/* ------------------------------------------------------------------ */

function arc(cx: number, cy: number, r: number, a0: number, a1: number, n = 12): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = lerp(a0, a1, i / n);
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

export function rawEdgeProfile(edge: EdgeShape, Rv: number, Hf: number): Vec2[] {
  switch (edge) {
    case "stock": {
      // The shop pads, measured off Luka's Spitfire photos and Matt's Gen II shots:
      // the face is a little wider than the velcro (Matt sizes pads velcro/face,
      // e.g. 75/90), with a soft rounded rim, then a straight side tapering back
      // in to the velcro.
      const F = Math.min(7.5, 0.2 * Rv); // face overhang past the velcro, per side
      const len = Math.hypot(Hf, F);
      const n: Vec2 = [Hf / len, F / len]; // outward normal of the side wall
      const c = 0.3 * Hf; // rim radius: a soft roll, not a lip
      // centre of the rim arc: c above the face and c inside the side wall
      const cx = Rv + (-c - n[1] * (c - Hf)) / n[0];
      return [...arc(cx, c, c, -Math.PI / 2, Math.atan2(n[1], n[0]), 16), [Rv, Hf]];
    }
    case "rounded": {
      const f = Math.min(0.42 * Hf, 0.3 * Rv);
      return [...arc(Rv - f, f, f, -Math.PI / 2, 0, 16), [Rv, Hf]];
    }
    case "fulltilt": {
      // PROVISIONAL — owner unsure of the real shape; modelled as a deep bevel.
      const c = Math.min(0.6 * Hf, 0.32 * Rv);
      const k = Math.min(1.2, c * 0.25);
      return [[Rv - c, 0], [Rv - k, c - k], ...arc(Rv - 2 * k, c, 2 * k, -Math.PI / 4, 0, 6), [Rv, Hf]];
    }
    case "trapeze": {
      const k = Math.min(0.32 * Hf, 0.16 * Rv);
      const f = Math.min(1.2, 0.1 * Hf);
      return [[Rv - k - f, 0], ...arc(Rv - k - f, f, f, -Math.PI / 2, -Math.PI / 2 + Math.atan2(Hf, k), 6), [Rv, Hf]];
    }
    case "cone": {
      const k = Math.min(0.85 * Hf, 0.4 * Rv);
      const f = Math.min(1.2, 0.1 * Hf);
      return [[Rv - k - f, 0], ...arc(Rv - k - f, f, f, -Math.PI / 2, -Math.PI / 2 + Math.atan2(Hf, k), 6), [Rv, Hf]];
    }
    case "splay": {
      // Splayed side flaring out past the velcro, with a bevelled lower lip.
      const F = Math.min(0.22 * Hf, 0.1 * Rv);
      const Rm = Rv + F;
      const ym = 0.3 * Hf;
      const L = Math.min(0.28 * Hf, 0.12 * Rv);
      const pts: Vec2[] = [[Rm - L, 0], [Rm - 0.15 * L, ym * 0.82]];
      pts.push(...arc(Rm - 0.6, ym, 0.6, -Math.PI / 4, Math.PI / 3, 6));
      // gently concave splay back in to the velcro
      for (let i = 1; i <= 10; i++) {
        const t = i / 10;
        const y = lerp(ym + 0.5, Hf, t);
        const r = lerp(Rm - 0.3, Rv, t) - Math.sin(Math.PI * t) * 0.18 * F;
        pts.push([r, y]);
      }
      return pts;
    }
  }
}

/** Resample a polyline to exactly n points evenly spaced by arc length. */
export function resample(poly: Vec2[], n: number): Vec2[] {
  const cum = [0];
  for (let i = 1; i < poly.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  }
  const total = cum[cum.length - 1];
  const out: Vec2[] = [];
  let j = 1;
  for (let i = 0; i < n; i++) {
    const s = (i / (n - 1)) * total;
    while (j < cum.length - 1 && cum[j] < s) j++;
    const seg = cum[j] - cum[j - 1] || 1;
    const t = clamp((s - cum[j - 1]) / seg, 0, 1);
    out.push([lerp(poly[j - 1][0], poly[j][0], t), lerp(poly[j - 1][1], poly[j][1], t)]);
  }
  return out;
}

export function edgeProfile(edge: EdgeShape, Rv: number, Hf: number, n = PROFILE_N): Vec2[] {
  return resample(rawEdgeProfile(edge, Rv, Hf), n);
}

/* ------------------------------------------------------------------ */
/* Face patterns — height field h(x, z) in mm                          */
/* ------------------------------------------------------------------ */

export interface FaceCtx {
  D: number;
  Hf: number;
  rf: number; // face radius (where the face meets the side profile)
  rh: number; // hole radius
}

function bossHeight(Hf: number) {
  return clamp(0.11 * Hf, 1.2, 2.2);
}

/**
 * Face geometry carries only the big, smooth features (bosses). Fine grooves
 * (Crosscut, Waffle) are rendered per-pixel in the foam shader from these
 * parameters, so their edges stay razor-sharp at any zoom.
 *
 * Returns [spacing, halfWidth, soft, depth] in mm. depth = 0 → no grooves.
 */
export type GroovePattern = [number, number, number, number];

export function faceGrooves(face: FaceShape, D: number, Hf: number): GroovePattern {
  switch (face) {
    case "crosscut": // raised crosscut (Matt): small squares, ~3.6 mm, standing ~1 mm proud of the face
      return [3.6, 0.38, 0.1, 1.1];
    case "waffle": {
      // wider, shallow channels
      const s = D / 6.5;
      return [s, s * 0.15, s * 0.06, Math.min(2.4, 0.18 * Hf)];
    }
    default:
      return [D / 8.5, 0.55, 0.12, 0];
  }
}

/** Shader-side groove depth at (x, z) — mirrored in foamMaterial.ts for tests and icons. */
export function grooveDepth(p: GroovePattern, x: number, z: number, rf: number, rh: number) {
  const [s, hw, soft, depth] = p;
  if (depth <= 0) return 0;
  const r = Math.hypot(x, z);
  const fade = (1 - smoothstep(rf - 1.8, rf - 0.5, r)) * smoothstep(rh + 0.5, rh + 1.8, r);
  const ch = (v: number) => {
    const d = Math.abs((((v + s / 2) % s) + s) % s - s / 2);
    return 1 - smoothstep(hw - soft, hw + soft, d);
  };
  return depth * Math.max(ch(x), ch(z)) * fade;
}

export function faceHeight(face: FaceShape, x: number, z: number, c: FaceCtx): number {
  switch (face) {
    case "raised": {
      const r = Math.hypot(x, z);
      const rb = 0.6 * c.rf;
      return -bossHeight(c.Hf) * (1 - smoothstep(rb - 0.5, rb + 0.5, r));
    }
    case "flower": {
      // PROVISIONAL — still in testing; six rounded petals.
      const r = Math.hypot(x, z);
      const th = Math.atan2(z, x);
      const rb = c.rf * 0.68 * (0.72 + 0.28 * Math.pow(Math.abs(Math.cos(3 * th)), 0.7));
      return -bossHeight(c.Hf) * (1 - smoothstep(rb - 0.45, rb + 0.45, r));
    }
    default:
      return 0; // flat, or grooves handled in the shader
  }
}

/** Height where the face meets the centre hole (constant around the hole). */
export function faceHeightAtHole(face: FaceShape, c: FaceCtx) {
  return face === "raised" || face === "flower" ? -bossHeight(c.Hf) : 0;
}

/* ------------------------------------------------------------------ */
/* Full pad state — fixed-length arrays, ready to lerp                 */
/* ------------------------------------------------------------------ */

export interface Part {
  pos: Float32Array;
  nrm?: Float32Array; // analytic normals where we have them; face normals are computed
}

export interface PadState {
  side: Part;
  face: Part;
  hole: Part;
  top: Part;
  iface: Part;
  velcro: Part;
  /** Lowest point (most negative y) — used to sit the pad on its stage. */
  minY: number;
  dims: PadDims;
  /** [face radius, hole radius] for the shader's groove fade. */
  faceR: [number, number];
  /** Shader groove pattern (see faceGrooves). */
  pat: GroovePattern;
}

const cosT = new Float32Array(SEG);
const sinT = new Float32Array(SEG);
for (let j = 0; j < SEG; j++) {
  const a = (j / SEG) * Math.PI * 2;
  cosT[j] = Math.cos(a);
  sinT[j] = Math.sin(a);
}

/** Revolve a 2D profile [(r, y)…] with analytic normals (2D normal per point). */
function revolve(profile: Vec2[], normals2: Vec2[]): Part {
  const n = profile.length;
  const pos = new Float32Array(n * SEG * 3);
  const nrm = new Float32Array(n * SEG * 3);
  for (let i = 0; i < n; i++) {
    const [r, y] = profile[i];
    const [nr, ny] = normals2[i];
    for (let j = 0; j < SEG; j++) {
      const k = (i * SEG + j) * 3;
      pos[k] = r * cosT[j];
      pos[k + 1] = y;
      pos[k + 2] = r * sinT[j];
      nrm[k] = nr * cosT[j];
      nrm[k + 1] = ny;
      nrm[k + 2] = nr * sinT[j];
    }
  }
  return { pos, nrm };
}

/** Outward 2D normals for a profile running bottom → top (outward = +r side). */
export function profileNormals(p: Vec2[]): Vec2[] {
  return p.map((_, i) => {
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(p.length - 1, i + 1)];
    const dr = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dr, dy) || 1;
    return [dy / l, -dr / l];
  });
}

/** An annular prism (velcro / interface layer): 4 strips with hard edges. */
function annulus(r0: number, r1: number, y0: number, y1: number): Part {
  const strips: { p: Vec2[]; n: Vec2 }[] = [
    { p: [[r0, y0], [r1, y0]], n: [0, -1] }, // bottom
    { p: [[r1, y0], [r1, y1]], n: [1, 0] }, // outer wall
    { p: [[r1, y1], [r0, y1]], n: [0, 1] }, // top
    { p: [[r0, y1], [r0, y0]], n: [-1, 0] }, // inner wall
  ];
  const parts = strips.map((s) => revolve(s.p, [s.n, s.n]));
  return concat(parts);
}

function concat(parts: Part[]): Part {
  const len = parts.reduce((a, p) => a + p.pos.length, 0);
  const pos = new Float32Array(len);
  const nrm = new Float32Array(len);
  let o = 0;
  for (const p of parts) {
    pos.set(p.pos, o);
    nrm.set(p.nrm!, o);
    o += p.pos.length;
  }
  return { pos, nrm };
}

export function padState(b: PadShape): PadState {
  const dims = dimsOf(b);
  const { D, Rv, Hf, T, rh } = dims;
  const profile = edgeProfile(b.edge, Rv, Hf);
  const rf = profile[0][0];
  const ctx: FaceCtx = { D, Hf, rf, rh };

  const side = revolve(profile, profileNormals(profile));

  // Face: polar grid, ring 0 at the hole, last ring at the face edge.
  const face = new Float32Array((FACE_RINGS + 1) * SEG * 3);
  let minY = 0;
  for (let i = 0; i <= FACE_RINGS; i++) {
    const r = lerp(rh, rf, i / FACE_RINGS);
    for (let j = 0; j < SEG; j++) {
      const x = r * cosT[j];
      const z = r * sinT[j];
      const y = faceHeight(b.face, x, z, ctx);
      const k = (i * SEG + j) * 3;
      face[k] = x;
      face[k + 1] = y;
      face[k + 2] = z;
      if (y < minY) minY = y;
    }
  }

  const hY = faceHeightAtHole(b.face, ctx);
  const hole = revolve([[rh, hY], [rh, Hf]], [[-1, 0], [-1, 0]]);
  const top = revolve([[Rv, Hf], [rh, Hf]], [[0, 1], [0, 1]]);
  const iface = annulus(rh, Rv, Hf, Hf + INTERFACE_T);
  const velcro = annulus(rh, Rv, Hf + INTERFACE_T, T);

  return {
    side,
    face: { pos: face },
    hole,
    top,
    iface,
    velcro,
    minY,
    dims,
    faceR: [rf, rh],
    pat: faceGrooves(b.face, D, Hf),
  };
}

/** Triangle indices for a strip-grid of `rows` rings × SEG (wrapping around). */
export function ringIndices(rows: number, flip = false): Uint32Array {
  const idx = new Uint32Array((rows - 1) * SEG * 6);
  let o = 0;
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < SEG; j++) {
      const a = i * SEG + j;
      const b = i * SEG + ((j + 1) % SEG);
      const c = (i + 1) * SEG + j;
      const d = (i + 1) * SEG + ((j + 1) % SEG);
      if (!flip) {
        idx.set([a, c, b, b, c, d], o);
      } else {
        idx.set([a, b, c, b, d, c], o);
      }
      o += 6;
    }
  }
  return idx;
}

/** Index buffer for an annulus part (4 separate 2-ring strips). */
export function annulusIndices(): Uint32Array {
  const one = ringIndices(2);
  const out = new Uint32Array(one.length * 4);
  for (let s = 0; s < 4; s++) {
    for (let i = 0; i < one.length; i++) out[s * one.length + i] = one[i] + s * 2 * SEG;
  }
  return out;
}

/** In-place lerp of every array in a state: out = a + (b - a) * t. */
export function lerpInto(out: Float32Array, a: Float32Array, b: Float32Array, t: number) {
  for (let i = 0; i < out.length; i++) out[i] = a[i] + (b[i] - a[i]) * t;
}
