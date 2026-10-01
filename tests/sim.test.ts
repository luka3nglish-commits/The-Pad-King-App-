import { describe, expect, it } from "vitest";
import { kinematics, pointAt, poseAt, slowFactor, type SimInput } from "@/lib/sim";

const da: SimInput = { machine: "da", speed: 4000, throwMm: 15, padMm: 125, pressure: "medium" };
const rotary: SimInput = { machine: "rotary", speed: 1500, throwMm: 15, padMm: 75, pressure: "medium" };

describe("motion lab kinematics", () => {
  it("rotary: centre still, edge speed = 2πr·rev/s", () => {
    const k = kinematics(rotary);
    expect(k.centreSpeed).toBe(0);
    expect(k.edgeSpeed).toBeCloseTo(2 * Math.PI * 0.0375 * 25, 6); // ≈ 5.89 m/s
    expect(k.spinIllustrative).toBe(false);
  });

  it("DA: every point gets the orbit speed, orbit radius is half the throw", () => {
    const k = kinematics(da);
    expect(k.orbitRadiusMm).toBe(7.5);
    expect(k.orbitSpeed).toBeCloseTo(2 * Math.PI * 0.0075 * (4000 / 60), 6); // ≈ 3.14 m/s
    expect(k.centreSpeed).toBe(k.orbitSpeed);
    expect(k.edgeSpeed).toBeGreaterThan(k.orbitSpeed);
    expect(k.spinIllustrative).toBe(true);
  });

  it("DA pad spin slows as pressure goes up", () => {
    const light = kinematics({ ...da, pressure: "light" }).spinHz;
    const heavy = kinematics({ ...da, pressure: "heavy" }).spinHz;
    expect(heavy).toBeLessThan(light);
  });

  it("the pad centre traces the orbit circle; a rotary centre never moves", () => {
    const k = kinematics(da);
    for (const t of [0, 0.003, 0.0071]) {
      const p = poseAt(k, t);
      expect(Math.hypot(p.cx, p.cy)).toBeCloseTo(7.5, 6);
    }
    const kr = kinematics(rotary);
    const p = poseAt(kr, 0.01);
    expect(p.cx).toBe(0);
    expect(p.cy).toBe(0);
    // a rotary edge point stays on its circle
    const e = pointAt(kr, 0.0123, 30);
    expect(Math.hypot(e.x, e.y)).toBeCloseTo(30, 6);
  });

  it("slow motion keeps the orbit:spin ratio", () => {
    const k = kinematics(da);
    const s = slowFactor(k);
    expect(k.orbitHz / s).toBeCloseTo(0.9, 6);
    expect(k.spinHz / s / (k.orbitHz / s)).toBeCloseTo(k.spinHz / k.orbitHz, 9);
  });
});
