"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Bottom tab bar — OMA HQ's pattern (equal columns, icon over a mono label,
 * glowing pill under the active tab, light sweep on switch), in Pad King gold.
 * Full-width bar on phones; a floating glass dock on wider screens.
 *
 * The tabs are this one array. Reorder / rename / add here.
 */
const TABS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path d="M4 17 2.5 6.5l5 4L12 4l4.5 6.5 5-4L20 17Z M4.5 20h15" />
    ),
  },
  {
    href: "/range",
    label: "Range",
    icon: (
      <>
        <ellipse cx="12" cy="7" rx="8" ry="3" />
        <path d="M4 7v4c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
        <path d="M4 13v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4" />
      </>
    ),
  },
  {
    href: "/build",
    label: "Build",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.2" />
      </>
    ),
  },
  {
    href: "/match",
    label: "Match",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
  },
  {
    href: "/orders",
    label: "Reorder",
    icon: (
      <>
        <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" />
        <path d="M4 3.5V8h4.5" />
        <path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" />
        <path d="M20 20.5V16h-4.5" />
      </>
    ),
  },
] as const;

function activeIndex(pathname: string) {
  const i = TABS.findIndex((t) => (t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)));
  return i < 0 ? 0 : i;
}

export function TabBar() {
  const pathname = usePathname();
  const active = activeIndex(pathname);
  const sweepRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // OMA-style light sweep across the screen on every tab switch
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = sweepRef.current;
    if (!el) return;
    el.classList.remove("is-on");
    void el.offsetWidth; // restart the animation
    el.classList.add("is-on");
  }, [pathname]);

  return (
    <>
      <div ref={sweepRef} className="pk-sweep" aria-hidden />
      <nav className="pk-tabbar" aria-label="Main">
        <div className="pk-tabbar__grid" style={{ "--n": TABS.length, "--i": active } as React.CSSProperties}>
          <span className="pk-tabbar__pill" aria-hidden />
          {TABS.map((t, i) => (
            <Link
              key={t.href}
              href={t.href}
              className="pk-tab"
              aria-current={i === active ? "page" : undefined}
              data-active={i === active || undefined}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {t.icon}
              </svg>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
