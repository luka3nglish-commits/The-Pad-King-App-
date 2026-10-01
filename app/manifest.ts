import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "The Pad King",
    short_name: "Pad King",
    description: "Super Series Foams. Build your own pad, match it to a polish, and shop the range.",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#08080a",
    theme_color: "#08080a",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Build a custom pad", short_name: "Build", url: "/build", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Pad Match", short_name: "Match", url: "/match", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "The range", short_name: "Range", url: "/range", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
