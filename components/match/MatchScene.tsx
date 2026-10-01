"use client";

import { PresentationControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { PadCanvas } from "@/components/three/PadCanvas";
import { PadModel } from "@/components/three/PadModel";
import type { PadShape } from "@/lib/pad/geometry";

function Rig({ shape, color }: { shape: PadShape; color: string }) {
  const spin = useRef<THREE.Group>(null);
  const centre = useRef<THREE.Group>(null);
  const lift = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.22;
    if (centre.current) centre.current.position.y = THREE.MathUtils.damp(centre.current.position.y, -shape.thickness * 0.01, 6, dt);
    // sit the pad below the name overlay, with breathing room on every side
    const wide = state.size.width / state.size.height > 1;
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, wide ? 5.5 : 5.8, 4, dt);
    if (lift.current) lift.current.position.y = THREE.MathUtils.damp(lift.current.position.y, wide ? -0.44 : -0.28, 4, dt);
  });

  return (
    <group ref={lift}>
      <PresentationControls global={false} cursor snap speed={1.4} rotation={[0.5, 0, 0]} polar={[-0.9, 1.1]} azimuth={[-Infinity, Infinity]}>
        <group rotation={[-Math.PI / 2 + 0.15, 0, 0]}>
          <group ref={spin}>
            <group ref={centre}>
              <PadModel build={shape} color={color} />
            </group>
          </group>
        </group>
      </PresentationControls>
    </group>
  );
}

export default function MatchScene({ shape, color, label }: { shape: PadShape; color: string; label: string }) {
  return (
    <PadCanvas className="absolute inset-0 cursor-grab active:cursor-grabbing" camera={{ z: 4, fov: 30 }} label={label}>
      <Rig shape={shape} color={color} />
    </PadCanvas>
  );
}
