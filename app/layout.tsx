import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ServiceWorker } from "@/components/ServiceWorker";
import { SiteHeader } from "@/components/SiteHeader";
import { TabBar } from "@/components/TabBar";
import { TigerBackdrop } from "@/components/TigerBackdrop";

// Public address of the app, for absolute share-preview links. On Vercel, Next
// fills this in itself when it's unset.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: { default: "The Pad King — Super Series Foams", template: "%s · The Pad King" },
  description: "Build your own pad, match it to a polish and shop the Super Series range, straight from The Pad King.",
  applicationName: "The Pad King",
  // the image itself is app/opengraph-image.jpg (rendered by scripts/og.mjs)
  openGraph: { type: "website", siteName: "The Pad King", locale: "en_AU" },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Pad King", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** App shell: the backdrop, header and tab bar persist; only the page swaps. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="pb-[var(--pk-tab-h)]">
        <TigerBackdrop />
        <SiteHeader />
        <main className="relative z-10">{children}</main>
        <TabBar />
        <InstallPrompt />
        <ServiceWorker />
        <Analytics />
      </body>
    </html>
  );
}
