"use client";

import dynamic from "next/dynamic";
import { useId, useState } from "react";
import { PADS, STAGE_LABEL, buyHref, picksFor, type PadEntry, type Stage } from "@/lib/match";
import type { PadShape } from "@/lib/pad/geometry";

const MatchScene = dynamic(() => import("./MatchScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      <div className="size-[45%] rounded-full bg-[radial-gradient(circle,rgba(201, 154, 74,0.18),transparent_65%)] blur-2xl" />
    </div>
  ),
});

const STAGE_STYLE: Record<Stage, string> = {
  cut: "border-orange/55 text-orange",
  "one-step": "border-gold/60 text-gold-hi",
  finish: "border-line-2 text-text",
};

function shapeOf(pad: PadEntry): PadShape {
  return { size: 75, thickness: pad.shape.thickness, edge: "rounded", face: "flat" };
}

export function PadMatch() {
  const [padId, setPadId] = useState("spitfire");
  const name = useId();
  const pad = PADS.find((p) => p.id === padId)!;
  const picks = picksFor(pad);
  const tested = pad.source === "tested";

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
          <MatchScene shape={shapeOf(pad)} color={pad.color} label={`${pad.name} pad in 3D. Drag to rotate.`} />
          <div className="pointer-events-none absolute inset-x-0 top-0 p-5 md:p-6">
            <p className="pk-mono text-[10px] uppercase tracking-[0.2em] text-muted">Selected pad</p>
            <p key={pad.id} className="pk-display pk-fade-up mt-2 text-[clamp(22px,5.8vw,40px)] md:text-[clamp(26px,3vw,40px)]">
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
                <input type="radio" name={name} className="sr-only" checked={p.id === padId} onChange={() => setPadId(p.id)} />
                <span
                  className="size-9 rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.25),0_0_0_1px_rgba(245,242,234,0.12)]"
                  style={{ background: `radial-gradient(circle at 35% 30%, ${p.color}, ${p.color}cc 60%, ${p.color}88)` }}
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
            <p className="pk-eyebrow">{tested ? "Matt's tested picks" : "General guidance"}</p>
            <h2 className="mt-2 font-display text-[22px] font-bold uppercase leading-tight tracking-wide [font-stretch:115%] md:text-[26px]">
              Polishes for {pad.name}
            </h2>
          </div>
          <p className="pk-mono text-[11px] uppercase tracking-[0.16em] text-muted">{picks.length} picks</p>
        </div>
        {!tested && (
          <p className="mt-3 rounded-xl border border-line-2 bg-bg/50 p-3 text-[13px] leading-snug text-text-2">
            Matt hasn&apos;t published pad-specific picks for the {pad.name} yet, so these are from his one-step correction guide.
          </p>
        )}

        <ul key={pad.id} className="mt-5 grid gap-3 sm:grid-cols-2">
          {picks.map(({ polish, note }, i) => (
            <li
              key={polish.id}
              className="pk-glass pk-card-in flex flex-col gap-3 rounded-[20px] p-4"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="pk-mono text-[10px] uppercase tracking-[0.18em] text-text-2">{polish.brand}</p>
                  <p className="mt-1 font-display text-[19px] font-bold leading-tight [font-stretch:110%]">{polish.name}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {polish.stages.length > 0 && (
                    <span className={`pk-mono rounded-full border px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] ${STAGE_STYLE[polish.stages[0]]}`}>
                      {polish.stages.map((s) => STAGE_LABEL[s]).join(" → ")}
                    </span>
                  )}
                </div>
              </div>
              {note && <p className="text-[14px] leading-snug text-gold-hi">&ldquo;{note}&rdquo;</p>}
              <a
                href={buyHref(polish)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex h-10 items-center gap-1.5 self-start rounded-full px-1 text-[13px] font-semibold text-text-2 transition-colors hover:text-gold-hi"
              >
                Find a stockist
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                  <path d="M4 2h6v6M10 2 3 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[12px] leading-snug text-muted">
          {tested ? "From The Pad King's own R&D testing — " : "From Matt's one-step correction guide — "}
          <a href={pad.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-line-2 underline-offset-2 hover:text-text-2">
            read it on thepadking.com.au
          </a>
          .
        </p>
      </div>
    </div>
  );
}
