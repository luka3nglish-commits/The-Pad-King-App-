import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { BRANDS, PICKS, POLISHES, buyHref, picksFor } from "@/lib/match";
import { PADS } from "@/lib/pads";

describe("pad match data", () => {
  it("has all five stock pads with at least four picks each", () => {
    expect(PADS.map((p) => p.id).sort()).toEqual(["afterburner", "frostbite", "lone-star", "midas", "spitfire"]);
    for (const pad of PADS) expect(PICKS[pad.id].picks.length).toBeGreaterThanOrEqual(4);
    expect(Object.keys(PICKS).sort()).toEqual(PADS.map((p) => p.id).sort());
  });

  it("only uses the four approved brands", () => {
    for (const p of POLISHES) expect(BRANDS).toContain(p.brand);
    expect(new Set(POLISHES.map((p) => p.brand))).toEqual(new Set(BRANDS));
  });

  it("every pick points at a known polish, with no duplicates per pad", () => {
    const ids = new Set(POLISHES.map((p) => p.id));
    expect(ids.size).toBe(POLISHES.length);
    for (const pad of PADS) {
      const picks = PICKS[pad.id].picks;
      for (const pick of picks) expect(ids.has(pick.polish)).toBe(true);
      expect(new Set(picks.map((p) => p.polish)).size).toBe(picks.length);
    }
  });

  it("every product has art for each bottle and a stage", () => {
    for (const p of POLISHES) {
      expect(p.art.length).toBeGreaterThanOrEqual(1);
      expect(p.stages.length).toBeGreaterThanOrEqual(1);
      // combos draw one bottle per product
      if (p.name.includes("+")) expect(p.art.length).toBe(2);
    }
  });

  it("orders picks cut → one-step → finish", () => {
    for (const pad of PADS) {
      const rank = { cut: 0, "one-step": 1, finish: 2 } as const;
      const ranks = picksFor(pad.id).map((p) => rank[p.polish.stages[0]]);
      expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
    }
  });

  it("every pad shows at least one of Matt's own picks, citing his site", () => {
    for (const pad of PADS) {
      expect(PICKS[pad.id].picks.some((p) => p.matt)).toBe(true);
      expect(PICKS[pad.id].sourceUrl.startsWith("https://thepadking.com.au/")).toBe(true);
    }
  });

  it("falls back to a search link until a stockist is set", () => {
    const p = POLISHES.find((x) => x.id === "3d-one")!;
    expect(buyHref(p)).toContain("google.com/search?q=3D%20One");
    expect(buyHref({ ...p, buyUrl: "https://example.com/3d-one" })).toBe("https://example.com/3d-one");
  });
});

describe("polish photos", () => {
  it("every listed bottle photo exists, one per bottle", () => {
    for (const p of POLISHES) {
      if (!p.photos) continue;
      expect(p.photos.length).toBe(p.art.length);
      for (const src of p.photos) {
        expect(src).toMatch(/^\/polishes\/[a-z0-9-]+\.webp$/);
        expect(existsSync(join(process.cwd(), "public", src))).toBe(true);
      }
    }
  });
});

describe("pad catalogue", () => {
  it("every pad links to Matt's own store and shows at least one spec", () => {
    for (const pad of PADS) {
      expect(pad.buyUrl.startsWith("https://thepadking.com.au/")).toBe(true);
      expect(pad.specs.length).toBeGreaterThanOrEqual(1);
      expect(pad.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("3D looks are well-formed where a pad has been photographed", () => {
    const hex = /^#[0-9a-f]{6}$/i;
    for (const pad of PADS) {
      if (pad.foam) expect(pad.foam).toMatch(hex);
      if (pad.backing) {
        expect(pad.backing.color).toMatch(hex);
        expect(pad.backing.from).toBeGreaterThan(0.3); // a layer at the back, not the face
        expect(pad.backing.from).toBeLessThan(1);
      }
      if (pad.velcro) {
        expect(pad.velcro.color).toMatch(hex);
        if (pad.velcro.ribs !== undefined) expect(pad.velcro.ribs).toBeGreaterThan(0.2);
      }
    }
    const frost = PADS.find((p) => p.id === "frostbite")!;
    expect(frost.shape.edge).toBe("straight");
    expect(frost.backing).toBeDefined();
    expect(frost.print).toBeUndefined(); // the real Frostbite back has no print
  });
});
