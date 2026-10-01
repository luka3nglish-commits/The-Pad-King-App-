import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ServiceWorker } from "@/components/ServiceWorker";
import { SiteHeader } from "@/components/SiteHeader";
import { TabBar } from "@/components/TabBar";
import { TigerBackdrop } from "@/components/TigerBackdrop";

export const metadata: Metadata = {
  title: { default: "The Pad King — Super Series Foams", template: "%s · The Pad King" },
  description: "Spitfire Green All Rounder and the custom pad maker. Build your own pad and send it straight to The Pad King.",
  applicationName: "The Pad King",
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
      </body>
    </html>
  );
}
