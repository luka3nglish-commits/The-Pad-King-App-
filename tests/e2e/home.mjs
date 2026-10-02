// Home timeline visual pass: every chapter at desktop and phone size, plus a console-error audit.
// usage: node tests/e2e/home.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";
import fs from "node:fs";

const out = process.argv[2] ?? "shots-home";
const base = process.argv[3] ?? "http://localhost:3100";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PK_CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const errors = [];

// [shot name, element id, where in it: 0 = its top at the top of the screen, 1 = its bottom at the bottom]
const STOPS = [
  ["02-1993", "ch-1993", 0.35],
  ["03-problem", "ch-problem", 0.6],
  ["04-2014", "ch-2014", 0.55],
  ["05-gen1", "gen-seq", 0.05],
  ["06-glue", "gen-seq", 0.55],
  ["07-gen2", "gen-seq", 0.95],
  ["08-shelf", "gen2-shelf", 0.3],
  ["09-shelf-pads", "gen2-shelf", 0.85],
  ["10-2024", "ch-2024", 0.55],
  ["11-elite", "ch-gen3", 0.25],
  ["12-elite-claims", "ch-gen3", 0.85],
  ["13-outro", "outro", 0.6],
];

async function run(name, viewport, dsf) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf, hasTouch: viewport.width < 800, isMobile: viewport.width < 800 });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`[${name}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${name}] pageerror ${e.message}`));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}-01-hero.png` });
  for (const [shot, id, at] of STOPS) {
    // scroll in steps so scrubbed timelines pass through their states
    const y = await page.evaluate(
      ([id, at]) => {
        const el = document.getElementById(id);
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY;
        return Math.max(0, top + (r.height - window.innerHeight) * at);
      },
      [id, at],
    );
    const from = await page.evaluate(() => window.scrollY);
    for (let i = 1; i <= 6; i++) {
      await page.evaluate((v) => window.scrollTo(0, v), from + ((y - from) * i) / 6);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(id === "gen-seq" ? 3500 : 1800);
    await page.screenshot({ path: `${out}/${name}-${shot}.png` });
  }
  await ctx.close();
}

await run("desktop", { width: 1440, height: 900 }, 1);
await run("mobile", { width: 390, height: 844 }, 2);
await browser.close();
console.log(errors.length ? errors.join("\n") : "console errors: none");
