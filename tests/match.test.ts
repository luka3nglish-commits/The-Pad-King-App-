import { describe, expect, it } from "vitest";
import { BRANDS, PADS, POLISHES, buyHref, picksFor } from "@/lib/match";

describe("pad match data", () => {
  it("has all five stock pads with at least four picks each", () => {
    expect(PADS.map((p) => p.id).sort()).toEqual(["afterburner", "frostbite", "lone-star", "midas", "spitfire"]);
    for (const pad of PADS) expect(pad.picks.length).toBeGreaterThanOrEqual(4);
  });

  it("only uses the four approved brands", () => {
    for (const p of POLISHES) expect(BRANDS).toContain(p.brand);
    expect(new Set(POLISHES.map((p) => p.brand))).toEqual(new Set(BRANDS));
  });

  it("every pick points at a known polish, with no duplicates per pad", () => {
    const ids = new Set(POLISHES.map((p) => p.id));
    expect(ids.size).toBe(POLISHES.length);
    for (const pad of PADS) {
      for (const pick of pad.picks) expect(ids.has(pick.polish)).toBe(true);
      expect(new Set(pad.picks.map((p) => p.polish)).size).toBe(pad.picks.length);
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
      const ranks = picksFor(pad).map((p) => rank[p.polish.stages[0]]);
      expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
    }
  });

  it("every pad shows at least one of Matt's own picks, citing his site", () => {
    for (const pad of PADS) {
      expect(pad.picks.some((p) => p.matt)).toBe(true);
      expect(pad.sourceUrl.startsWith("https://thepadking.com.au/")).toBe(true);
    }
  });

  it("falls back to a search link until a stockist is set", () => {
    const p = POLISHES.find((x) => x.id === "3d-one")!;
    expect(buyHref(p)).toContain("google.com/search?q=3D%20One");
    expect(buyHref({ ...p, buyUrl: "https://example.com/3d-one" })).toBe("https://example.com/3d-one");
  });
});
