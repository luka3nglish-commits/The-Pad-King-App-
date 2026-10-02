/**
 * Custom pad maker — the ONE place the options live.
 *
 * Changing what customers can pick (a new size, a renamed edge, a face that's
 * still in testing) is an edit to this file only. Geometry for each id lives in
 * `geometry.ts`; copy, codes and ordering live here.
 *
 * Source: owner questionnaire 2026-10-01. Spitfire Green only for now.
 */

export const FOAM = {
  id: "spitfire",
  name: "Spitfire Green",
  line: "All Rounder",
  code: "SPF",
  /** UI accent (swatches, glows): sampled from Matt's photo, deepened per owner — rich, not fluro. */
  color: "#3fa02c",
  /**
   * The 3D foam itself, calibrated so the render matches Luka's photos of a real
   * Spitfire under the app's studio light (photo face ≈ #72E94F).
   */
  foam: "#6fe271",
  summary: "Balanced light to medium cut. Corrects, polishes and finishes in one pad.",
} as const;

/** Size = the velcro diameter, i.e. the face that sits on the backing plate (mm). */
export const SIZES = [40, 65, 75] as const;

/** Total pad height, velcro to face (mm). */
export const THICKNESSES = [12, 15, 16, 18, 20, 22] as const;

export const EDGES = [
  { id: "rounded", name: "Rounded", code: "RND", blurb: "Soft radius on the face edge. Smooth entry, forgiving on curves." },
  { id: "fulltilt", name: "Full Tilt", code: "FTL", blurb: "Deep bevel so the pad can run tilted into tight spots.", provisional: true },
  { id: "trapeze", name: "Trapeze", code: "TRP", blurb: "Straight taper from velcro to face. Stable, even pressure." },
  { id: "cone", name: "Cone", code: "CON", blurb: "Aggressive taper. A small contact patch for tight areas." },
  { id: "splay", name: "Splay", code: "SPL", blurb: "Flares out past the velcro, finished with a bevelled lip. Plate stays clear of the paint." },
] as const;

export const FACES = [
  { id: "raised", name: "Raised", code: "RSD", blurb: "Raised centre boss puts the pressure where you need it." },
  { id: "crosscut", name: "Raised Crosscut", code: "XCT", blurb: "A fine grid of small squares standing just proud of the face." },
  { id: "waffle", name: "Waffle", code: "WFL", blurb: "Shallow square channels hold polish and spread it evenly." },
  { id: "flower", name: "Flower Power", code: "FLW", blurb: "Raised flower-shaped face. In testing.", provisional: true },
] as const;

export type Size = (typeof SIZES)[number];
export type Thickness = (typeof THICKNESSES)[number];
export type EdgeId = (typeof EDGES)[number]["id"];
export type FaceId = (typeof FACES)[number]["id"];

export interface PadBuild {
  size: Size;
  thickness: Thickness;
  edge: EdgeId;
  face: FaceId;
}

export const DEFAULT_BUILD: PadBuild = { size: 75, thickness: 20, edge: "splay", face: "crosscut" };

export function edgeOf(id: EdgeId) {
  return EDGES.find((e) => e.id === id)!;
}

export function faceOf(id: FaceId) {
  return FACES.find((f) => f.id === id)!;
}

/** Human-readable build code, e.g. SPF-75-20-SPL-XCT. */
export function buildCode(b: PadBuild): string {
  return [FOAM.code, b.size, b.thickness, edgeOf(b.edge).code, faceOf(b.face).code].join("-");
}

/** Parse + validate a build coming from the network. Returns null if anything is off. */
export function parseBuild(input: unknown): PadBuild | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const size = SIZES.find((s) => s === o.size);
  const thickness = THICKNESSES.find((t) => t === o.thickness);
  const edge = EDGES.find((e) => e.id === o.edge)?.id;
  const face = FACES.find((f) => f.id === o.face)?.id;
  if (size === undefined || thickness === undefined || !edge || !face) return null;
  return { size, thickness, edge, face };
}

export const COMBINATIONS = SIZES.length * THICKNESSES.length * EDGES.length * FACES.length;
