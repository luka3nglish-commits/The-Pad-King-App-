"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

interface PadCanvasProps {
  children: ReactNode;
  className?: string;
  /** Camera distance and field of view. */
  camera?: { z?: number; fov?: number };
  label: string;
  /** DOM layered over the canvas (e.g. LayerMarkers). */
  overlay?: ReactNode;
}

/**
 * Shared studio for every pad render: warm key, gold rim, orange kicker, soft
 * light-formers for the foam sheen. Renders only while on screen and drops
 * resolution if the device can't hold frame rate.
 */
export function PadCanvas({ children, className, camera, label, overlay }: PadCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState(1.75);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className} role="img" aria-label={label}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, dpr]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, camera?.z ?? 4.2], fov: camera?.fov ?? 30, near: 0.1, far: 50 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NeutralToneMapping; // keeps the Spitfire green true to the product
          gl.toneMappingExposure = 1.05;
          gl.setClearColor(0x000000, 0);
        }}
        style={{ touchAction: "pan-y" }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
        <ambientLight intensity={0.22} />
        {/* warm key, high right */}
        <directionalLight position={[2.5, 4, 5]} intensity={2.0} color="#fff4e2" />
        {/* soft front fill from the camera so faces turned to the viewer never go muddy */}
        <directionalLight position={[-0.5, -0.6, 6]} intensity={1.1} color="#fffaf0" />
        {/* gold rim from behind-left */}
        <directionalLight position={[-4, 2.5, -3]} intensity={2.7} color="#c9a55c" />
        {/* orange kicker, low right — the "touch of orange" */}
        <pointLight position={[3.4, -1.8, 0.6]} intensity={3.2} distance={8} decay={1.8} color="#ff7a1a" />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={1.6} color="#fff1d6" position={[0, 4, 3]} scale={[8, 3, 1]} />
          <Lightformer form="rect" intensity={2.4} color="#c9a55c" position={[-5, 1, -2]} rotation-y={Math.PI / 2.5} scale={[4, 6, 1]} />
          <Lightformer form="ring" intensity={0.8} color="#ff7a1a" position={[4, -2, 2]} scale={2} />
        </Environment>
        {children}
      </Canvas>
      {overlay}
    </div>
  );
}
