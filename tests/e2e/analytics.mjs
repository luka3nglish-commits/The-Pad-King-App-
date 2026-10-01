// Checks analytics events end to end, with the provider's script stubbed so
// nothing leaves the machine. Build with ONE provider switched on first:
//   NEXT_PUBLIC_PLAUSIBLE_SRC=https://plausible.io/js/pa-test.js npx next build   (or NEXT_PUBLIC_GA_ID=G-TEST123)
//   npx next start -p 3100
//   node tests/e2e/analytics.mjs [baseUrl=http://localhost:3100]
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3100";
const CUSTOMER = { name: "Jordan Reyes", email: "jordan@example.com", phone: "0400 111 222" };

// minimal Plausible stand-in: drains the init queue, then records every call
const FAKE_PLAUSIBLE = `(() => {
  const q = (window.plausible && window.plausible.q) || [];
  window.__pk = { provider: "plausible", init: window.plausible && window.plausible.o, events: [] };
  const record = (name, opts) => window.__pk.events.push([name, (opts && opts.props) || {}]);
  q.forEach((args) => record(args[0], args[1]));
  window.plausible = record;
})();`;

const browser = await chromium.launch({
  executablePath: process.env.PK_CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
await ctx.route(/plausible\.io\/js\/.+\.js$/, (r) => r.fulfill({ contentType: "application/javascript", body: FAKE_PLAUSIBLE }));
await ctx.route(/googletagmanager\.com\/gtag\/js/, (r) => r.fulfill({ contentType: "application/javascript", body: "window.__gtagLoaded = true;" }));
await ctx.route(/thepadking\.com\.au/, (r) => r.fulfill({ contentType: "text/html", body: "<title>store</title>" }));
await ctx.route("**/api/build-request", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
const page = await ctx.newPage();

async function events() {
  return page.evaluate(() => {
    const w = window;
    if (w.__pk) return { provider: "plausible", init: !!w.__pk.init, events: w.__pk.events };
    if (w.dataLayer)
      return {
        provider: "ga4",
        init: w.dataLayer.some((a) => a[0] === "config"),
        events: w.dataLayer.filter((a) => a[0] === "event").map((a) => [a[1], a[2] ?? {}]),
      };
    return { provider: null, init: false, events: [] };
  });
}

let failed = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "✓" : "✗"} ${msg}`);
  if (!ok) failed++;
};

await page.goto(`${base}/range`, { waitUntil: "networkidle" });
const start = await events();
check(start.provider !== null, `provider loaded: ${start.provider}`);
check(start.init, "provider initialised");

await page.locator("label", { hasText: "Midas" }).click();
const [popup] = await Promise.all([ctx.waitForEvent("page"), page.getByRole("link", { name: /Buy the Midas/ }).click()]);
await popup.close();

// tab switch keeps the same page, so events keep accumulating
await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Build" }).click();
await page.getByRole("button", { name: "Send build to The Pad King" }).click();
await page.getByLabel(/^Name/).fill(CUSTOMER.name);
await page.getByLabel(/^Email/).fill(CUSTOMER.email);
await page.getByLabel(/^Phone/).fill(CUSTOMER.phone);
await page.getByRole("button", { name: "Send build request" }).click();
await page.getByText("Sent.").waitFor();

const { events: got } = await events();
console.log("events:", JSON.stringify(got));
const has = (name, props = {}) => got.some(([n, p]) => n === name && Object.entries(props).every(([k, v]) => p[k] === v));
check(has("range_select", { pad: "midas" }), "range_select { pad: midas }");
check(has("range_buy_click", { pad: "midas" }), "range_buy_click { pad: midas }");
check(has("build_request_open"), "build_request_open");
check(has("build_request_sent", { quantity: 1 }), "build_request_sent");
const leaked = Object.values(CUSTOMER).filter((v) => JSON.stringify(got).includes(v));
check(leaked.length === 0, "no customer details in any event");

await browser.close();
console.log(failed ? `${failed} failed` : "all passed");
process.exit(failed ? 1 : 0);
