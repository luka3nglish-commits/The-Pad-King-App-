/**
 * Pad Match data — which polishes go with which Pad King pad.
 * The pads themselves live in lib/pads.ts (shared with the Range tab).
 *
 * Brands: 3D, Sonax, Koch Chemie and P&S only (owner direction).
 *
 * `matt: true` = Matt's own pick, from his published write-ups on thepadking.com.au.
 * Everything else is matched to the pad's job from the four brands and is marked
 * for Matt to confirm. Edit this file only.
 *
 * photos: real bottle photos, one per bottle in the same order as `art`, as
 *         transparent cut-outs in public/polishes/ (see README). Until a polish
 *         has them, the card draws product art (components/match/ProductArt.tsx).
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
  /** Cut-out bottle photos (public paths), one per entry in `art`. */
  photos?: string[];
  buyUrl?: string;
}

export interface Pick {
  polish: string;
  /** Matt's words, where he gave any. */
  note?: string;
  /** Matt's own published pick (vs. matched to the pad's job). */
  matt?: boolean;
}

/** Polishes for one pad, and where Matt's picks for it come from. */
export interface PadPicks {
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

export const PICKS: Record<string, PadPicks> = {
  afterburner: {
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
  frostbite: {
    sourceUrl: SRC_ONE_STEP,
    picks: [
      { polish: "3d-one", matt: true, note: "One-product correction cream" },
      { polish: "ps-rehab" },
      { polish: "sonax-perfect-finish" },
      { polish: "3d-aca-510-520" },
      { polish: "koch-h9-f6" },
    ],
  },
  "lone-star": {
    sourceUrl: SRC_ONE_STEP,
    picks: [
      { polish: "3d-one", matt: true, note: "One-product correction cream" },
      { polish: "sonax-perfect-finish" },
      { polish: "ps-therapy" },
      { polish: "3d-aca-520" },
      { polish: "koch-m3" },
    ],
  },
  midas: {
    sourceUrl: SRC_ONE_STEP,
    picks: [
      { polish: "3d-one", matt: true, note: "One-product correction cream" },
      { polish: "sonax-perfect-finish" },
      { polish: "3d-aca-520" },
      { polish: "koch-m3" },
      { polish: "ps-therapy" },
    ],
  },
  spitfire: {
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
};

const STAGE_ORDER: Record<Stage, number> = { cut: 0, "one-step": 1, finish: 2 };
export const STAGE_LABEL: Record<Stage, string> = { cut: "Cut", "one-step": "One-step", finish: "Finish" };

export function polishOf(id: string): Polish {
  const p = POLISHES.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown polish: ${id}`);
  return p;
}

/** A pad's picks resolved and ordered cut → one-step → finish; Matt's picks first within a stage. */
export function picksFor(padId: string) {
  return (PICKS[padId]?.picks ?? [])
    .map((p) => ({ ...p, polish: polishOf(p.polish) }))
    .sort((a, b) => rank(a.polish) - rank(b.polish) || Number(!!b.matt) - Number(!!a.matt));
}

function rank(p: Polish) {
  return p.stages.length ? STAGE_ORDER[p.stages[0]] : 9;
}

export function buyHref(p: Polish) {
  return p.buyUrl ?? `https://www.google.com/search?q=${encodeURIComponent(`${p.brand} ${p.name} buy Australia`)}`;
}
