import * as THREE from "three";
import {
  FACE_RINGS,
  PROFILE_N,
  annulusIndices,
  lerpInto,
  ringIndices,
  type PadState,
  type Part,
} from "./geometry";

type PartKey = "side" | "face" | "hole" | "top" | "iface" | "velcro";
const KEYS: PartKey[] = ["side", "face", "hole", "top", "iface", "velcro"];

function indicesFor(key: PartKey): Uint32Array {
  switch (key) {
    case "side":
      return ringIndices(PROFILE_N);
    case "face":
      return ringIndices(FACE_RINGS + 1);
    case "hole":
      return ringIndices(2, true); // faces in towards the axis
    case "top":
      return ringIndices(2);
    case "iface":
    case "velcro":
      return annulusIndices();
  }
}

function makeGeometry(key: PartKey, part: Part): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(part.pos.slice(), 3).setUsage(THREE.DynamicDrawUsage));
  if (part.nrm) {
    g.setAttribute("normal", new THREE.BufferAttribute(part.nrm.slice(), 3).setUsage(THREE.DynamicDrawUsage));
  }
  g.setIndex(new THREE.BufferAttribute(indicesFor(key), 1));
  if (!part.nrm) g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

/**
 * Owns the pad's geometries and morphs them between two PadStates in place.
 * One instance per rendered pad.
 */
export class PadGeometrySet {
  readonly geo: Record<PartKey, THREE.BufferGeometry>;
  private from: PadState;
  private to: PadState;
  minY: number;
  /** Current (blended) shader params — read by the material every frame. */
  readonly faceR: [number, number];
  readonly pat: [number, number, number, number];

  constructor(initial: PadState) {
    this.from = initial;
    this.to = initial;
    this.minY = initial.minY;
    this.faceR = [...initial.faceR];
    this.pat = [...initial.pat];
    this.geo = Object.fromEntries(KEYS.map((k) => [k, makeGeometry(k, initial[k])])) as Record<
      PartKey,
      THREE.BufferGeometry
    >;
  }

  /** Start a morph from whatever is on screen right now to `next`. */
  retarget(next: PadState) {
    this.from = this.snapshot();
    this.to = next;
  }

  private snapshot(): PadState {
    const snap = {
      ...this.to,
      minY: this.minY,
      faceR: [...this.faceR] as [number, number],
      pat: [...this.pat] as PadState["pat"],
    } as PadState;
    for (const k of KEYS) {
      const pos = (this.geo[k].getAttribute("position") as THREE.BufferAttribute).array as Float32Array;
      const nrmAttr = this.geo[k].getAttribute("normal") as THREE.BufferAttribute | undefined;
      snap[k] = {
        pos: pos.slice(),
        nrm: this.to[k].nrm && nrmAttr ? (nrmAttr.array as Float32Array).slice() : undefined,
      };
    }
    return snap;
  }

  /** Write the blend at progress t (0 → from, 1 → to). */
  apply(t: number) {
    for (const k of KEYS) {
      const g = this.geo[k];
      const pos = g.getAttribute("position") as THREE.BufferAttribute;
      lerpInto(pos.array as Float32Array, this.from[k].pos, this.to[k].pos, t);
      pos.needsUpdate = true;
      const a = this.from[k].nrm;
      const b = this.to[k].nrm;
      if (a && b) {
        const nrm = g.getAttribute("normal") as THREE.BufferAttribute;
        const arr = nrm.array as Float32Array;
        lerpInto(arr, a, b, t);
        for (let i = 0; i < arr.length; i += 3) {
          const l = Math.hypot(arr[i], arr[i + 1], arr[i + 2]) || 1;
          arr[i] /= l;
          arr[i + 1] /= l;
          arr[i + 2] /= l;
        }
        nrm.needsUpdate = true;
      } else {
        g.computeVertexNormals();
      }
      g.computeBoundingSphere();
    }
    const l = (a: number, b: number) => a + (b - a) * t;
    this.minY = l(this.from.minY, this.to.minY);
    for (let i = 0; i < 2; i++) this.faceR[i] = l(this.from.faceR[i], this.to.faceR[i]);
    // pattern geometry snaps to the target while depth fades, so grooves never "slide"
    const fromDepth = this.from.pat[3];
    const toDepth = this.to.pat[3];
    const src = toDepth > 0 ? this.to.pat : this.from.pat;
    if (fromDepth > 0 && toDepth > 0 && this.from.pat[0] !== this.to.pat[0]) {
      // switching pattern type: sink the old one out, raise the new one in
      const useFrom = t < 0.5;
      const p = useFrom ? this.from.pat : this.to.pat;
      const k = useFrom ? 1 - t * 2 : (t - 0.5) * 2;
      this.pat[0] = p[0];
      this.pat[1] = p[1];
      this.pat[2] = p[2];
      this.pat[3] = p[3] * k;
    } else {
      this.pat[0] = src[0];
      this.pat[1] = src[1];
      this.pat[2] = src[2];
      this.pat[3] = l(fromDepth, toDepth);
    }
  }

  dispose() {
    for (const k of KEYS) this.geo[k].dispose();
  }
}
