"use client";

import { PresentationControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { PadCanvas } from "@/components/three/PadCanvas";
import { PadModel } from "@/components/three/PadModel";
import type { PadShape } from "@/lib/pad/geometry";

/**
 * A single stock pad on a turntable: drag to rotate, slow idle spin, colour and
 * shape blend when the pad changes. Used by Pad Match and the Range showroom.
 *
 * layout "card":     pad centred, sitting below a title overlay (Pad Match).
 * layout "showroom": wide stage, pad pushed right of a big title on desktop (Range).
 */
type Layout = "card" | "showroom";

function frame(layout: Layout, w: number, h: number) {
  const wide = w / h > 1;
  if (layout === "showroom" && w >= 768) return { z: 4.4, x: 0.95, y: -0.12 };
  if (layout === "showroom") return { z: 5.6, x: 0, y: -0.52 };
  return wide ? { z: 5.5, x: 0, y: -0.44 } : { z: 5.8, x: 0, y: -0.28 };
}

function Rig({ shape, color, layout }: { shape: PadShape; color: string; layout: Layout }) {
  const spin = useRef<THREE.Group>(null);
  const centre = useRef<THREE.Group>(null);
  const place = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.22;
    if (centre.current) centre.current.position.y = THREE.MathUtils.damp(centre.current.position.y, -shape.thickness * 0.01, 6, dt);
    const f = frame(layout, state.size.width, state.size.height);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, f.z, 4, dt);
    if (place.current) {
      place.current.position.x = THREE.MathUtils.damp(place.current.position.x, f.x, 4, dt);
      place.current.position.y = THREE.MathUtils.damp(place.current.position.y, f.y, 4, dt);
    }
  });

  return (
    <group ref={place}>
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

export default function PadStage({ shape, color, label, layout = "card" }: { shape: PadShape; color: string; label: string; layout?: Layout }) {
  return (
    <PadCanvas className="absolute inset-0 cursor-grab active:cursor-grabbing" camera={{ z: 5, fov: 30 }} label={label}>
      <Rig shape={shape} color={color} layout={layout} />
    </PadCanvas>
  );
}

/** Stock pad shape for a catalogue entry. */
export function stockShape(thickness: number): PadShape {
  return { size: 75, thickness, edge: "rounded", face: "flat" };
}
