import * as THREE from "three";

/**
 * Pad surface materials, built on MeshPhysicalMaterial so they keep three's
 * lighting, with two additions injected into its shader:
 *
 *  1. Foam cells — object-space value noise perturbs the normal and albedo so
 *     the foam reads as open-cell foam, not plastic. Faded out with distance
 *     (fwidth) so it never shimmers.
 *  2. Face grooves (face material only) — Crosscut/Waffle channels are traced
 *     per pixel with parallax occlusion mapping against an analytic height field,
 *     so the grid edges are perfectly crisp at any zoom and morph smoothly.
 *  3. Band — an optional coloured stripe around the side between two heights,
 *     like the interface layer through the middle of a Gen II pad. Off by default.
 *  4. Print (fabric only) — the logo printed on the velcro back, from a mask
 *     texture mapped flat across the back face. Off by default.
 *
 * Object space is the pad's own (mm): axis +y, face at y=0 looking down (-y).
 */

export type SurfaceKind = "face" | "foam" | "fabric";

export interface SurfaceUniforms {
  uPat: { value: THREE.Vector4 }; // spacing, halfWidth, soft, depth (mm)
  uFaceR: { value: THREE.Vector2 }; // face radius, hole radius (mm)
  uCell: { value: number }; // noise cell size (mm)
  uBump: { value: number }; // micro-normal strength
  uBand: { value: THREE.Vector4 }; // from y, to y (mm), mix 0–1, edge softness (mm)
  uBandColor: { value: THREE.Color };
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
uniform vec2 uFaceR;
uniform float uCell;
uniform float uBump;
uniform vec4 uBand;
uniform vec3 uBandColor;
#ifdef PK_FABRIC
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
float pkDepth(vec2 p) {
  float r = length(p);
  float fade = (1.0 - smoothstep(uFaceR.x - 1.8, uFaceR.x - 0.5, r)) * smoothstep(uFaceR.y + 0.5, uFaceR.y + 1.8, r);
  return uPat.w * max(pkChannel(p.x), pkChannel(p.y)) * fade;
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
if (uBand.z > 0.001) {
  float pkBandM = smoothstep(uBand.x - uBand.w, uBand.x + uBand.w, vPkObj.y) * (1.0 - smoothstep(uBand.y - uBand.w, uBand.y + uBand.w, vPkObj.y));
  diffuseColor.rgb = mix(diffuseColor.rgb, uBandColor, pkBandM * uBand.z);
}
#ifdef PK_FABRIC
// the print sits on the back face only (the flat top of the velcro)
if (uPrintParams.x > 0.001 && vPkObj.y > uPrintParams.y - 0.05) {
  vec2 puv = vec2(vPkObj.x, -vPkObj.z) / (2.0 * uPrintParams.z) + 0.5;
  float pm = texture2D(uPrint, puv).r;
  diffuseColor.rgb = mix(diffuseColor.rgb, uPrintColor, pm * uPrintParams.x);
}
#endif
float pkCellTone = pkFbm(pkP / uCell);
diffuseColor.rgb *= (0.9 + 0.16 * pkCellTone) * mix(1.0, 0.32, pkCav * pkCav);
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
    normal = normalize(normal - uBump * fade * gv);
  }
}
`;

export function createSurfaceMaterial(kind: SurfaceKind, params: THREE.MeshPhysicalMaterialParameters) {
  const material = new THREE.MeshPhysicalMaterial(params);
  const uniforms: SurfaceUniforms = {
    uPat: { value: new THREE.Vector4(10, 0.5, 0.1, 0) },
    uFaceR: { value: new THREE.Vector2(30, 4) },
    uCell: { value: kind === "fabric" ? 0.3 : 0.5 },
    uBump: { value: kind === "fabric" ? 0.7 : 0.3 },
    uBand: { value: new THREE.Vector4(0, 0, 0, 0.35) },
    uBandColor: { value: new THREE.Color("#000000") },
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
      .replace("#include <normal_fragment_maps>", FRAG_NORMAL);
  };
  material.customProgramCacheKey = () => `pk-surface-${kind}`;
  return { material, uniforms };
}
