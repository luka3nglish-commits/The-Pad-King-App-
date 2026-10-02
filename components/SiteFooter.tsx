import { PADS } from "@/lib/pads";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-bg/80 backdrop-blur-xl">
      {/* the range as a hairline across the top */}
      <div className="flex h-[2px]" aria-hidden>
        {PADS.map((p) => (
          <span key={p.id} className="flex-1" style={{ background: p.color }} />
        ))}
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="pk-gold-text font-display text-2xl font-black uppercase [font-stretch:125%]">The Pad King</p>
          <p className="pk-mono mt-2 text-[11px] uppercase tracking-[0.28em] text-text-2">Super Series Foams · R&amp;D in Adelaide, South Australia</p>
        </div>
        <div className="flex flex-col gap-1 md:items-end">
          <a href="tel:+61468373625" className="pk-mono text-lg text-text hover:text-gold-hi">
            0468 373 625
          </a>
          <a href="https://thepadking.com.au" className="text-[14px] text-text-2 hover:text-text">
            thepadking.com.au
          </a>
          <p className="mt-2 text-[12px] text-muted">© {new Date().getFullYear()} The Pad King</p>
        </div>
      </div>
    </footer>
  );
}
