import * as THREE from "three";

/**
 * Pad surface materials, built on MeshPhysicalMaterial so they keep three's
 * lighting, with two additions injected into its shader:
 *
 *  1. Foam cells — object-space value noise perturbs the normal and albedo so
 *     the foam reads as open-cell foam, not plastic. Faded out with distance
 *     (fwidth) so it never shimmers.
 *  2. Face grooves (face material only) — Crosscut/Waffle channels and the
 *     Flower Power rings are traced per pixel with parallax occlusion mapping
 *     against an analytic height field, so the edges are perfectly crisp at
 *     any zoom and morph smoothly.
 *  3. Band — an optional coloured stripe around the side between two heights,
 *     like the interface layer through the middle of a Gen II pad, or the
 *     Frostbite's backing foam. Its own grain strength, since those layers are
 *     finer than the foam. Off by default.
 *  4. Print (fabric only) — the logo printed on the velcro back, from a mask
 *     texture mapped flat across the back face. Off by default.
 *  5. Ribs (fabric only) — the fine knitted ribs some velcro loop has across
 *     the back face (the Frostbite's). Off by default.
 *
 * Object space is the pad's own (mm): axis +y, face at y=0 looking down (-y).
 */

export type SurfaceKind = "face" | "foam" | "fabric";

export interface SurfaceUniforms {
  uPat: { value: THREE.Vector4 }; // scale, halfWidth, soft, depth (mm) — see faceGrooves
  uPatKind: { value: number }; // 0 square grid, 1 flower rings
  uFaceR: { value: THREE.Vector2 }; // face radius, hole radius (mm)
  uCell: { value: number }; // noise cell size (mm)
  uBump: { value: number }; // micro-normal strength
  uBand: { value: THREE.Vector4 }; // from y, to y (mm), mix 0–1, edge softness (mm)
  uBandColor: { value: THREE.Color };
  uBandGrain: { value: number }; // micro-normal strength inside the band, relative to the foam (1 = same)
  uRib: { value: THREE.Vector2 }; // fabric: rib period (mm), strength 0–1
  uPrint: { value: THREE.Texture | null }; // fabric: print mask (red channel)
  uPrintParams: { value: THREE.Vector4 }; // on 0–1, back face y (mm), velcro radius (mm), unused
  uPrintColor: { value: THREE.Color };
}

const VERT_HEAD = /* glsl */ `
varying vec3 vPkObj;
varying vec3 vPkT;
varying vec3 vPkB;
varying vec3 vPkN;
`;

const VERT_BODY = /* glsl */ `
vPkObj = position;
vPkT = normalize(mat3(modelViewMatrix) * vec3(1.0, 0.0, 0.0));
vPkB = normalize(mat3(modelViewMatrix) * vec3(0.0, 0.0, 1.0));
vPkN = normalize(mat3(modelViewMatrix) * vec3(0.0, -1.0, 0.0));
`;

const FRAG_HEAD = /* glsl */ `
varying vec3 vPkObj;
varying vec3 vPkT;
varying vec3 vPkB;
varying vec3 vPkN;
uniform vec4 uPat;
uniform float uPatKind;
uniform vec2 uFaceR;
uniform float uCell;
uniform float uBump;
uniform vec4 uBand;
uniform vec3 uBandColor;
uniform float uBandGrain;
#ifdef PK_FABRIC
uniform vec2 uRib;
uniform sampler2D uPrint;
uniform vec4 uPrintParams;
uniform vec3 uPrintColor;
#endif

float pkHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float pkNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(pkHash(i), pkHash(i + vec3(1, 0, 0)), f.x), mix(pkHash(i + vec3(0, 1, 0)), pkHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(pkHash(i + vec3(0, 0, 1)), pkHash(i + vec3(1, 0, 1)), f.x), mix(pkHash(i + vec3(0, 1, 1)), pkHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float pkFbm(vec3 p) {
  return 0.65 * pkNoise(p) + 0.35 * pkNoise(p * 2.13 + 7.1);
}

#ifdef PK_FACE
float pkAA = 0.0;
float pkChannel(float v) {
  float s = uPat.x;
  float d = abs(mod(v + s * 0.5, s) - s * 0.5);
  float soft = max(uPat.z, pkAA);
  return 1.0 - smoothstep(uPat.y - soft, uPat.y + soft, d);
}
// Flower Power rings — mirrors flowerDist() in lib/pad/geometry.ts (FLOWER constants)
float pkFlower(vec2 p) {
  float S = uPat.x;
  float th = atan(p.y, p.x);
  float d = 1e5;
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    float base = 0.36 + 0.18 * fk;
    float n = floor(3.14159265 / asin(0.11 / base) + 0.5);
    float R = base * S;
    float step = 6.2831853 / n;
    float rho = R * sin(3.14159265 / n);
    float rc = R * cos(3.14159265 / n);
    float phase = 0.5 * fk;
    float j0 = floor(th / step - phase);
    for (int i = 0; i < 2; i++) {
      float a = (j0 + float(i) + phase) * step;
      vec2 c = R * vec2(cos(a), sin(a));
      float l = max(length(p - c), 1e-4);
      vec2 q = c + (p - c) * (rho / l);
      if (length(q) >= rc) {
        d = min(d, abs(l - rho));
      } else {
        float b0 = a - step * 0.5;
        float b1 = a + step * 0.5;
        d = min(d, min(length(p - rc * vec2(cos(b0), sin(b0))), length(p - rc * vec2(cos(b1), sin(b1)))));
      }
    }
  }
  float soft = max(uPat.z, pkAA);
  return 1.0 - smoothstep(uPat.y - soft, uPat.y + soft, d);
}
float pkDepth(vec2 p) {
  float r = length(p);
  float fade = (1.0 - smoothstep(uFaceR.x - 1.8, uFaceR.x - 0.5, r)) * smoothstep(uFaceR.y + 0.5, uFaceR.y + 1.8, r);
  float g = uPatKind > 0.5 ? pkFlower(p) : max(pkChannel(p.x), pkChannel(p.y));
  return uPat.w * g * fade;
}
#endif
`;

/** Runs right after the albedo is known: trace grooves, darken cavities, add cell tone. */
const FRAG_ALBEDO = /* glsl */ `
vec2 pkGrad = vec2(0.0);
float pkCav = 0.0;
vec3 pkP = vPkObj;
#ifdef PK_FACE
if (uPat.w > 0.001) {
  pkAA = 0.6 * length(fwidth(vPkObj.xz));
  vec3 V = normalize(vViewPosition);
  vec3 Vt = vec3(dot(V, vPkT), dot(V, vPkB), dot(V, vPkN));
  vec2 p = vPkObj.xz;
  float vz = max(Vt.z, 0.12);
  vec2 shift = -Vt.xy / vz;
  const int STEPS = 32;
  float stepD = uPat.w / float(STEPS);
  float k = 0.0;
  float d = pkDepth(p);
  float pk = 0.0;
  float pd = d;
  for (int i = 0; i < STEPS; i++) {
    if (k >= d) break;
    pk = k;
    pd = d;
    k += stepD;
    d = pkDepth(p + shift * k);
  }
  float a = pd - pk;
  float b = d - k;
  float t = clamp(a / max(a - b, 1e-4), 0.0, 1.0);
  k = mix(pk, k, t);
  vec2 q = p + shift * k;
  float e = 0.08;
  pkGrad = vec2(pkDepth(q + vec2(e, 0.0)) - pkDepth(q - vec2(e, 0.0)), pkDepth(q + vec2(0.0, e)) - pkDepth(q - vec2(0.0, e))) / (2.0 * e);
  pkCav = clamp(pkDepth(q) / uPat.w, 0.0, 1.0);
  pkP = vec3(q.x, vPkObj.y + k, q.y);
}
#endif
float pkBandM = 0.0;
if (uBand.z > 0.001) {
  pkBandM = smoothstep(uBand.x - uBand.w, uBand.x + uBand.w, vPkObj.y) * (1.0 - smoothstep(uBand.y - uBand.w, uBand.y + uBand.w, vPkObj.y)) * uBand.z;
  diffuseColor.rgb = mix(diffuseColor.rgb, uBandColor, pkBandM);
}
float pkGrain = mix(1.0, uBandGrain, pkBandM);
#ifdef PK_FABRIC
bool pkBack = vPkObj.y > uPrintParams.y - 0.05;
// the print sits on the back face only (the flat top of the velcro)
if (uPrintParams.x > 0.001 && pkBack) {
  vec2 puv = vec2(vPkObj.x, -vPkObj.z) / (2.0 * uPrintParams.z) + 0.5;
  float pm = texture2D(uPrint, puv).r;
  diffuseColor.rgb = mix(diffuseColor.rgb, uPrintColor, pm * uPrintParams.x);
}
// knitted ribs across the back; faded to their average tone once they get smaller than a pixel
float pkRib = 0.0;
float pkRibW = fwidth(vPkObj.z); // outside the branch: derivatives need every pixel of the quad
if (uRib.y > 0.001 && pkBack) {
  float ph = 6.2831853 * vPkObj.z / uRib.x;
  float vis = 1.0 - smoothstep(0.25, 0.6, pkRibW / uRib.x);
  float tone = mix(0.925, 0.7 + 0.45 * (0.5 + 0.5 * cos(ph)), vis);
  diffuseColor.rgb *= mix(1.0, tone, uRib.y);
  pkRib = -sin(ph) * vis * uRib.y;
}
#endif
float pkCellTone = pkFbm(pkP / uCell);
diffuseColor.rgb *= (0.98 + 0.16 * pkGrain * (pkCellTone - 0.5)) * mix(1.0, 0.32, pkCav * pkCav);
`;

/** Replaces normal maps: groove normals + foam-cell micro normals. */
const FRAG_NORMAL = /* glsl */ `
#include <normal_fragment_maps>
{
#ifdef PK_FACE
  if (uPat.w > 0.001) {
    vec3 nts = normalize(vec3(pkGrad, 1.0));
    normal = normalize(nts.x * vPkT + nts.y * vPkB + nts.z * vPkN);
  }
#endif
  // micro normals from the cell noise, faded out when cells get smaller than a pixel
  vec3 cp = pkP / uCell;
  float px = length(fwidth(cp));
  float fade = 1.0 - smoothstep(0.35, 0.9, px);
  if (fade > 0.0) {
    // forward differences off the tone sample we already have: 3 extra fbm calls, not 6
    float e = 0.35;
    vec3 g = vec3(
      pkFbm(cp + vec3(e, 0, 0)) - pkCellTone,
      pkFbm(cp + vec3(0, e, 0)) - pkCellTone,
      pkFbm(cp + vec3(0, 0, e)) - pkCellTone
    ) / e;
    vec3 gv = g.x * vPkT + g.z * vPkB - g.y * vPkN;
    gv -= dot(gv, normal) * normal;
    normal = normalize(normal - uBump * pkGrain * fade * gv);
  }
#ifdef PK_FABRIC
  if (pkRib != 0.0) normal = normalize(normal + 0.55 * pkRib * vPkB);
#endif
}
`;

/** The band keeps its own sheen: an orange foam's sheen would tint a black band brown. */
const FRAG_SHEEN = /* glsl */ `
#include <lights_physical_fragment>
#ifdef USE_SHEEN
material.sheenColor = mix(material.sheenColor, mix(uBandColor, vec3(1.0), 0.15), pkBandM);
#endif
`;

export function createSurfaceMaterial(kind: SurfaceKind, params: THREE.MeshPhysicalMaterialParameters) {
  const material = new THREE.MeshPhysicalMaterial(params);
  const uniforms: SurfaceUniforms = {
    uPat: { value: new THREE.Vector4(10, 0.5, 0.1, 0) },
    uPatKind: { value: 0 },
    uFaceR: { value: new THREE.Vector2(30, 4) },
    uCell: { value: kind === "fabric" ? 0.3 : 0.5 },
    uBump: { value: kind === "fabric" ? 0.7 : 0.3 },
    uBand: { value: new THREE.Vector4(0, 0, 0, 0.35) },
    uBandColor: { value: new THREE.Color("#000000") },
    uBandGrain: { value: 1 },
    uRib: { value: new THREE.Vector2(0.45, 0) },
    uPrint: { value: null },
    uPrintParams: { value: new THREE.Vector4(0, 0, 1, 0) },
    uPrintColor: { value: new THREE.Color("#a3abb8") },
  };
  if (kind === "face") material.defines = { ...material.defines, PK_FACE: "" };
  if (kind === "fabric") material.defines = { ...material.defines, PK_FABRIC: "" };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERT_HEAD}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${VERT_BODY}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAG_HEAD}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${FRAG_ALBEDO}`)
      .replace("#include <normal_fragment_maps>", FRAG_NORMAL)
      .replace("#include <lights_physical_fragment>", FRAG_SHEEN);
  };
  material.customProgramCacheKey = () => `pk-surface-${kind}`;
  /** Face pattern from faceGrooves: [scale, halfWidth, soft, depth, kind]. */
  const setPattern = (pat: readonly number[]) => {
    uniforms.uPat.value.set(pat[0], pat[1], pat[2], pat[3]);
    uniforms.uPatKind.value = pat[4];
  };
  return { material, uniforms, setPattern };
}
