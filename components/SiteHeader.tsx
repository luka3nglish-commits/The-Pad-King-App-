"use client";

import Link from "next/link";
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
        <Link href="/" aria-label="The Pad King — home">
          <Wordmark />
        </Link>
        <a
          href="tel:+61468373625"
          className="pk-glass inline-flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-text-2 transition-colors hover:text-gold-hi"
          aria-label="Call The Pad King on 0468 373 625"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
          </svg>
          <span className="hidden sm:inline">0468 373 625</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>
    </header>
  );
}
