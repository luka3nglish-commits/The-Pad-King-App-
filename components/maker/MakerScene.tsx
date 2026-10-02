"use client";

import { PresentationControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { PadCanvas } from "@/components/three/PadCanvas";
import { LayerMarkers } from "@/components/three/LayerMarkers";
import { PadModel } from "@/components/three/PadModel";
import type { PadBuild } from "@/lib/pad/options";

type MarkerEls = MutableRefObject<(HTMLElement | null)[]>;

function Rig({ build, explodeRef, markerEls }: { build: PadBuild; explodeRef: MutableRefObject<number>; markerEls: MarkerEls }) {
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const centre = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    // dolly with size so a 40 mm pad still fills the stage but visibly reads smaller than a 75
    const exploded = explodeRef.current > 0.5;
    const target = (state.size.width < 640 ? 0.6 : 0) + 2.5 + build.size * 0.03 + (exploded ? 0.9 : 0);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, target, 4, dt);
    if (spin.current) spin.current.rotation.y += dt * 0.18;
    // inspecting layers tips the pad onto its side so the stack separates in view
    if (tilt.current) tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, exploded ? 0.62 : 0, 5, dt);
    if (centre.current) {
      const y = -build.thickness * 0.01;
      centre.current.position.y = THREE.MathUtils.damp(centre.current.position.y, y, 6, dt);
    }
  });

  return (
    <PresentationControls
      global={false}
      cursor
      snap
      speed={1.4}
      rotation={[0.55, 0, 0]}
      polar={[-0.9, 1.1]}
      azimuth={[-Infinity, Infinity]}
    >
      <group ref={tilt}>
        <group rotation={[-Math.PI / 2 + 0.15, 0, 0]}>
          <group ref={spin}>
            <group ref={centre}>
              <PadModel build={build} explodeRef={explodeRef} markerEls={markerEls} explodeScale={1.5} backPrint="spitfire" />
            </group>
          </group>
        </group>
      </group>
    </PresentationControls>
  );
}

export default function MakerScene({ build, explodeRef }: { build: PadBuild; explodeRef: MutableRefObject<number> }) {
  const markerEls: MarkerEls = useRef([]);
  return (
    <PadCanvas
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      camera={{ z: 4.8, fov: 30 }}
      label="Your custom pad in 3D. Drag to rotate."
      overlay={<LayerMarkers els={markerEls} labels />}
    >
      <Rig build={build} explodeRef={explodeRef} markerEls={markerEls} />
    </PadCanvas>
  );
}
