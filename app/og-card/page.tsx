import type { Metadata } from "next";
import { OgCard } from "@/components/og/OgCard";

export const metadata: Metadata = { title: "Share card", robots: { index: false, follow: false } };

/** Source for the share-preview image. Not linked anywhere; see scripts/og.mjs. */
export default function OgCardPage() {
  return <OgCard />;
}
