"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RangeBands } from "@/components/RangeBands";
import { Wordmark } from "@/components/Wordmark";

const OgScene = dynamic(() => import("./OgScene"), { ssr: false });

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
      {/* studio light: a soft gold key behind the pads, a warm floor, fine grain */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 70% at 72% 50%, rgba(236,211,160,0.16), rgba(201,154,74,0.07) 45%, transparent 72%), radial-gradient(60% 45% at 60% 110%, rgba(201,154,74,0.1), transparent 70%)",
        }}
      />
      <div className="pk-studio__grain" />
      <div className="pk-studio__vignette" />

      <OgScene />

      <div className="absolute left-[72px] top-[60px]">
        <Wordmark size="lg" />
      </div>
      <div className="absolute bottom-[64px] left-[72px]">
        <h1 className="pk-display text-[74px]">
          <span className="block text-text">Build your</span>
          <span className="pk-gold-text block w-fit pr-[0.04em]">own pad.</span>
        </h1>
        <RangeBands size="md" className="mt-8" />
        <p className="pk-mono mt-5 text-[15px] uppercase tracking-[0.22em] text-text-2">
          Custom builds <span className="text-gold">·</span> Pad Match <span className="text-gold">·</span> The range
        </p>
      </div>
    </div>,
    host,
  );
}
