"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { stockShape } from "@/components/three/PadStage";
import { track } from "@/lib/analytics";
import { PADS, padById } from "@/lib/pads";

const PadStage = dynamic(() => import("@/components/three/PadStage"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center md:place-items-end md:pr-[18%]" aria-hidden>
      <div className="size-[42%] rounded-full bg-[radial-gradient(circle,rgba(201,154,74,0.18),transparent_65%)] blur-2xl md:mb-[12%] md:size-[34%]" />
    </div>
  ),
});

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={dir === "left" ? "rotate-180" : undefined}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The Range tab: Apple-style showroom. One big 3D stage, a lineup to switch pads,
 * the published specs, and a buy button straight to the pad's product page.
 */
export function RangeShowroom() {
  const [padId, setPadId] = useState("spitfire");
  const name = useId();
  const index = PADS.findIndex((p) => p.id === padId);
  const pad = PADS[index];

  // deep links: /range?pad=midas
  useEffect(() => {
    const fromUrl = padById(new URLSearchParams(window.location.search).get("pad"));
    // read after hydration on purpose: the page is prerendered, so the URL isn't known on the server
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromUrl) setPadId(fromUrl.id);
  }, []);

  const choose = (id: string) => {
    setPadId(id);
    track("range_select", { pad: id });
    const url = new URL(window.location.href);
    url.searchParams.set("pad", id);
    window.history.replaceState(null, "", url);
  };
  const step = (d: number) => choose(PADS[(index + d + PADS.length) % PADS.length].id);

  return (
    <div>
      {/* stage */}
      <div className="pk-glass pk-solid relative aspect-square overflow-hidden rounded-[28px] md:aspect-[2/1]">
        <div
          className="absolute inset-0 transition-[background] duration-700"
          style={{ background: `radial-gradient(55% 70% at 70% 55%, ${pad.color}26, transparent 70%)` }}
          aria-hidden
        />
        <PadStage shape={stockShape(pad.shape.thickness)} color={pad.foam ?? pad.color} print={pad.print} layout="showroom" label={`${pad.name} in 3D. Drag to rotate.`} />

        <div className="pointer-events-none absolute inset-x-0 top-0 p-5 md:inset-y-0 md:right-auto md:flex md:w-[48%] md:flex-col md:justify-center md:p-10">
          <p className="pk-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            0{index + 1} <span className="text-line-2">/</span> 0{PADS.length}
          </p>
          <h2 key={pad.id} className="pk-display pk-fade-up mt-2 text-[clamp(24px,6.6vw,40px)] md:mt-4 md:text-[clamp(40px,4.6vw,72px)]">
            {pad.name}
          </h2>
          <p className="pk-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-gold-hi md:mt-4 md:text-[12px]">{pad.role}</p>
          <p key={`b-${pad.id}`} className="pk-fade-up mt-5 hidden max-w-[40ch] text-[16px] leading-relaxed text-text-2 md:block">
            {pad.blurb}
          </p>
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2 md:bottom-6 md:right-6">
          <button type="button" onClick={() => step(-1)} className="pk-glass grid size-11 place-items-center rounded-full text-text-2 transition-colors hover:text-gold-hi" aria-label="Previous pad">
            <Arrow dir="left" />
          </button>
          <button type="button" onClick={() => step(1)} className="pk-glass grid size-11 place-items-center rounded-full text-text-2 transition-colors hover:text-gold-hi" aria-label="Next pad">
            <Arrow dir="right" />
          </button>
        </div>
        <p className="pk-mono pointer-events-none absolute bottom-6 left-5 hidden text-[10px] uppercase tracking-[0.2em] text-muted md:block md:left-10">
          Drag to rotate
        </p>
      </div>

      {/* lineup */}
      <fieldset className="mt-4">
        <legend className="sr-only">Choose a pad</legend>
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {PADS.map((p) => (
            <label key={p.id} className="pk-option flex cursor-pointer flex-col items-center gap-2 rounded-2xl px-1 pb-2.5 pt-3 md:flex-row md:justify-center md:gap-3 md:px-3 md:py-3">
              <input type="radio" name={name} className="sr-only" checked={p.id === padId} onChange={() => choose(p.id)} />
              <span
                className="size-9 shrink-0 rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.25),0_0_0_1px_rgba(245,242,234,0.12)] md:size-8"
                // product chip: the pad's real foam colour, matching the 3D render
                style={{ background: `radial-gradient(circle at 35% 30%, ${p.foam ?? p.color}, ${p.foam ?? p.color}cc 60%, ${p.foam ?? p.color}88)` }}
                aria-hidden
              />
              <span className="text-center text-[11px] font-semibold leading-tight sm:text-[12px] md:text-left md:text-[13px]">
                {p.short}
                <span className="sr-only"> ({p.name})</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* detail */}
      <div key={pad.id} className="pk-fade-up mt-8 grid gap-6 md:mt-10 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-10">
        <div>
          <p className="max-w-[52ch] text-[16px] leading-relaxed text-text-2 md:hidden">{pad.blurb}</p>
          {pad.tip && (
            <p className="mt-3 flex gap-2.5 text-[14px] leading-snug text-text md:mt-0">
              <span className="pk-mono shrink-0 pt-px text-[12px] text-gold">TIP</span>
              {pad.tip}
            </p>
          )}
          <dl className="mt-6 border-t border-line">
            {pad.specs.map((s) => (
              <div key={s.label} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-4 border-b border-line py-3.5">
                <dt className="pk-mono pt-0.5 text-[10.5px] uppercase tracking-[0.16em] text-muted">{s.label}</dt>
                <dd className="text-[15px] leading-snug text-text">{s.value}</dd>
              </div>
            ))}
            {pad.sizes && (
              <div className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-4 border-b border-line py-3.5">
                <dt className="pk-mono pt-1.5 text-[10.5px] uppercase tracking-[0.16em] text-muted">Sizes</dt>
                <dd className="flex flex-wrap gap-2">
                  {pad.sizes.map((size) => (
                    <span key={size} className="pk-mono rounded-full border border-line-2 px-3 py-1 text-[13px] text-text">
                      {size}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="pk-glass self-start rounded-[28px] p-5 md:p-7">
          <p className="pk-eyebrow">Get it</p>
          <a
            href={pad.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("range_buy_click", { pad: pad.id })}
            className="pk-btn-gold mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[16px]"
          >
            Buy the {pad.short}
            <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden>
              <path d="M4 2h6v6M10 2 3 9" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
            <span className="sr-only">on thepadking.com.au (opens in a new tab)</span>
          </a>
          <p className="mt-2.5 text-center text-[12px] text-muted">Opens The Pad King store</p>

          <div className="mt-5 grid gap-2 border-t border-line pt-5">
            <Link href={`/match?pad=${pad.id}`} className="flex h-12 items-center justify-between rounded-xl px-1 text-[15px] font-semibold text-text transition-colors hover:text-gold-hi">
              Polishes for this pad
              <Arrow dir="right" />
            </Link>
            {pad.id === "spitfire" && (
              <Link href="/build" className="flex h-12 items-center justify-between rounded-xl px-1 text-[15px] font-semibold text-text transition-colors hover:text-gold-hi">
                Build a custom Spitfire
                <Arrow dir="right" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
