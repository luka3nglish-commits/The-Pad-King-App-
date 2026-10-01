import Link from "next/link";

/** Shared layout for the secondary tabs: intro, content, CTAs. `status` marks live vs coming soon. */
export function TabPage({
  eyebrow,
  status = "Coming soon",
  title,
  body,
  children,
}: {
  eyebrow: string;
  /** Shown after the eyebrow, e.g. "Coming soon" or "Motion Lab live". */
  status?: string;
  title: React.ReactNode;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-4 pb-16 pt-[calc(var(--pk-header-h)+48px)] sm:px-8 md:pt-[calc(var(--pk-header-h)+88px)]">
      <p className="pk-eyebrow mb-5 flex items-center gap-2.5">
        <span className="pk-live" aria-hidden /> {eyebrow} · {status}
      </p>
      <h1 className="pk-display text-[clamp(44px,9vw,120px)]">{title}</h1>
      <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-text-2 md:text-lg">{body}</p>

      {children && <div className="mt-12 md:mt-16">{children}</div>}

      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Link href="/build" className="pk-btn-gold inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px]">
          Build a custom pad
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <a href="tel:+61468373625" className="pk-glass inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-text-2 hover:text-text">
          Call 0468 373 625
        </a>
      </div>
    </section>
  );
}

/** Numbered steps panel used by the teaser pages. */
export function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="grid gap-3 md:grid-cols-3 md:gap-4">
      {steps.map((s, i) => (
        <li key={s.title} className="pk-glass rounded-[24px] p-6">
          <span className="pk-mono text-xs text-gold">0{i + 1}</span>
          <p className="mt-3 font-display text-[18px] font-bold uppercase tracking-wide [font-stretch:115%]">{s.title}</p>
          <p className="mt-2 text-[15px] leading-snug text-text-2">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
