/**
 * The Pad King story — the home page timeline.
 *
 * Every line here comes from Matt's own site (sources beside each chapter) or
 * from Matt directly. Years appear only where Matt states them; the
 * generations are labelled GEN I / II / III instead. To change wording, edit
 * this file only — the page lays itself out from it.
 */

const SITE = "https://thepadking.com.au";
const VELCRO_ARTICLE = `${SITE}/polishing-pad-velcro-failure-what-causes-it-and-the-solutions-we-engineered-that-eliminates-it-completely/`;
const GREEN_ARTICLE = `${SITE}/green-all-rounder-pads-extracting-optimal-performance/`;

export type ChapterId = "1993" | "problem" | "2014" | "gen1" | "glue" | "gen2" | "2024" | "gen3";

export interface Chapter {
  id: ChapterId;
  /** Short label for the chapter rail and the giant outline numeral. */
  marker: string;
  eyebrow: string;
  /** Headline; the second part is set in gold. */
  title: [string, string];
  body: string;
  sources: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "1993",
    marker: "1993",
    eyebrow: "1993 · On the tools",
    title: ["Thirty years", "on paint."],
    body: "Matt Gibb starts detailing in 1993. Three decades later he's still testing, still innovating, still pushing.",
    sources: [SITE],
  },
  {
    id: "problem",
    marker: "Problem",
    eyebrow: "The problem",
    title: ["Pads that fail", "before they wear out."],
    body: "For decades, polishing pads have shed their velcro long before the foam is done. It annoyed Matt for years on the tools, so The Pad King was built to solve problems, not to be another range of pads to sell.",
    sources: [VELCRO_ARTICLE, SITE],
  },
  {
    id: "2014",
    marker: "2014",
    eyebrow: "2014 · Europe",
    title: ["The foam", "hunt."],
    body: "Since 2014 Matt has partnered with European foam manufacturers, choosing every foam on its technical specs. Each pad takes 50 to 100+ hours of development, then the foam is CNC-machined into 90, 140 and 150 mm pads before the edges are reshaped.",
    sources: [SITE, `${SITE}/pad-range/`],
  },
  {
    id: "gen1",
    marker: "GEN I",
    eyebrow: "GEN I · The first designs",
    title: ["Foam. Glue.", "Loop."],
    body: "The first Pad King pads: Matt's chosen foam bonded to Velcro® brand loop. No interface layer yet. That came with Gen II.",
    sources: [GREEN_ARTICLE],
  },
  {
    id: "glue",
    marker: "120 °C",
    eyebrow: "The glue",
    title: ["120 °C.", "Not 70."],
    body: "Most pads are glued with hot melt rated around 70 °C, and every heat cycle weakens it. Spitfire Green and Midas Touch Gold run a 120 °C temperature-resistant adhesive on Velcro® brand loop.",
    sources: [VELCRO_ARTICLE],
  },
  {
    id: "gen2",
    marker: "GEN II",
    eyebrow: "GEN II · Super Series · Nexus Foams",
    title: ["The", "sandwich."],
    body: "A non-porous interface layer through the pad: three materials, multiple grades, all highly heat resistant. Polish solvents can't reach the glue, power transfers better, and the pad stays almost dead level, even after a machine wash and a high-speed spin dry.",
    sources: [VELCRO_ARTICLE, GREEN_ARTICLE],
  },
  {
    id: "2024",
    marker: "2024",
    eyebrow: "2024 · Scale",
    title: ["Nearly ten", "foam makers."],
    body: "The search widens to nearly ten foam companies, including the world's largest foam manufacturer.",
    sources: [SITE],
  },
  {
    id: "gen3",
    marker: "GEN III",
    eyebrow: "GEN III · Arriving Q4 2026",
    title: ["Third", "generation."],
    body: "Japanese foam technology joins the range, alongside Matt's third-generation pad designs: the Elite Series.",
    sources: [SITE, VELCRO_ARTICLE],
  },
];

export function chapter(id: ChapterId): Chapter {
  return CHAPTERS.find((c) => c.id === id)!;
}

/** Why pads fail (from Matt's velcro-failure write-up). */
export const CAUSES = [
  { title: "Solvents soak through", body: "Too much product, or a pad kept working too long, and the solvents in polish travel through open-cell foam to the glue." },
  { title: "Heat and pressure", body: "Heavy downforce, especially on a DA, builds heat and shear right at the velcro." },
  { title: "70 °C hot melt", body: "The common glue rating across the industry. Each heat cycle weakens the bond." },
];

/** What Gen II's interface layer does. */
export const GEN2_POINTS = [
  { title: "Sealed", body: "Non-porous, so polish and compound solvents never reach the adhesive." },
  { title: "Supported", body: "Holds the foam up without breaking down, and transfers more of the machine's power to the paint." },
  { title: "Level", body: "Stays almost dead level, even after a machine wash and a high-speed spin dry." },
];

/** What the Elite Series is built for. */
export const ELITE_CLAIMS = [
  { title: "Thermal stability", body: "Measurably more stable under heat." },
  { title: "Anti-flattening", body: "Holds its shape through the job." },
  { title: "Anti-softening", body: "Some of the new foams barely soften at all." },
  { title: "No delamination", body: "Velcro that stays put, on any polisher." },
];

/** Matt's photos, cut out for the dark page (public/history). */
export const PHOTOS = {
  stacks: { src: "/history/gen2-stacks", w: 1600, h: 850, alt: "Two stacks of Gen II pads on Matt's shelf: green foam with a yellow interface stripe, and orange foam with a black interface stripe." },
  green: { src: "/history/gen2-green", w: 1600, h: 435, alt: "A Gen II pad from the side: green foam with a yellow interface layer through the middle." },
  red: { src: "/history/gen2-red", w: 1600, h: 461, alt: "A Gen II pad from the side: red foam with a black interface layer through the middle." },
  elite: { src: "/history/elite-logo", w: 1284, h: 678, alt: "The Pad King Elite Series logo." },
} as const;
