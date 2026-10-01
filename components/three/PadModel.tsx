"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { INTERFACE_T, VELCRO_T, dimsOf, padState, type PadShape } from "@/lib/pad/geometry";
import { FOAM } from "@/lib/pad/options";
import { PadGeometrySet } from "@/lib/pad/padMesh";
import { createSurfaceMaterial } from "@/lib/pad/foamMaterial";

/** Scene units per millimetre. A 75 mm pad ≈ 1.5 units across. */
export const MM = 0.02;

const MORPH_MS = 520;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export interface PadModelProps {
  build: PadShape;
  /** 0 = assembled, 1 = layers fully separated. Ref so scroll can drive it without re-rendering. */
  explodeRef?: MutableRefObject<number>;
  /** DOM markers (see LayerMarkers) pinned to velcro / interface / foam while exploded. */
  markerEls?: MutableRefObject<(HTMLElement | null)[]>;
  /** Multiplier on how far the layers separate. */
  explodeScale?: number;
  /** Foam colour; changes blend smoothly. Defaults to Spitfire Green. */
  color?: string;
}

const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _right = new THREE.Vector3();

const WHITE = new THREE.Color("#ffffff");

export function PadModel({ build, explodeRef, markerEls, explodeScale = 1, color = FOAM.color }: PadModelProps) {
  const targetColor = useMemo(() => new THREE.Color(color), [color]);
  const anchors = useRef<(THREE.Object3D | null)[]>([]);
  const set = useMemo(() => new PadGeometrySet(padState(build)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const morph = useRef({ start: 0, active: false });
  const ifaceRef = useRef<THREE.Mesh>(null);
  const velcroRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Group>(null);
  const explodeEased = useRef(0);

  const key = `${build.size}|${build.thickness}|${build.edge}|${build.face}`;
  useEffect(() => {
    set.retarget(padState(build));
    morph.current = { start: performance.now(), active: true };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, set]);

  useEffect(() => () => set.dispose(), [set]);

  const materials = useMemo(() => {
    const foamParams = {
      color: new THREE.Color(color),
      roughness: 0.86,
      metalness: 0,
      sheen: 0.55,
      sheenRoughness: 0.65,
      // a gentle lift only: too much white sheen reads as fluro
      sheenColor: new THREE.Color(color).lerp(WHITE, 0.3),
    };
    const face = createSurfaceMaterial("face", foamParams);
    const foam = createSurfaceMaterial("foam", foamParams);
    const iface = createSurfaceMaterial("foam", { color: "#3c4048", roughness: 0.62, metalness: 0 });
    iface.uniforms.uBump.value = 0.2;
    const velcro = createSurfaceMaterial("fabric", {
      color: "#545a66",
      roughness: 1,
      sheen: 1,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color("#8a8a98"),
    });
    return { face, foam, iface, velcro };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- colour changes are blended in useFrame

  useEffect(
    () => () => {
      for (const m of Object.values(materials)) m.material.dispose();
    },
    [materials],
  );

  useFrame((state, dt) => {
    const m = morph.current;
    if (m.active) {
      const t = Math.min(1, (performance.now() - m.start) / MORPH_MS);
      set.apply(easeInOutCubic(t));
      if (t >= 1) m.active = false;
    }
    // blend towards the requested foam colour (sheen follows, lifted towards white)
    for (const m of [materials.face.material, materials.foam.material]) {
      if (!m.color.equals(targetColor)) {
        m.color.lerp(targetColor, 1 - Math.exp(-dt * 7));
        m.sheenColor.copy(m.color).lerp(WHITE, 0.3);
      }
    }
    const u = materials.face.uniforms;
    u.uPat.value.set(set.pat[0], set.pat[1], set.pat[2], set.pat[3]);
    u.uFaceR.value.set(set.faceR[0], set.faceR[1]);
    const target = explodeRef?.current ?? 0;
    explodeEased.current = THREE.MathUtils.damp(explodeEased.current, target, 8, dt);
    const e = explodeEased.current;
    // layers lift off the foam in mm, scaled by pad size so small pads still read
    const lift = Math.max(6, build.size * 0.16) * explodeScale;
    if (ifaceRef.current) ifaceRef.current.position.y = e * lift;
    if (velcroRef.current) velcroRef.current.position.y = e * lift * 2.1;
    if (foamRef.current) foamRef.current.position.y = -e * lift * 0.3;
    if (markerEls) {
      const o = THREE.MathUtils.smoothstep(e, 0.55, 0.95);
      const { width, height } = state.size;
      const rv = build.size / 2 + 2;
      _right.setFromMatrixColumn(state.camera.matrixWorld, 0);
      anchors.current.forEach((a, i) => {
        const el = markerEls.current[i];
        if (!a || !el) return;
        el.style.opacity = o.toFixed(3);
        if (o <= 0) return;
        // layer centre on the axis, pushed to the pad's left silhouette in screen space
        a.getWorldPosition(_v);
        a.getWorldScale(_s);
        _v.addScaledVector(_right, -rv * _s.x).project(state.camera);
        el.style.transform = `translate3d(${(((_v.x + 1) / 2) * width).toFixed(1)}px, ${(((1 - _v.y) / 2) * height).toFixed(1)}px, 0)`;
      });
    }
  });

  const d = dimsOf(build);
  const anchor = (i: number, y: number) => (
    <object3D
      position={[0, y, 0]}
      ref={(o: THREE.Object3D | null) => {
        anchors.current[i] = o;
      }}
    />
  );

  return (
    <group scale={MM}>
      <group ref={foamRef}>
        {markerEls && anchor(2, d.Hf / 2)}
        <mesh geometry={set.geo.side} material={materials.foam.material} />
        <mesh geometry={set.geo.face} material={materials.face.material} />
        <mesh geometry={set.geo.hole} material={materials.foam.material} />
        <mesh geometry={set.geo.top} material={materials.foam.material} />
      </group>
      <mesh ref={ifaceRef} geometry={set.geo.iface} material={materials.iface.material}>
        {markerEls && anchor(1, d.Hf + INTERFACE_T / 2)}
      </mesh>
      <mesh ref={velcroRef} geometry={set.geo.velcro} material={materials.velcro.material}>
        {markerEls && anchor(0, d.T - VELCRO_T / 2)}
      </mesh>
    </group>
  );
}
