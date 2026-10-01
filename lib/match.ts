/**
 * Pad Match data — which polishes go with which Pad King pad.
 *
 * Brands: 3D, Sonax, Koch Chemie and P&S only (owner direction).
 *
 * `matt: true` = Matt's own pick, from his published write-ups on thepadking.com.au.
 * Everything else is matched to the pad's job from the four brands and is marked
 * for Matt to confirm. Edit this file only.
 *
 * image:  real product photo path/URL once Matt supplies them; until then the card
 *         draws product art (components/match/ProductArt.tsx).
 * buyUrl: Matt's preferred stockist / affiliate link; until then a web search.
 */

export type Stage = "cut" | "one-step" | "finish";
export type Brand = "3D" | "Sonax" | "Koch Chemie" | "P&S";
export const BRANDS: Brand[] = ["3D", "Sonax", "Koch Chemie", "P&S"];

export interface Polish {
  id: string;
  brand: Brand;
  /** Name as people say it. */
  name: string;
  /** Lines printed on the product art (one entry per bottle for combos). */
  art: string[][];
  stages: Stage[];
  /** Manufacturer-published rating, shown as a spec line. */
  spec?: string;
  image?: string;
  buyUrl?: string;
}

export interface Pick {
  polish: string;
  /** Matt's words, where he gave any. */
  note?: string;
  /** Matt's own published pick (vs. matched to the pad's job). */
  matt?: boolean;
}

export interface PadEntry {
  id: string;
  name: string;
  short: string;
  role: string;
  blurb: string;
  /** Foam colour, deep and rich rather than fluro (owner direction). */
  color: string;
  /** Stock shape for the 3D render (mm). */
  shape: { thickness: number };
  tip?: string;
  /** Where Matt's picks for this pad come from. */
  sourceUrl: string;
  picks: Pick[];
}

const SRC_SPITFIRE = "https://thepadking.com.au/green-all-rounder-pads-extracting-optimal-performance/";
const SRC_AFTERBURNER = "https://thepadking.com.au/product/afterburner-levelling-cutting-pad/";
const SRC_ONE_STEP = "https://thepadking.com.au/how-to-do-a-one-step-paint-correction-the-essential-guide/";

export const POLISHES: Polish[] = [
  { id: "3d-aca-510-520", brand: "3D", name: "ACA 510 + 520", art: [["ACA", "510"], ["ACA", "520"]], stages: ["cut", "finish"] },
  { id: "3d-aca-510", brand: "3D", name: "ACA 510", art: [["ACA", "510"]], stages: ["cut"] },
  { id: "3d-aca-520", brand: "3D", name: "ACA 520", art: [["ACA", "520"]], stages: ["finish"] },
  { id: "3d-one", brand: "3D", name: "One", art: [["ONE"]], stages: ["one-step"] },
  { id: "sonax-perfect-finish", brand: "Sonax", name: "Perfect Finish", art: [["PERFECT", "FINISH"]], stages: ["one-step"], spec: "Cut 4 · Gloss 6" },
  { id: "sonax-ultimate-cut", brand: "Sonax", name: "Ultimate Cut", art: [["ULTIMATE", "CUT"]], stages: ["cut"], spec: "Cut 6 · Gloss 3" },
  { id: "koch-h9-f6", brand: "Koch Chemie", name: "H9 + F6", art: [["H9"], ["F6"]], stages: ["cut"] },
  { id: "koch-h9", brand: "Koch Chemie", name: "H9 Heavy Cut", art: [["H9"]], stages: ["cut"] },
  { id: "koch-m3", brand: "Koch Chemie", name: "M3 Micro Cut", art: [["M3"]], stages: ["finish"] },
  { id: "ps-rehab", brand: "P&S", name: "Rehab Correction Crème", art: [["REHAB"]], stages: ["one-step"] },
  { id: "ps-therapy", brand: "P&S", name: "Therapy Final Polish", art: [["THERAPY"]], stages: ["finish"] },
];

export const PADS: PadEntry[] = [
  {
    id: "afterburner",
    name: "Afterburner",
    short: "Afterburner",
    role: "Levelling & cutting",
    blurb: "Super-fast levelling on soft to medium-hard paints and heavy cutting on hard paints, with a better finish than denim or velvet pads.",
    color: "#5a9fcf",
    shape: { thickness: 10 },
    tip: "On a DA, run it on a 10 mm micro-hook sanding interface pad so it contours to the panel.",
    sourceUrl: SRC_AFTERBURNER,
    picks: [
      { polish: "sonax-ultimate-cut", matt: true },
      { polish: "3d-aca-510", matt: true },
      { polish: "koch-h9" },
      { polish: "3d-one", matt: true },
      { polish: "sonax-perfect-finish", matt: true },
      { polish: "ps-rehab" },
      { polish: "3d-aca-520", matt: true },
    ],
  },
  {
    id: "frostbite",
    name: "Frostbite",
    short: "Frostbite",
    role: "Cutting pad",
    blurb: "Medium to light cut. Best for a one-step on medium-hard and hard paints.",
    color: "#7cb6dd",
    shape: { thickness: 20 },
    sourceUrl: SRC_ONE_STEP,
    picks: [
      { polish: "3d-one", matt: true, note: "One-product correction cream" },
      { polish: "ps-rehab" },
      { polish: "sonax-perfect-finish" },
      { polish: "3d-aca-510-520" },
      { polish: "koch-h9-f6" },
    ],
  },
  {
    id: "lone-star",
    name: "Lone Star Red",
    short: "Lone Star",
    role: "Polishing pad",
    blurb: "Built for softer paints.",
    color: "#b01c26",
    shape: { thickness: 20 },
    sourceUrl: SRC_ONE_STEP,
    picks: [
      { polish: "3d-one", matt: true, note: "One-product correction cream" },
      { polish: "sonax-perfect-finish" },
      { polish: "ps-therapy" },
      { polish: "3d-aca-520" },
      { polish: "koch-m3" },
    ],
  },
  {
    id: "midas",
    name: "Midas Touch Gold",
    short: "Midas",
    role: "Finishing pad",
    blurb: "2.5× the defect removal of a conventional finishing pad, while keeping a high-gloss finish.",
    color: "#c78e1f",
    shape: { thickness: 20 },
    sourceUrl: SRC_ONE_STEP,
    picks: [
      { polish: "3d-one", matt: true, note: "One-product correction cream" },
      { polish: "sonax-perfect-finish" },
      { polish: "3d-aca-520" },
      { polish: "koch-m3" },
      { polish: "ps-therapy" },
    ],
  },
  {
    id: "spitfire",
    name: "Spitfire Green",
    short: "Spitfire",
    role: "All rounder",
    blurb: "Balanced light to medium cut. Corrects, polishes and finishes in one pad.",
    color: "#3fa02c",
    shape: { thickness: 20 },
    sourceUrl: SRC_SPITFIRE,
    picks: [
      { polish: "3d-aca-510-520", matt: true, note: "Magic combo" },
      { polish: "koch-h9-f6", matt: true, note: "75/25 blend" },
      { polish: "3d-one", matt: true },
      { polish: "sonax-perfect-finish", matt: true },
      { polish: "ps-rehab" },
      { polish: "koch-m3", matt: true, note: "For finishing" },
      { polish: "ps-therapy" },
    ],
  },
];

const STAGE_ORDER: Record<Stage, number> = { cut: 0, "one-step": 1, finish: 2 };
export const STAGE_LABEL: Record<Stage, string> = { cut: "Cut", "one-step": "One-step", finish: "Finish" };

export function polishOf(id: string): Polish {
  const p = POLISHES.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown polish: ${id}`);
  return p;
}

/** A pad's picks resolved and ordered cut → one-step → finish; Matt's picks first within a stage. */
export function picksFor(pad: PadEntry) {
  return pad.picks
    .map((p) => ({ ...p, polish: polishOf(p.polish) }))
    .sort((a, b) => rank(a.polish) - rank(b.polish) || Number(!!b.matt) - Number(!!a.matt));
}

function rank(p: Polish) {
  return p.stages.length ? STAGE_ORDER[p.stages[0]] : 9;
}

export function buyHref(p: Polish) {
  return p.buyUrl ?? `https://www.google.com/search?q=${encodeURIComponent(`${p.brand} ${p.name} buy Australia`)}`;
}
