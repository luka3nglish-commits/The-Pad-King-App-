"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Wordmark } from "@/components/Wordmark";
import { TIGER_H, TIGER_W, tigerStripePaths } from "@/lib/tiger";

const OgScene = dynamic(() => import("./OgScene"), { ssr: false });
const PATHS = tigerStripePaths(2024);

/**
 * The 1200×630 share card (the picture shown when the app is shared in
 * Messages, Facebook, WhatsApp...). scripts/og.mjs screenshots it into
 * app/opengraph-image.jpg. Portalled to <body> so it sits clear of the app shell.
 */
export function OgCard() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  // portal target only exists in the browser
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHost(document.body), []);
  if (!host) return null;

  return createPortal(
    <div id="og-card" className="fixed left-0 top-0 z-[300] h-[630px] w-[1200px] overflow-hidden bg-bg [--pk-sheen-pos:38%]">
      {/* light that shows through the stripes */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(38% 62% at 74% 52%, rgba(201,154,74,0.34), transparent 70%), radial-gradient(30% 40% at 90% 86%, rgba(226,98,27,0.28), transparent 70%)",
        }}
      />
      <svg className="absolute inset-0 size-full" viewBox={`0 0 ${TIGER_W} ${TIGER_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <g id="og-stripes">
            {PATHS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <mask id="og-cut" maskUnits="userSpaceOnUse" x="0" y="0" width={TIGER_W} height={TIGER_H}>
            <rect width={TIGER_W} height={TIGER_H} fill="white" />
            <use href="#og-stripes" fill="black" />
          </mask>
        </defs>
        <rect width={TIGER_W} height={TIGER_H} fill="var(--pk-bg)" mask="url(#og-cut)" />
        <use href="#og-stripes" fill="rgba(22, 22, 27, 0.55)" />
      </svg>
      {/* halo straight behind the pads */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(24% 40% at 72% 50%, rgba(201,154,74,0.16), transparent 72%)" }} />

      <OgScene />

      <div className="absolute left-[72px] top-[60px]">
        <Wordmark size="lg" />
      </div>
      <div className="absolute bottom-[64px] left-[72px]">
        <h1 className="pk-display text-[74px]">
          <span className="block text-text">Build your</span>
          <span className="pk-gold-text block w-fit pr-[0.04em]">own pad.</span>
        </h1>
        <p className="pk-mono mt-7 text-[15px] uppercase tracking-[0.22em] text-text-2">
          Custom builds <span className="text-gold">·</span> Pad Match <span className="text-gold">·</span> The range
        </p>
      </div>
    </div>,
    host,
  );
}
