"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { PadCanvas } from "@/components/three/PadCanvas";
import { LayerMarkers } from "@/components/three/LayerMarkers";
import { PadModel } from "@/components/three/PadModel";
import type { PadShape } from "@/lib/pad/geometry";

/** The stock Spitfire Green: flat face, soft rounded edge — matches Matt's product photo. */
const STOCK: PadShape = { size: 75, thickness: 22, edge: "rounded", face: "flat" };

const FACE_ON = -Math.PI / 2;

interface Pose {
  at: number;
  rx: number;
  rz: number;
  x: number; // desktop x offset
  my: number; // mobile y offset
  s: number;
  ms: number; // extra mobile scale
  explode: number;
}

// Scroll choreography. `at` is progress through the pinned story (0 → 1).
const POSES: Pose[] = [
  { at: 0.0, rx: FACE_ON + 0.24, rz: 0.12, x: 1.0, my: 0.42, s: 1.0, ms: 1, explode: 0 },
  { at: 0.2, rx: FACE_ON + 0.32, rz: 0.18, x: 1.0, my: 0.42, s: 1.02, ms: 1, explode: 0 },
  { at: 0.36, rx: FACE_ON + 1.05, rz: -0.38, x: 0.98, my: 0.46, s: 1.08, ms: 1, explode: 0 },
  { at: 0.52, rx: -0.2, rz: 0.04, x: 0.86, my: 0.3, s: 0.98, ms: 0.92, explode: 1 },
  { at: 0.68, rx: -0.26, rz: -0.06, x: 0.86, my: 0.3, s: 0.98, ms: 0.92, explode: 1 },
  { at: 0.84, rx: FACE_ON + 0.62, rz: 0.3, x: 1.02, my: 0.66, s: 0.98, ms: 0.78, explode: 0 },
  { at: 1.0, rx: FACE_ON + 0.5, rz: 0.42, x: 1.02, my: 0.66, s: 0.95, ms: 0.78, explode: 0 },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

function poseAt(p: number): Pose {
  const i = Math.max(0, POSES.findIndex((k) => k.at >= p) - 1);
  const a = POSES[i];
  const b = POSES[Math.min(POSES.length - 1, i + 1)];
  const t = b.at === a.at ? 0 : smooth(THREE.MathUtils.clamp((p - a.at) / (b.at - a.at), 0, 1));
  const l = (k: keyof Omit<Pose, "at">) => a[k] + (b[k] - a[k]) * t;
  return { at: p, rx: l("rx"), rz: l("rz"), x: l("x"), my: l("my"), s: l("s"), ms: l("ms"), explode: l("explode") };
}

type MarkerEls = MutableRefObject<(HTMLElement | null)[]>;

function Rig({ progressRef, markerEls }: { progressRef: MutableRefObject<number>; markerEls: MarkerEls }) {
  const group = useRef<THREE.Group>(null);
  const explodeRef = useRef(0);
  const size = useThree((s) => s.size);
  const cur = useRef<Pose | null>(null);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const target = poseAt(progressRef.current);
    if (!cur.current) cur.current = { ...target };
    const c = cur.current;
    const k = 6;
    for (const key of ["rx", "rz", "x", "my", "s", "ms", "explode"] as const) {
      c[key] = THREE.MathUtils.damp(c[key], target[key], k, dt);
    }
    const mobile = size.width < 768;
    const t = state.clock.elapsedTime;
    g.rotation.set(c.rx + Math.sin(t * 0.6) * 0.03, 0, c.rz + Math.sin(t * 0.45) * 0.03);
    g.position.set(mobile ? 0 : c.x, (mobile ? c.my : 0) + Math.sin(t * 0.9) * 0.025, 0);
    g.scale.setScalar(c.s * (mobile ? 0.6 * c.ms : 1));
    explodeRef.current = c.explode;
  });

  return (
    <group ref={group}>
      {/* centre the pad on its own mid-height so rotations pivot nicely */}
      <group position={[0, -STOCK.thickness * 0.01, 0]}>
        <PadModel build={STOCK} explodeRef={explodeRef} markerEls={markerEls} />
      </group>
    </group>
  );
}

export default function HeroScene({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const markerEls: MarkerEls = useRef([]);
  return (
    <PadCanvas
      className="absolute inset-0"
      camera={{ z: 5, fov: 30 }}
      label="Spitfire Green polishing pad, rotating in 3D"
      overlay={<LayerMarkers els={markerEls} />}
    >
      <Rig progressRef={progressRef} markerEls={markerEls} />
    </PadCanvas>
  );
}
