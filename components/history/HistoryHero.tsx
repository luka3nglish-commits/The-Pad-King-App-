"use client";

import { CHAPTERS } from "@/lib/history";
import { jumpTo } from "./useScrollFx";

/** Opening: the brand's reason to exist, and a ribbon to jump to any chapter. */
export function HistoryHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100svh-var(--pk-tab-h))] flex-col pt-[calc(var(--pk-header-h)+env(safe-area-inset-top))]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_78%_32%,rgba(201,154,74,0.13),transparent_70%),radial-gradient(40%_35%_at_92%_80%,rgba(226,98,27,0.08),transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-4 pb-10 pt-6 sm:px-8 xl:pl-28">
        <p className="pk-eyebrow pk-rise mb-6 flex items-center gap-2.5">
          <span className="pk-live" aria-hidden /> The Pad King story
        </p>
        <h1 id="hero-title" className="pk-display text-[clamp(44px,7.4vw,112px)]">
          <span className="pk-rise block" style={{ animationDelay: "90ms" }}>
            Not another
          </span>
          <span className="pk-rise pk-gold-text block w-fit pr-[0.04em]" style={{ animationDelay: "190ms" }}>
            range of pads.
          </span>
        </h1>
        <p className="pk-rise mt-7 max-w-[40ch] text-[17px] leading-relaxed text-text-2 md:text-xl" style={{ animationDelay: "320ms" }}>
          Matt Gibb has been on paint since 1993. The Pad King exists to fix what kept failing him.
        </p>

        <nav aria-label="Jump to a chapter" className="pk-rise -mx-4 mt-12 px-4 md:mx-0 md:mt-16 md:px-0" style={{ animationDelay: "450ms" }}>
          <div className="pk-noscroll overflow-x-auto">
            <ol className="relative flex min-w-max gap-7 pb-1 md:min-w-0 md:justify-between md:gap-0">
              <span className="absolute left-0 right-0 top-[5px] h-px bg-line-2" aria-hidden />
              <span className="pk-ribbon-fill absolute left-0 right-0 top-[5px] h-px bg-gradient-to-r from-gold via-gold-hi to-orange" aria-hidden />
              {CHAPTERS.map((c) => (
                <li key={c.id} className="relative">
                  <a href={`#ch-${c.id}`} onClick={jumpTo} className="group flex flex-col items-start gap-3 py-1 outline-offset-4">
                    <span className="size-[11px] rounded-full border border-gold bg-bg transition-colors group-hover:bg-gold" aria-hidden />
                    <span className="pk-mono whitespace-nowrap text-[11px] uppercase tracking-[0.16em] text-text-2 transition-colors group-hover:text-gold-hi">
                      {c.marker}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      </div>

    </section>
  );
}
