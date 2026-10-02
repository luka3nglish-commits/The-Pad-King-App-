"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useState } from "react";
import { track } from "@/lib/analytics";
import { PICKS, STAGE_LABEL, buyHref, picksFor, type Stage } from "@/lib/match";
import { PADS, padById } from "@/lib/pads";
import { ProductArt } from "./ProductArt";

const PadStage = dynamic(() => import("@/components/three/PadStage"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      <div className="size-[45%] rounded-full bg-[radial-gradient(circle,rgba(201,154,74,0.18),transparent_65%)] blur-2xl" />
    </div>
  ),
});

const STAGE_STYLE: Record<Stage, string> = {
  cut: "border-orange/55 text-orange",
  "one-step": "border-gold/60 text-gold-hi",
  finish: "border-line-2 text-text",
};

export function PadMatch() {
  const [padId, setPadId] = useState("spitfire");
  const name = useId();
  const pad = padById(padId)!;
  const picks = picksFor(pad.id);
  const mattCount = picks.filter((p) => p.matt).length;

  // deep links: /match?pad=midas (from the Range tab, or a shared link)
  useEffect(() => {
    const fromUrl = padById(new URLSearchParams(window.location.search).get("pad"));
    // read after hydration on purpose: the page is prerendered, so the URL isn't known on the server
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromUrl) setPadId(fromUrl.id);
  }, []);

  const choose = (id: string) => {
    setPadId(id);
    track("match_select", { pad: id });
    const url = new URL(window.location.href);
    url.searchParams.set("pad", id);
    window.history.replaceState(null, "", url);
  };

  return (
    // phones: picker → pad → polishes (tap and see it change). Wider: pad left (sticky), picker + polishes right.
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-x-10 md:gap-y-8">
      {/* stage */}
      <div className="md:sticky md:top-[calc(var(--pk-header-h)+24px)] md:col-start-1 md:row-span-2 md:row-start-1 md:self-start">
        <div className="pk-glass pk-solid relative aspect-[4/3] overflow-hidden rounded-[28px] md:aspect-square">
          <div
            className="absolute inset-0 transition-[background] duration-700"
            style={{ background: `radial-gradient(70% 55% at 50% 55%, ${pad.color}22, transparent 70%)` }}
            aria-hidden
          />
          <PadStage pad={pad} label={`${pad.name} pad in 3D. Drag to rotate.`} />
          <div className="pointer-events-none absolute inset-x-0 top-0 p-5 md:p-6">
            <p className="pk-mono text-[10px] uppercase tracking-[0.2em] text-muted">Selected pad</p>
            <p key={pad.id} className="pk-display pk-fade-up mt-2 text-[clamp(20px,5.3vw,40px)] md:text-[clamp(26px,3vw,40px)]">
              {pad.name}
            </p>
            <p className="pk-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-gold-hi">{pad.role}</p>
          </div>
        </div>
        <div key={pad.id} className="pk-fade-up mt-4 px-1">
          <p className="max-w-[48ch] text-[15px] leading-snug text-text-2">{pad.blurb}</p>
          {pad.tip && (
            <p className="mt-2.5 flex gap-2.5 text-[14px] leading-snug text-text">
              <span className="pk-mono shrink-0 pt-px text-[12px] text-gold">TIP</span>
              {pad.tip}
            </p>
          )}
        </div>
      </div>

      {/* picker */}
      <div className="-order-1 md:order-none md:col-start-2 md:row-start-1">
        <fieldset>
          <legend className="mb-3 font-display text-[13px] font-bold uppercase tracking-wide [font-stretch:115%]">Tap a pad</legend>
          <div className="grid grid-cols-5 gap-2">
            {PADS.map((p) => (
              <label key={p.id} className="pk-option flex cursor-pointer flex-col items-center gap-2 rounded-2xl px-1 pb-2.5 pt-3">
                <input type="radio" name={name} className="sr-only" checked={p.id === padId} onChange={() => choose(p.id)} />
                <span
                  className="size-9 rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.25),0_0_0_1px_rgba(245,242,234,0.12)]"
                  // product chip: the pad's real foam colour, matching the 3D render
                style={{ background: `radial-gradient(circle at 35% 30%, ${p.foam ?? p.color}, ${p.foam ?? p.color}cc 60%, ${p.foam ?? p.color}88)` }}
                  aria-hidden
                />
                <span className="text-center text-[11px] font-semibold leading-tight sm:text-[12px]">
                  {p.short}
                  <span className="sr-only"> ({p.name})</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* picks */}
      <div className="md:col-start-2 md:row-start-2">
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-6">
          <div>
            <p className="pk-eyebrow">
              {picks.length} polishes · {mattCount} of Matt&apos;s picks
            </p>
            <h2 className="mt-2 font-display text-[22px] font-bold uppercase leading-tight tracking-wide [font-stretch:115%] md:text-[26px]">
              Polishes for {pad.name}
            </h2>
          </div>
        </div>

        <ul key={pad.id} className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {picks.map(({ polish, note, matt }, i) => (
            <li
              key={polish.id}
              className="pk-glass pk-card-in group flex flex-col overflow-hidden rounded-[22px]"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              {/* product image */}
              <div
                className="relative flex h-[188px] items-end justify-center border-b border-line pb-3"
                style={{
                  background: `radial-gradient(70% 60% at 50% 62%, ${pad.color}40, transparent 72%), radial-gradient(40% 10% at 50% 92%, rgba(0,0,0,0.75), transparent 80%), #0d0d10`,
                }}
              >
                <ProductArt
                  polish={polish}
                  className="h-[136px] w-auto drop-shadow-[0_14px_16px_rgba(0,0,0,0.65)] transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-2"
                />
                {matt && (
                  <span className="pk-mono absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-bg shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <svg width="9" height="8" viewBox="0 0 26 22" aria-hidden>
                      <path d="M3 15 1.5 3.5l6 5L13 1l5.5 7.5 6-5L23 15Z" fill="currentColor" />
                    </svg>
                    Matt&apos;s pick
                  </span>
                )}
                <span
                  className={`pk-mono absolute bottom-2.5 left-2.5 rounded-full border bg-bg/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] backdrop-blur ${STAGE_STYLE[polish.stages[0]]}`}
                >
                  {polish.stages.map((st) => STAGE_LABEL[st]).join(" → ")}
                </span>
              </div>
              {/* details */}
              <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                <p className="pk-mono text-[10px] uppercase tracking-[0.18em] text-text-2">{polish.brand}</p>
                <p className="font-display text-[15px] font-bold leading-tight [font-stretch:108%] sm:text-[16px]">{polish.name}</p>
                {polish.spec && <p className="pk-mono text-[10px] text-muted">{polish.spec}</p>}
                {note && <p className="text-[13px] leading-snug text-gold-hi">&ldquo;{note}&rdquo;</p>}
                <a
                  href={buyHref(polish)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("stockist_click", { pad: pad.id, polish: polish.id })}
                  className="mt-auto inline-flex h-9 items-center gap-1.5 self-start pt-1 text-[12.5px] font-semibold text-text-2 transition-colors hover:text-gold-hi"
                >
                  Find a stockist
                  <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
                    <path d="M4 2h6v6M10 2 3 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[12px] leading-snug text-muted">
          Matt&apos;s picks come from The Pad King&apos;s own write-ups (
          <a href={PICKS[pad.id].sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-line-2 underline-offset-2 hover:text-text-2">
            thepadking.com.au
          </a>
          ). The rest are matched to what this pad does, from 3D, Sonax, Koch Chemie and P&amp;S.
        </p>
      </div>
    </div>
  );
}
