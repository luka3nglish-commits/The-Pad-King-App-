import Script from "next/script";

/**
 * Loads one analytics provider, picked by env (see .env.example). With neither
 * set, nothing loads and track() is a no-op. Both providers count page views on
 * their own, including tab switches; events come from track() in lib/analytics.
 *
 * Plausible is the recommendation: no cookies, so no consent banner.
 */

// validated so env values can't inject into the inline snippets
const PLAUSIBLE_SRC = /^https:\/\/[^\s"'<>]+\.js$/.test(process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "") ? process.env.NEXT_PUBLIC_PLAUSIBLE_SRC : undefined;
const GA_ID = /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_ID ?? "") ? process.env.NEXT_PUBLIC_GA_ID : undefined;

export function Analytics() {
  if (PLAUSIBLE_SRC) {
    return (
      <>
        {/* queues events until the site script arrives (Plausible's own snippet) */}
        <Script id="plausible-init" strategy="afterInteractive">
          {"window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()"}
        </Script>
        <Script src={PLAUSIBLE_SRC} strategy="afterInteractive" />
      </>
    );
  }
  if (GA_ID) {
    return (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </>
    );
  }
  return null;
}
