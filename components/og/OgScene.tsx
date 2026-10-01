"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PadCanvas } from "@/components/three/PadCanvas";
import { PadModel } from "@/components/three/PadModel";
import { stockShape } from "@/components/three/PadStage";
import { PADS } from "@/lib/pads";

/**
 * Flags the page once a few frames have drawn, so scripts/og.mjs knows when to
 * shoot. The scene is static; headless software rendering is just slow.
 */
function Ready() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 12) document.documentElement.dataset.ogReady = "1";
  });
  return null;
}

// front to back: Spitfire leads, the rest of the range fans out behind it
const LINEUP = ["spitfire", "midas", "lone-star", "frostbite", "afterburner"].map((id) => PADS.find((p) => p.id === id)!);

/** The whole range lined up like a colour lineup, Spitfire at the front. */
export default function OgScene() {
  return (
    <PadCanvas className="absolute inset-0" camera={{ z: 6, fov: 30 }} label="The Pad King range in 3D">
      <group position={[1.08, 0.02, 0]}>
        {LINEUP.map((p, i) => (
          <group key={p.id} position={[i * 0.5, i * 0.03, -i * 0.4]} rotation={[0.06, 0.6, 0]}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <group position={[0, -p.shape.thickness * 0.01, 0]}>
                <PadModel build={stockShape(p.shape.thickness)} color={p.color} />
              </group>
            </group>
          </group>
        ))}
      </group>
      <Ready />
    </PadCanvas>
  );
}
