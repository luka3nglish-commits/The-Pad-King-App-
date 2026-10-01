// Renders the app icons (PNG) from scripts/icon.svg.mjs with headless Chromium.
// usage: node scripts/icons.mjs
import { chromium } from "@playwright/test";
import fs from "node:fs";
import { iconSvg } from "./icon.svg.mjs";

const targets = [
  { file: "public/icons/icon-192.png", size: 192, opts: {} },
  { file: "public/icons/icon-512.png", size: 512, opts: {} },
  { file: "public/icons/maskable-512.png", size: 512, opts: { maskable: true } },
  { file: "app/apple-icon.png", size: 180, opts: { maskable: true } }, // iOS rounds corners itself
];

const browser = await chromium.launch({ executablePath: process.env.PK_CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage();
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${iconSvg(t.opts).replace("<svg ", `<svg width="${t.size}" height="${t.size}" `)}</body></html>`,
  );
  await page.screenshot({ path: t.file, omitBackground: true });
  console.log("wrote", t.file);
}
fs.writeFileSync("app/icon.svg", iconSvg());
console.log("wrote app/icon.svg");
await browser.close();
