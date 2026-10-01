import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

/** Shown by the service worker when there's no connection and the page isn't cached. */
export default function OfflinePage() {
  return (
    <section className="relative z-10 mx-auto flex min-h-[70svh] max-w-[640px] flex-col justify-center px-4 pt-[var(--pk-header-h)] sm:px-8">
      <p className="pk-eyebrow mb-4">No connection</p>
      <h1 className="pk-display text-[clamp(40px,10vw,80px)]">
        You&apos;re <span className="pk-gold-text">offline.</span>
      </h1>
      <p className="mt-5 max-w-[40ch] text-[17px] leading-relaxed text-text-2">
        Pages you&apos;ve already opened still work. Reconnect to build a pad or send a request, or give The Pad King a call.
      </p>
      <a href="tel:+61468373625" className="pk-btn-gold mt-8 inline-flex h-12 w-fit items-center rounded-full px-6 text-[15px]">
        Call 0468 373 625
      </a>
    </section>
  );
}
