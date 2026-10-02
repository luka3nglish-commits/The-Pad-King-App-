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
  /**
   * A stripe around the side, as fractions of the foam height measured from the
   * face (0) to the back (1) — e.g. a Gen II pad's interface layer, or the
   * Frostbite's backing foam. `grain` scales the foam's pores inside it (finer
   * layers < 1). `bandRef` (0–1) drives it without re-rendering; without one it
   * fades in and out on its own when the prop comes and goes.
   */
  band?: PadBand;
  bandRef?: MutableRefObject<number>;
  /** 0–1: heats the glue line (and warms the velcro) with an orange glow. */
  glowRef?: MutableRefObject<number>;
  /** Colour of the thin layer between foam and velcro. Defaults to a dark interface grey. */
  interfaceColor?: string;
  /**
   * Draw that layer as more of the foam it sits in (with any band over it):
   * the shop pads show no separate interface from the outside.
   */
  seamless?: boolean;
  /** Velcro loop colour. Defaults to the Spitfire's grey. */
  velcroColor?: string;
  /** Period (mm) of the knitted ribs across the velcro back, where the loop has them. */
  velcroRibs?: number;
  /** The logo printed on the velcro back (only Spitfire's is photographed so far). */
  backPrint?: "spitfire";
}

export interface PadBand {
  from: number;
  to: number;
  color: string;
  grain?: number;
}

/** Print masks lifted from Luka's photos of the real pads (public/textures). */
const PRINTS = { spitfire: "/textures/spitfire-back-print.png" } as const;
/** Velcro loop as photographed on the Spitfire: a neutral dark grey (the studio light is warm). */
export const VELCRO = "#4e5056";

const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _right = new THREE.Vector3();

const WHITE = new THREE.Color("#ffffff");

const GLOW = new THREE.Color("#e2621b");
/** How far the velcro's sheen lifts towards white (the Spitfire's grey loop → #8e9198). */
const VELCRO_SHEEN = 0.37;

export function PadModel({
  build,
  explodeRef,
  markerEls,
  explodeScale = 1,
  color = FOAM.foam,
  band,
  bandRef,
  glowRef,
  interfaceColor = "#3c4048",
  seamless = false,
  velcroColor = VELCRO,
  velcroRibs,
  backPrint,
}: PadModelProps) {
  const targetColor = useMemo(() => new THREE.Color(color), [color]);
  const targetIface = useMemo(() => new THREE.Color(interfaceColor), [interfaceColor]);
  const targetVelcro = useMemo(() => new THREE.Color(velcroColor), [velcroColor]);
  // the band fades out on its own when the prop goes, so keep drawing the last one
  const lastBand = useRef(band);
  const bandMix = useRef(band ? 1 : 0);
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
    // open-cell grain sized to what Luka's close-ups show: visible pores, not a smooth skin
    face.uniforms.uCell.value = 0.55;
    face.uniforms.uBump.value = 0.36;
    foam.uniforms.uCell.value = 0.85;
    foam.uniforms.uBump.value = 0.5;
    const iface = createSurfaceMaterial("foam", { color: interfaceColor, roughness: 0.62, metalness: 0 });
    iface.uniforms.uBump.value = 0.2;
    const velcro = createSurfaceMaterial("fabric", {
      color: velcroColor,
      roughness: 1,
      sheen: 1,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color(velcroColor).lerp(WHITE, VELCRO_SHEEN),
    });
    // one print texture for the session; whether it shows is a per-frame uniform
    const tex = new THREE.TextureLoader().load(PRINTS.spitfire);
    tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = 4;
    velcro.uniforms.uPrint.value = tex;
    return { face, foam, iface, velcro, tex };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- colour changes are blended in useFrame

  useEffect(
    () => () => {
      for (const m of [materials.face, materials.foam, materials.iface, materials.velcro]) m.material.dispose();
      materials.tex.dispose();
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
    // blend towards the requested colours (sheen follows, lifted towards white)
    const k = 1 - Math.exp(-dt * 7);
    for (const m of [materials.face.material, materials.foam.material]) {
      if (!m.color.equals(targetColor)) {
        m.color.lerp(targetColor, k);
        m.sheenColor.copy(m.color).lerp(WHITE, 0.3);
      }
    }
    if (!materials.iface.material.color.equals(targetIface)) materials.iface.material.color.lerp(targetIface, k);
    const vm = materials.velcro.material;
    if (!vm.color.equals(targetVelcro)) {
      vm.color.lerp(targetVelcro, k);
      vm.sheenColor.copy(vm.color).lerp(WHITE, VELCRO_SHEEN);
    }
    const u = materials.face.uniforms;
    materials.face.setPattern(set.pat);
    u.uFaceR.value.set(set.faceR[0], set.faceR[1]);
    if (band) lastBand.current = band;
    bandMix.current = band && bandRef ? bandRef.current : THREE.MathUtils.damp(bandMix.current, band ? 1 : 0, 7, dt);
    const b = lastBand.current;
    if (b) {
      const hf = dimsOf(build).Hf;
      for (const m of [materials.foam, materials.face]) {
        m.uniforms.uBand.value.set(b.from * hf, b.to * hf, bandMix.current, 0.35);
        m.uniforms.uBandColor.value.set(b.color);
        m.uniforms.uBandGrain.value = b.grain ?? 1;
      }
    }
    const dd = dimsOf(build);
    materials.velcro.uniforms.uPrintParams.value.set(backPrint ? 1 : 0, dd.T, dd.Rv, 0);
    materials.velcro.uniforms.uRib.value.set(velcroRibs ?? 1, velcroRibs ? 1 : 0);
    if (glowRef) {
      // the glue line between foam and velcro runs hot; the velcro only warms
      materials.iface.material.emissive.copy(GLOW).multiplyScalar(glowRef.current * 2.4);
      materials.velcro.material.emissive.copy(GLOW).multiplyScalar(glowRef.current * 0.12);
    }
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
      <mesh ref={ifaceRef} geometry={set.geo.iface} material={seamless ? materials.foam.material : materials.iface.material}>
        {markerEls && anchor(1, d.Hf + INTERFACE_T / 2)}
      </mesh>
      <mesh ref={velcroRef} geometry={set.geo.velcro} material={materials.velcro.material}>
        {markerEls && anchor(0, d.T - VELCRO_T / 2)}
      </mesh>
    </group>
  );
}
