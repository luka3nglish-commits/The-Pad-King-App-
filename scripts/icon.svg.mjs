// The app icon, drawn in code so every size is regenerated from one source.
// usage: import { iconSvg } from "./icon.svg.mjs"; iconSvg({ maskable, transparent })
export function iconSvg({ maskable = false, transparent = false } = {}) {
  // maskable icons get cropped to circles/squircles: keep the art inside the
  // central ~70% safe zone and let the background bleed to the edges
  const s = maskable ? 0.7 : 0.86;
  const o = (512 - 512 * s) / 2;
  const bg = transparent
    ? ""
    : `<rect width="512" height="512" rx="${maskable ? 0 : 112}" fill="url(#bg)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="#1d1d22"/><stop offset="0.6" stop-color="#0e0e11"/><stop offset="1" stop-color="#060607"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#ecd3a0"/><stop offset="0.45" stop-color="#c99a4a"/><stop offset="1" stop-color="#84601f"/>
    </linearGradient>
  </defs>
  ${bg}
  <g transform="translate(${o} ${o}) scale(${s})">
    <!-- crown -->
    <path d="M118 236 92 92l92 74 72-112 72 112 92-74-26 144Z" fill="url(#gold)"/>
    <circle cx="92" cy="86" r="16" fill="url(#gold)"/><circle cx="256" cy="46" r="18" fill="url(#gold)"/><circle cx="420" cy="86" r="16" fill="url(#gold)"/>
    <rect x="112" y="236" width="288" height="26" rx="8" fill="#84601f"/>
    <!-- pad stack: the range, top to bottom -->
    <rect x="120" y="282" width="272" height="34" rx="17" fill="#c78e1f"/>
    <rect x="120" y="326" width="272" height="34" rx="17" fill="#7cb6dd"/>
    <rect x="120" y="370" width="272" height="34" rx="17" fill="#3fa02c"/>
    <rect x="120" y="414" width="272" height="34" rx="17" fill="#b01c26"/>
    <rect x="112" y="458" width="288" height="18" rx="6" fill="#26262c"/>
  </g>
</svg>`;
}
