// Pad Match visual pass. usage: node tests/e2e/match.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";
import fs from "node:fs";

const out = process.argv[2] ?? "shots-match";
const base = process.argv[3] ?? "http://localhost:3100";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PK_CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const errors = [];
for (const [name, viewport, dsf] of [["desktop", { width: 1440, height: 900 }, 1], ["mobile", { width: 390, height: 844 }, 2]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf, isMobile: viewport.width < 800, hasTouch: viewport.width < 800 });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`[${name}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${name}] ${e.message}`));
  await page.goto(`${base}/match`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${out}/${name}-1-top.png` });
  const y = await page.evaluate(() => document.querySelector("fieldset").getBoundingClientRect().top + scrollY);
  const goTo = async () => {
    await page.evaluate((y) => scrollTo(0, y), viewport.width < 800 ? y - 80 : y - 380);
    await page.waitForTimeout(2500);
  };
  await goTo();
  await page.screenshot({ path: `${out}/${name}-2-spitfire.png` });
  for (const [i, pad] of [[3, "Afterburner"], [4, "Midas"]]) {
    await page.locator("label", { hasText: new RegExp(`^${pad}`) }).first().click();
    await page.waitForTimeout(2500);
    await goTo();
    await page.screenshot({ path: `${out}/${name}-${i}-${pad.toLowerCase()}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log("console errors:", errors.length ? "\n" + errors.join("\n") : "none");
