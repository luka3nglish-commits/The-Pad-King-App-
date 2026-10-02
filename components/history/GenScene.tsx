"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { PadCanvas } from "@/components/three/PadCanvas";
import { PadModel } from "@/components/three/PadModel";
import type { PadShape } from "@/lib/pad/geometry";
import { FOAM } from "@/lib/pad/options";

const PAD: PadShape = { size: 75, thickness: 20, edge: "rounded", face: "flat" };
/** Gen II's interface stripe, placed from Matt's side-on photo (fractions of foam height, face → back). */
const GEN2_STRIPE = { from: 0.44, to: 0.72, color: "#d8be1c" };
const FACE_ON = -Math.PI / 2;
const FACE_UP = Math.PI; // flipped: face up, velcro down, like the photos

interface Pose {
  at: number;
  rx: number;
  rz: number;
  x: number; // desktop x
  my: number; // phone y
  s: number;
  ms: number; // extra phone scale
  band: number;
  glow: number;
}

// Scroll choreography over the pinned section (0 → 1): Gen I, the glue, Gen II.
const POSES: Pose[] = [
  { at: 0.0, rx: FACE_ON + 0.42, rz: 0.22, x: 0.95, my: 0.44, s: 1.0, ms: 1, band: 0, glow: 0 },
  { at: 0.28, rx: FACE_ON + 0.62, rz: 0.3, x: 0.95, my: 0.44, s: 1.02, ms: 1, band: 0, glow: 0 },
  { at: 0.4, rx: 0.62, rz: -0.32, x: 0.92, my: 0.46, s: 1.08, ms: 1, band: 0, glow: 0.2 },
  { at: 0.58, rx: 0.5, rz: -0.22, x: 0.92, my: 0.46, s: 1.08, ms: 1, band: 0, glow: 1 },
  { at: 0.7, rx: FACE_UP + 0.28, rz: 0.04, x: 0.88, my: 0.46, s: 1.3, ms: 1.08, band: 0, glow: 0 },
  { at: 0.84, rx: FACE_UP + 0.2, rz: -0.04, x: 0.88, my: 0.46, s: 1.32, ms: 1.08, band: 1, glow: 0 },
  { at: 1.0, rx: FACE_UP + 0.3, rz: 0.06, x: 0.88, my: 0.46, s: 1.28, ms: 1.08, band: 1, glow: 0 },
];

const KEYS = ["rx", "rz", "x", "my", "s", "ms", "band", "glow"] as const;
const smooth = (t: number) => t * t * (3 - 2 * t);

function poseAt(p: number): Pose {
  const i = Math.max(0, POSES.findIndex((k) => k.at >= p) - 1);
  const a = POSES[i];
  const b = POSES[Math.min(POSES.length - 1, i + 1)];
  const t = b.at === a.at ? 0 : smooth(THREE.MathUtils.clamp((p - a.at) / (b.at - a.at), 0, 1));
  const out = { at: p } as Pose;
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

function Rig({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const bandRef = useRef(0);
  const glowRef = useRef(0);
  const cur = useRef<Pose | null>(null);
  const size = useThree((s) => s.size);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const target = poseAt(progressRef.current);
    if (!cur.current) cur.current = { ...target };
    const c = cur.current;
    for (const k of KEYS) c[k] = THREE.MathUtils.damp(c[k], target[k], 5, dt);
    const phone = size.width < 768;
    const t = state.clock.elapsedTime;
    g.rotation.set(c.rx + Math.sin(t * 0.6) * 0.025, 0, c.rz + Math.sin(t * 0.45) * 0.025);
    g.position.set(phone ? 0 : c.x, (phone ? c.my : 0) + Math.sin(t * 0.9) * 0.02, 0);
    g.scale.setScalar(c.s * (phone ? 0.62 * c.ms : 1));
    if (spin.current) spin.current.rotation.y += dt * 0.18;
    bandRef.current = c.band;
    glowRef.current = c.glow;
  });

  return (
    <group ref={group}>
      <group ref={spin}>
        <group position={[0, -PAD.thickness * 0.01, 0]}>
          <PadModel build={PAD} color={FOAM.color} interfaceColor={FOAM.color} band={GEN2_STRIPE} bandRef={bandRef} glowRef={glowRef} />
        </group>
      </group>
    </group>
  );
}

export default function GenScene({ progressRef }: { progressRef: MutableRefObject<number> }) {
  return (
    <PadCanvas className="absolute inset-0" camera={{ z: 5, fov: 30 }} label="A Pad King pad in 3D, changing from a Gen I to a Gen II design as you scroll">
      <Rig progressRef={progressRef} />
    </PadCanvas>
  );
}
