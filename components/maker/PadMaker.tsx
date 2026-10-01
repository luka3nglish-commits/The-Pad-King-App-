"use client";

import dynamic from "next/dynamic";
import { useId, useRef, useState } from "react";
import {
  COMBINATIONS,
  DEFAULT_BUILD,
  EDGES,
  FACES,
  FOAM,
  SIZES,
  THICKNESSES,
  buildCode,
  edgeOf,
  faceOf,
  type PadBuild,
} from "@/lib/pad/options";
import { EdgeIcon, FaceIcon } from "./OptionIcons";
import { RequestSheet } from "./RequestSheet";

const MakerScene = dynamic(() => import("./MakerScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      <div className="size-[40%] rounded-full bg-[radial-gradient(circle,rgba(107,232,70,0.25),transparent_65%)] blur-2xl" />
    </div>
  ),
});

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <fieldset className="border-t border-line pt-6 first:border-t-0 first:pt-0" aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend className="float-left mb-4 flex w-full items-baseline justify-between gap-4">
        <span className="font-display text-[15px] font-bold uppercase tracking-wide [font-stretch:115%]">{title}</span>
        {hint && (
          <span id={`${id}-hint`} className="pk-mono text-[11px] text-muted">
            {hint}
          </span>
        )}
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function Tick() {
  return (
    <span className="pk-option__tick absolute right-2.5 top-2.5 grid size-4 place-items-center rounded-full bg-gold text-bg" aria-hidden>
      <svg width="9" height="9" viewBox="0 0 10 10">
        <path d="M2 5.2 4.2 7.4 8 3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function PadMaker() {
  const [build, setBuild] = useState<PadBuild>(DEFAULT_BUILD);
  const [exploded, setExploded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const explodeRef = useRef(0);
  const name = useId();

  const set = <K extends keyof PadBuild>(k: K, v: PadBuild[K]) => setBuild((b) => ({ ...b, [k]: v }));
  const toggleExplode = () => {
    setExploded((e) => {
      explodeRef.current = e ? 0 : 1;
      return !e;
    });
  };

  const edge = edgeOf(build.edge);
  const face = faceOf(build.face);

  return (
    <section id="build" className="relative z-10 pb-16" aria-labelledby="build-title">
      <div className="mx-auto max-w-[1280px] px-4 pt-20 sm:px-8 md:pt-28">
        <p className="pk-eyebrow mb-4">Pad Maker · {FOAM.name}</p>
        <h2 id="build-title" className="pk-display text-[clamp(44px,9vw,120px)]">
          Build <span className="pk-gold-text">yours.</span>
        </h2>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-text-2">
          {COMBINATIONS} combinations of size, height, edge and face. Pick yours, watch it take shape, and send the build
          straight to The Pad King.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1280px] gap-6 px-4 sm:px-8 md:mt-14 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-10">
        {/* Viewer — sticky so every change is visible while you scroll the options */}
        <div className="sticky top-[calc(var(--pk-header-h)+8px)] z-20 h-[40svh] md:top-[calc(var(--pk-header-h)+24px)] md:h-[calc(100svh-var(--pk-header-h)-var(--pk-tab-h)-40px)]">
          <div className="pk-glass pk-solid relative h-full overflow-hidden rounded-[28px]">
            <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_60%,rgba(201,165,92,0.10),transparent_70%)]" aria-hidden />
            <MakerScene build={build} explodeRef={explodeRef} />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-6">
              <div>
                <p className="pk-mono text-[10px] uppercase tracking-[0.2em] text-muted">Build</p>
                <p className="pk-mono mt-1 text-sm text-text md:text-base" aria-live="polite">
                  {buildCode(build)}
                </p>
              </div>
              <p className="pk-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-text-2">
                <span className="pk-live" aria-hidden /> Live
              </p>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-6">
              <p className="pk-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:hidden">Drag to rotate</p>
              <dl className="pk-mono hidden grid-cols-2 gap-x-6 gap-y-1 text-[11px] uppercase tracking-[0.12em] sm:grid">
                <dt className="text-muted">Velcro Ø</dt>
                <dd className="text-text">{build.size} mm</dd>
                <dt className="text-muted">Height</dt>
                <dd className="text-text">{build.thickness} mm</dd>
                <dt className="text-muted">Edge</dt>
                <dd className="text-text">{edge.name}</dd>
                <dt className="text-muted">Face</dt>
                <dd className="text-text">{face.name}</dd>
              </dl>
              <button
                type="button"
                onClick={toggleExplode}
                aria-pressed={exploded}
                className="pk-glass ml-auto inline-flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-text transition-colors hover:text-gold-hi"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                {exploded ? "Assemble" : "Inspect layers"}
              </button>
            </div>
            <p className="pk-mono pointer-events-none absolute left-1/2 top-6 hidden -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-muted sm:block">
              Drag to rotate
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="pk-glass relative z-10 rounded-[28px] p-5 md:p-8">
          <div className="space-y-8">
            <Group title="Size" hint="Velcro diameter">
              <div className="grid grid-cols-3 gap-2.5">
                {SIZES.map((s) => (
                  <label key={s} className="pk-option flex cursor-pointer flex-col items-center gap-3 rounded-2xl px-2 pb-3 pt-4">
                    <input type="radio" name={`${name}-size`} className="sr-only" checked={build.size === s} onChange={() => set("size", s)} />
                    <span className="grid h-12 place-items-center" aria-hidden>
                      <span className="rounded-full border border-gold/60 bg-spitfire/80" style={{ width: s * 0.62, height: s * 0.62 }} />
                    </span>
                    <span className="pk-mono text-sm">
                      {s}
                      <span className="text-muted"> mm</span>
                    </span>
                    <Tick />
                  </label>
                ))}
              </div>
            </Group>

            <Group title="Height" hint="Velcro to face">
              <div className="grid grid-cols-6 gap-2">
                {THICKNESSES.map((t) => (
                  <label key={t} className="pk-option flex cursor-pointer flex-col items-center justify-end gap-2 rounded-xl px-1 pb-2.5 pt-3">
                    <input type="radio" name={`${name}-height`} className="sr-only" checked={build.thickness === t} onChange={() => set("thickness", t)} />
                    <span className="w-4 rounded-[3px] bg-spitfire/80" style={{ height: t * 1.2 }} aria-hidden />
                    <span className="pk-mono text-[13px]">{t}</span>
                  </label>
                ))}
              </div>
            </Group>

            <Group title="Edge profile" hint={edge.name}>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {EDGES.map((e) => (
                  <label key={e.id} className="pk-option flex cursor-pointer flex-col gap-2 rounded-2xl p-3 text-text-2">
                    <input type="radio" name={`${name}-edge`} className="sr-only" checked={build.edge === e.id} onChange={() => set("edge", e.id)} />
                    <EdgeIcon edge={e.id} />
                    <span className="text-[14px] font-semibold text-text">{e.name}</span>
                    <Tick />
                  </label>
                ))}
              </div>
              <p className="mt-3 min-h-[2.8em] text-[14px] leading-snug text-text-2">{edge.blurb}</p>
            </Group>

            <Group title="Face" hint={face.name}>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {FACES.map((f) => (
                  <label key={f.id} className="pk-option flex cursor-pointer flex-col items-center gap-2 rounded-2xl px-2 pb-3 pt-4">
                    <input type="radio" name={`${name}-face`} className="sr-only" checked={build.face === f.id} onChange={() => set("face", f.id)} />
                    <FaceIcon face={f.id} />
                    <span className="text-center text-[14px] font-semibold leading-tight">{f.name}</span>
                    {"provisional" in f && f.provisional && (
                      <span className="pk-mono rounded-full border border-orange/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-orange">
                        In testing
                      </span>
                    )}
                    <Tick />
                  </label>
                ))}
              </div>
              <p className="mt-3 min-h-[2.8em] text-[14px] leading-snug text-text-2">{face.blurb}</p>
            </Group>

            <div className="border-t border-line pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="pk-mono text-[10px] uppercase tracking-[0.2em] text-muted">Your build</p>
                  <p className="mt-1 text-[15px] font-semibold">
                    {FOAM.name} · {build.size} mm · {build.thickness} mm · {edge.name} · {face.name}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setSheetOpen(true)} className="pk-btn-gold mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[16px]">
                Send build to The Pad King
              </button>
              <p className="mt-3 text-center text-[13px] text-muted">Matt confirms every custom build and quotes it before you pay.</p>
            </div>
          </div>
        </div>
      </div>

      <RequestSheet open={sheetOpen} onClose={() => setSheetOpen(false)} build={build} />
    </section>
  );
}
