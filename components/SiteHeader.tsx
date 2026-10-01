"use client";

import { useEffect, useState } from "react";

/** Placeholder wordmark until Matt's vector logo arrives — swap <Wordmark/> for the SVG. */
function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="26" height="22" viewBox="0 0 26 22" aria-hidden className="shrink-0">
        <path d="M3 15 1.5 3.5l6 5L13 1l5.5 7.5 6-5L23 15Z" fill="var(--pk-gold)" />
        <rect x="3" y="17" width="20" height="3.5" rx="1" fill="var(--pk-spitfire)" />
      </svg>
      <span className="leading-none">
        <span className="pk-gold-text block font-display text-[17px] font-black uppercase tracking-[0.02em] [font-stretch:125%]">The Pad King</span>
        <span className="pk-mono mt-1 block text-[8.5px] uppercase tracking-[0.32em] text-text-2">Super Series Foams</span>
      </span>
    </span>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-[var(--pk-header-h)] transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-8">
        <a href="#story" aria-label="The Pad King — back to top">
          <Wordmark />
        </a>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
          <a href="#story" className="hidden h-11 items-center rounded-full px-4 text-[14px] text-text-2 transition-colors hover:text-text sm:inline-flex">
            Spitfire Green
          </a>
          <a href="#build" className="pk-btn-gold inline-flex h-10 items-center rounded-full px-4 text-[14px] sm:h-11 sm:px-5">
            Build yours
          </a>
        </nav>
      </div>
    </header>
  );
}
