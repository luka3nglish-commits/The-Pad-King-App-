/**
 * Analytics, provider-agnostic. Nothing is sent unless a provider is configured
 * (see components/Analytics.tsx and .env.example):
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN → Plausible (cookieless, recommended)
 *   NEXT_PUBLIC_GA_ID            → Google Analytics 4
 *
 * Page views are tracked by the provider scripts; call track() for the moments
 * Matt cares about (pads looked at, build requests, buy clicks, installs).
 */

export type EventName =
  | "range_select"
  | "range_buy_click"
  | "match_select"
  | "stockist_click"
  | "build_request_open"
  | "build_request_sent"
  | "build_request_failed"
  | "install_prompt_shown"
  | "install_accepted"
  | "install_dismissed"
  | "app_installed";

type Props = Record<string, string | number | boolean>;

interface AnalyticsWindow {
  plausible?: (event: string, options?: { props?: Props }) => void;
  gtag?: (command: "event", event: string, params?: Props) => void;
}

export function track(event: EventName, props: Props = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as AnalyticsWindow;
  try {
    w.plausible?.(event, { props });
    w.gtag?.("event", event, props);
  } catch {
    // analytics must never break the app
  }
}
