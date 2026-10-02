import Link from "next/link";

const NEXT = [
  { href: "/range", title: "Shop the range", body: "Every pad in 3D, with specs and a straight link to buy." },
  { href: "/build", title: "Build your own", body: "Design a custom Spitfire Green and send it to Matt." },
  { href: "/match", title: "Find your polish", body: "Tap a pad and see the polishes that suit it." },
];

/** Where to go next. */
export function HistoryOutro() {
  return (
    <section id="outro" aria-labelledby="outro-title" className="relative pb-[clamp(72px,12svh,140px)] pt-[clamp(40px,8svh,96px)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 xl:pl-28">
        <p data-reveal className="pk-eyebrow mb-5">
          Your turn
        </p>
        <h2 id="outro-title" data-reveal className="pk-display max-w-[14ch] text-[clamp(36px,5.4vw,80px)]">
          The story continues <span className="pk-gold-text">on your paint.</span>
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {NEXT.map((n) => (
            <Link key={n.href} href={n.href} data-reveal className="pk-glass group flex min-h-[168px] flex-col justify-between rounded-[24px] p-6 transition-colors hover:border-gold/50">
              <span className="font-display text-[20px] font-bold uppercase tracking-wide [font-stretch:115%]">{n.title}</span>
              <span className="mt-6 flex items-end justify-between gap-4">
                <span className="text-[15px] leading-snug text-text-2">{n.body}</span>
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-2 text-gold transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-bg" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </Link>
          ))}
        </div>
        <p data-reveal className="mt-10 max-w-[60ch] text-[14px] leading-relaxed text-muted">
          Designed by master detailer Matthew Gibb. Every design is tested to failure on real cars and real paint systems at the Adelaide R&amp;D facility.
        </p>
      </div>
    </section>
  );
}
