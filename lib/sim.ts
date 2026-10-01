/**
 * Motion Lab kinematics — how a point on the pad moves under a DA vs a rotary.
 *
 * Everything here is plain geometry and is exact, EXCEPT the DA pad's own spin:
 * on a free-floating DA the pad's rotation comes from friction and varies with
 * machine, pad, paint and pressure. That ratio is marked ILLUSTRATIVE and is
 * labelled as such in the UI until The Pad King's test data replaces it.
 */

export type Machine = "da" | "rotary";
export type Pressure = "light" | "medium" | "heavy";

export const THROWS = [8, 12, 15, 21] as const; // mm, common DA throws
export const PAD_SIZES = [40, 65, 75, 125, 150] as const; // mm

export const SPEED_RANGE: Record<Machine, { min: number; max: number; step: number; def: number; unit: string }> = {
  da: { min: 1500, max: 6000, step: 100, def: 4000, unit: "OPM" },
  rotary: { min: 600, max: 3000, step: 50, def: 1500, unit: "RPM" },
};

/** ILLUSTRATIVE: DA pad spin as a fraction of orbit rate, falling with pressure. */
export const DA_SPIN_RATIO: Record<Pressure, number> = { light: 0.08, medium: 0.04, heavy: 0.012 };

export interface SimInput {
  machine: Machine;
  speed: number; // OPM for DA, RPM for rotary
  throwMm: number;
  padMm: number;
  pressure: Pressure;
}

export interface Kinematics {
  orbitHz: number; // DA orbits per second (0 for rotary)
  spinHz: number; // pad rotations per second
  spinRpm: number;
  orbitRadiusMm: number;
  /** speed every point on the face gets from the orbit alone (m/s) */
  orbitSpeed: number;
  /** speed of the pad centre (m/s) */
  centreSpeed: number;
  /** peak speed of a point on the pad edge (m/s) */
  edgeSpeed: number;
  spinIllustrative: boolean;
}

const TAU = Math.PI * 2;

export function kinematics(i: SimInput): Kinematics {
  const R = i.padMm / 2 / 1000; // m
  if (i.machine === "rotary") {
    const spinHz = i.speed / 60;
    return {
      orbitHz: 0,
      spinHz,
      spinRpm: i.speed,
      orbitRadiusMm: 0,
      orbitSpeed: 0,
      centreSpeed: 0,
      edgeSpeed: TAU * R * spinHz,
      spinIllustrative: false,
    };
  }
  const orbitHz = i.speed / 60;
  const e = i.throwMm / 2 / 1000; // orbit radius = half the throw
  const spinHz = orbitHz * DA_SPIN_RATIO[i.pressure];
  const orbitSpeed = TAU * e * orbitHz;
  return {
    orbitHz,
    spinHz,
    spinRpm: spinHz * 60,
    orbitRadiusMm: i.throwMm / 2,
    orbitSpeed,
    centreSpeed: orbitSpeed,
    // orbit and spin turn the same way, so at the edge the two add at their peak
    edgeSpeed: orbitSpeed + TAU * R * spinHz,
    spinIllustrative: true,
  };
}

export interface Pose {
  cx: number; // pad centre (mm)
  cy: number;
  theta: number; // pad rotation (rad)
}

/** Pad pose at time t (seconds of real time). */
export function poseAt(k: Kinematics, t: number): Pose {
  const phi = TAU * k.orbitHz * t;
  return {
    cx: k.orbitRadiusMm * Math.cos(phi),
    cy: k.orbitRadiusMm * Math.sin(phi),
    theta: TAU * k.spinHz * t,
  };
}

/** Position of a point at radius r (mm) on the pad face, at time t. */
export function pointAt(k: Kinematics, t: number, r: number) {
  const p = poseAt(k, t);
  return { x: p.cx + r * Math.cos(p.theta), y: p.cy + r * Math.sin(p.theta) };
}

/**
 * Slow-motion factor so the fastest visible motion runs at a watchable rate.
 * The ratio between orbit and spin is preserved, so the traced pattern is true.
 */
export function slowFactor(k: Kinematics) {
  const fastest = Math.max(k.orbitHz, k.spinHz);
  const target = k.orbitHz > 0 ? 0.9 : 0.35; // Hz on screen
  return fastest / target;
}
