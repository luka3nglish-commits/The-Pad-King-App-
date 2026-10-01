/**
 * Pad Match data — which polishes go with which Pad King pad.
 *
 * Every pick comes from Matt's own published write-ups on thepadking.com.au.
 * "tested" = a pad-specific list from his R&D testing.
 * "general" = his general one-step guidance, shown until he gives a list for that pad.
 * Matt should sign these off; edit this file only.
 *
 * buyUrl: Matt's preferred stockist / affiliate link. Until set, the card links to
 * a plain web search for the product so the button still works.
 */

export type Stage = "cut" | "one-step" | "finish";

export interface Polish {
  id: string;
  brand: string;
  name: string;
  /** Empty when the product's role isn't confirmed yet. */
  stages: Stage[];
  buyUrl?: string;
}

export interface Pick {
  polish: string;
  /** Matt's words, where he gave any. */
  note?: string;
}

export interface PadEntry {
  id: string;
  name: string;
  short: string;
  role: string;
  blurb: string;
  /** Foam colour, deep and rich rather than fluro (owner direction). Approximate except Spitfire. */
  color: string;
  /** Stock shape for the 3D render (mm). */
  shape: { thickness: number };
  tip?: string;
  source: "tested" | "general";
  sourceUrl: string;
  picks: Pick[];
}

const SRC_SPITFIRE = "https://thepadking.com.au/green-all-rounder-pads-extracting-optimal-performance/";
const SRC_AFTERBURNER = "https://thepadking.com.au/product/afterburner-levelling-cutting-pad/";
const SRC_ONE_STEP = "https://thepadking.com.au/how-to-do-a-one-step-paint-correction-the-essential-guide/";

export const POLISHES: Polish[] = [
  { id: "3d-aca-510-520", brand: "3D", name: "ACA 510 + 520", stages: ["cut", "finish"] },
  { id: "3d-aca-510", brand: "3D", name: "ACA 510", stages: ["cut"] },
  { id: "3d-aca-520", brand: "3D", name: "ACA 520", stages: ["finish"] },
  { id: "3d-one", brand: "3D", name: "One", stages: ["one-step"] },
  { id: "sonax-perfect-finish", brand: "Sonax", name: "Perfect Finish", stages: ["one-step"] },
  { id: "sonax-ultimate-cut", brand: "Sonax", name: "Ultimate Cut", stages: ["cut"] },
  { id: "koch-h9-f6", brand: "Koch Chemie", name: "H9 + F6", stages: ["cut"] },
  { id: "koch-m3", brand: "Koch Chemie", name: "M3", stages: ["finish"] },
  { id: "rupes-da-coarse", brand: "Rupes", name: "DA Coarse", stages: ["cut"] },
  { id: "rupes-da-fine", brand: "Rupes", name: "DA Fine", stages: ["finish"] },
  { id: "rupes-uno-pure", brand: "Rupes", name: "Uno Pure", stages: ["one-step"] },
  { id: "rupes-da-fine-uno-pure", brand: "Rupes", name: "DA Fine + Uno Pure", stages: ["finish"] },
  { id: "csi-ceram-x", brand: "CSI", name: "Ceram X", stages: ["one-step"] },
  { id: "csi-ceram-xx", brand: "CSI", name: "Ceram XX", stages: ["one-step"] },
  { id: "oberk-sole", brand: "Oberk", name: "Sole", stages: [] },
  { id: "feynlab-a50", brand: "Feynlab", name: "A50", stages: ["cut"] },
  { id: "carpro-essence", brand: "CarPro", name: "Essence", stages: ["finish"] },
  { id: "labocosmetica-fiero", brand: "Labocosmetica", name: "Fiero", stages: ["finish"] },
];

const GENERAL_PICKS: Pick[] = [
  { polish: "3d-one", note: "One-product correction cream" },
  { polish: "csi-ceram-x", note: "One-product correction cream" },
  { polish: "csi-ceram-xx" },
  { polish: "carpro-essence", note: "Primer polish" },
  { polish: "labocosmetica-fiero", note: "Primer polish, adaptive abrasive" },
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
    source: "tested",
    sourceUrl: SRC_AFTERBURNER,
    picks: [
      { polish: "feynlab-a50", note: "Levelling compound" },
      { polish: "sonax-ultimate-cut" },
      { polish: "rupes-da-coarse" },
      { polish: "3d-aca-510" },
      { polish: "3d-one" },
      { polish: "sonax-perfect-finish" },
      { polish: "rupes-uno-pure" },
      { polish: "csi-ceram-xx" },
      { polish: "3d-aca-520" },
      { polish: "rupes-da-fine" },
    ],
  },
  {
    id: "frostbite",
    name: "Frostbite White",
    short: "Frostbite",
    role: "Cutting pad",
    blurb: "Medium to light cut. Best for a one-step on medium-hard and hard paints.",
    color: "#d9dee3",
    shape: { thickness: 20 },
    source: "general",
    sourceUrl: SRC_ONE_STEP,
    picks: GENERAL_PICKS,
  },
  {
    id: "lone-star",
    name: "Lone Star Red",
    short: "Lone Star",
    role: "Polishing pad",
    blurb: "Built for softer paints.",
    color: "#b01c26",
    shape: { thickness: 20 },
    source: "general",
    sourceUrl: SRC_ONE_STEP,
    picks: GENERAL_PICKS,
  },
  {
    id: "midas",
    name: "Midas Touch Gold",
    short: "Midas",
    role: "Finishing pad",
    blurb: "2.5× the defect removal of a conventional finishing pad, while keeping a high-gloss finish.",
    color: "#c78e1f",
    shape: { thickness: 20 },
    source: "general",
    sourceUrl: SRC_ONE_STEP,
    picks: GENERAL_PICKS,
  },
  {
    id: "spitfire",
    name: "Spitfire Green",
    short: "Spitfire",
    role: "All rounder",
    blurb: "Balanced light to medium cut. Corrects, polishes and finishes in one pad.",
    color: "#3fa02c",
    shape: { thickness: 20 },
    source: "tested",
    sourceUrl: SRC_SPITFIRE,
    picks: [
      { polish: "3d-aca-510-520", note: "Magic combo" },
      { polish: "koch-h9-f6", note: "75/25 blend" },
      { polish: "3d-one" },
      { polish: "sonax-perfect-finish" },
      { polish: "csi-ceram-x" },
      { polish: "rupes-da-fine-uno-pure", note: "80/20 mix" },
      { polish: "rupes-da-fine" },
      { polish: "koch-m3", note: "For finishing" },
      { polish: "oberk-sole" },
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

/** A pad's picks resolved and ordered cut → one-step → finish (unknown role last). */
export function picksFor(pad: PadEntry) {
  return pad.picks
    .map((p) => ({ ...p, polish: polishOf(p.polish) }))
    .sort((a, b) => rank(a.polish) - rank(b.polish));
}

function rank(p: Polish) {
  return p.stages.length ? STAGE_ORDER[p.stages[0]] : 9;
}

export function buyHref(p: Polish) {
  return p.buyUrl ?? `https://www.google.com/search?q=${encodeURIComponent(`${p.brand} ${p.name} polish buy Australia`)}`;
}
