"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * "Get the app" banner, phones only, sitting just above the tab bar.
 *  - Android / Chromium: uses the browser's own install prompt (one tap).
 *  - iPhone / iPad Safari: Apple has no install prompt, so it shows the
 *    Share → Add to Home Screen steps instead.
 * Waits until someone has looked around, never shows inside the installed app,
 * and stays quiet for two weeks after it's dismissed.
 * Preview it any time with ?install-preview.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "android" | "ios";

const KEY = "pk-install-snoozed-until";
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
const DELAY_MS = 20_000;

function snoozed() {
  try {
    return Number(localStorage.getItem(KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

function snooze() {
  try {
    localStorage.setItem(KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    // private mode etc. — the banner just shows again next visit
  }
}

function ShareGlyph() {
  return (
    <svg width="15" height="17" viewBox="0 0 15 17" aria-label="Share" role="img" className="inline -translate-y-px">
      <path d="M7.5 1v10M4 4.3 7.5 1 11 4.3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 7H2.8A1.3 1.3 0 0 0 1.5 8.3v6.4A1.3 1.3 0 0 0 2.8 16h9.4a1.3 1.3 0 0 0 1.3-1.3V8.3A1.3 1.3 0 0 0 12.2 7h-1.7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function InstallPrompt() {
  const [mode, setMode] = useState<Mode | null>(null);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    const installed = window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    const preview = new URLSearchParams(window.location.search).has("install-preview");
    if (installed || (snoozed() && !preview)) return;
    const phone = window.matchMedia("(pointer: coarse)").matches;
    if (!phone && !preview) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const showSoon = (m: Mode) => {
      clearTimeout(timer);
      timer = setTimeout(
        () => {
          setMode(m);
          track("install_prompt_shown", { platform: m });
        },
        preview ? 400 : DELAY_MS,
      );
    };

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred.current = e as BeforeInstallPromptEvent;
      showSoon("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const ua = navigator.userAgent;
    const iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    // in-app browsers (Instagram, Facebook) and other iOS browsers can't add to home screen the same way
    const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Instagram|FBAN|FBAV/.test(ua);
    if (iOS && safari) showSoon("ios");
    else if (preview && !iOS) showSoon("android");

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  if (!mode) return null;

  const close = () => {
    snooze();
    track("install_dismissed", { platform: mode });
    setMode(null);
  };

  const install = async () => {
    const e = deferred.current;
    if (!e) return close();
    await e.prompt();
    const { outcome } = await e.userChoice;
    track(outcome === "accepted" ? "install_accepted" : "install_dismissed", { platform: "android" });
    if (outcome !== "accepted") snooze();
    deferred.current = null;
    setMode(null);
  };

  return (
    <div
      role="dialog"
      aria-label="Install The Pad King app"
      className="pk-install fixed inset-x-3 bottom-[calc(var(--pk-tab-h)+12px)] z-[59] mx-auto max-w-[440px] md:bottom-[calc(var(--pk-tab-h)+8px)]"
    >
      <div className="pk-glass pk-solid flex items-center gap-3.5 rounded-[22px] p-3.5 pr-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static icon */}
        <img src="/icons/icon-192.png" alt="" width={48} height={48} className="size-12 shrink-0 rounded-[13px]" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-tight">Get The Pad King app</p>
          {mode === "android" ? (
            <p className="mt-0.5 text-[13px] leading-snug text-text-2">On your home screen. No app store needed.</p>
          ) : (
            <p className="mt-0.5 text-[13px] leading-snug text-text-2">
              Tap <ShareGlyph /> then <span className="font-semibold text-text">Add to Home Screen</span>.
            </p>
          )}
        </div>
        {mode === "android" && (
          <button type="button" onClick={install} className="pk-btn-gold h-10 shrink-0 rounded-full px-4 text-[14px]">
            Install
          </button>
        )}
        <button type="button" onClick={close} className="grid size-10 shrink-0 place-items-center rounded-full text-text-2 hover:text-text" aria-label="Not now">
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
            <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
