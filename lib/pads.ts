/**
 * The Pad King stock range — one catalogue shared by the Range and Match tabs.
 *
 * Copy and specs come only from Matt's site (thepadking.com.au). Rows with no
 * published figure are simply left out rather than guessed.
 *
 * buyUrl: the pad's product page on Matt's store (links confirmed by the owner).
 */

export const SITE = "https://thepadking.com.au";
export const PAD_RANGE_URL = `${SITE}/pad-range/`;

export interface PadSpec {
  label: string;
  value: string;
}

export interface Pad {
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
  sizes?: string[];
  specs: PadSpec[];
  buyUrl: string;
}

export const PADS: Pad[] = [
  {
    id: "afterburner",
    name: "Afterburner",
    short: "Afterburner",
    role: "Levelling & cutting",
    blurb: "Super-fast levelling on soft to medium-hard paints and heavy cutting on hard paints, with a better finish than denim or velvet pads.",
    color: "#5a9fcf",
    shape: { thickness: 10 },
    tip: "On a DA, run it on a 10 mm micro-hook sanding interface pad so it contours to the panel.",
    sizes: ["75 / 90 mm", "125 / 140 mm"],
    specs: [
      { label: "Job", value: "Short-cycle levelling, heavy cutting" },
      { label: "Best on", value: "Soft to medium-hard paints (levelling) · hard paints (cutting)" },
      { label: "Orange peel", value: "Removes ~25% on soft paints" },
      { label: "Finish", value: "Better than denim or velvet pads, less heat" },
    ],
    buyUrl: `${SITE}/product/afterburner-levelling-cutting-pad/`,
  },
  {
    id: "frostbite",
    name: "Frostbite Cutting Pad",
    short: "Frostbite",
    role: "Medium to light cut",
    blurb: "Medium to light cut. Best for a one-step on medium-hard and hard paints.",
    color: "#7cb6dd",
    shape: { thickness: 20 },
    specs: [
      { label: "Cut", value: "Medium to light" },
      { label: "Best on", value: "One-step corrections on medium-hard and hard paints" },
    ],
    buyUrl: `${SITE}/product/frost-bite-white-cutting-pad/`,
  },
  {
    id: "lone-star",
    name: "Lone Star Red",
    short: "Lone Star",
    role: "Polishing pad",
    blurb: "Built for softer paints.",
    color: "#b01c26",
    shape: { thickness: 20 },
    specs: [{ label: "Best on", value: "Softer paints" }],
    buyUrl: `${SITE}/product/lone-star-red/`,
  },
  {
    id: "midas",
    name: "Midas Touch Gold",
    short: "Midas",
    role: "Finishing pad",
    blurb: "2.5× the defect removal of a conventional finishing pad, while keeping a high-gloss finish.",
    color: "#c78e1f",
    shape: { thickness: 20 },
    sizes: ['3"', '5"', '6"'],
    specs: [
      { label: "Defect removal", value: "2.5× a conventional finishing pad" },
      { label: "Job", value: "Gloss enhancements and the finishing stage of a 2–3 stage correction" },
    ],
    buyUrl: `${SITE}/product/gold-universal/`,
  },
  {
    id: "spitfire",
    name: "Spitfire Green",
    short: "Spitfire",
    role: "All rounder",
    blurb: "Balanced light to medium cut. Corrects, polishes and finishes in one pad.",
    color: "#3fa02c",
    shape: { thickness: 20 },
    sizes: ['3"', '5"', '6"'],
    specs: [
      { label: "Cut", value: "Light to medium — corrects, polishes and finishes" },
      { label: "Best on", value: "Modern clear coats, 60–105 µm" },
      { label: "Machines", value: "DA (speed 2–5) · forced rotation · rotary (500–1,200 RPM)" },
      { label: "Durability", value: "50% greater, from advanced foam technology" },
      { label: "Backing", value: "120 °C adhesive on Velcro® brand loop" },
    ],
    buyUrl: `${SITE}/product/green-all-rounder/`,
  },
];

export function padById(id: string | null | undefined): Pad | undefined {
  return PADS.find((p) => p.id === id);
}
