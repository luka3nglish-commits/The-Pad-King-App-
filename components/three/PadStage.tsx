"use client";

import { PresentationControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { PadCanvas } from "@/components/three/PadCanvas";
import { PadModel, type PadModelProps } from "@/components/three/PadModel";
import type { PadShape } from "@/lib/pad/geometry";
import type { Pad } from "@/lib/pads";

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

function Rig({ pad, layout }: { pad: Pad; layout: Layout }) {
  const model = stockModel(pad);
  const shape = model.build;
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
              <PadModel {...model} />
            </group>
          </group>
        </group>
      </PresentationControls>
    </group>
  );
}

export default function PadStage({ pad, label, layout = "card" }: { pad: Pad; label: string; layout?: Layout }) {
  return (
    <PadCanvas className="absolute inset-0 cursor-grab active:cursor-grabbing" camera={{ z: 5, fov: 30 }} label={label}>
      <Rig pad={pad} layout={layout} />
    </PadCanvas>
  );
}

/** Stock pad shape for a catalogue entry: its own edge (the shop pads' by default), plain face. */
export function stockShape(pad: Pad): PadShape {
  return { size: 75, thickness: pad.shape.thickness, edge: pad.shape.edge ?? "stock", face: "flat" };
}

/**
 * Everything PadModel needs to draw a catalogue pad as photographed: foam,
 * backing layer, velcro and print. A stock pad shows no separate interface
 * layer from the outside, so it's drawn as more of the foam.
 */
export function stockModel(pad: Pad): PadModelProps {
  const foam = pad.foam ?? pad.color;
  return {
    build: stockShape(pad),
    color: foam,
    seamless: true,
    band: pad.backing && { from: pad.backing.from, to: 1.2, color: pad.backing.color, grain: 0.45 },
    velcroColor: pad.velcro?.color,
    velcroRibs: pad.velcro?.ribs,
    backPrint: pad.print,
  };
}
