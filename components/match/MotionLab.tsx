"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  PAD_SIZES,
  SPEED_RANGE,
  THROWS,
  kinematics,
  pointAt,
  poseAt,
  slowFactor,
  type Kinematics,
  type Machine,
  type Pressure,
  type SimInput,
} from "@/lib/sim";

const TRAIL_SECONDS = 7; // on-screen seconds of path kept behind the marker
const TRAIL_POINTS = 840;
const BUCKETS = 28;

const nf = (n: number, d = 0) => n.toLocaleString("en-AU", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Draw one frame. `tReal` is simulated real-world time in seconds. */
function draw(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number, input: SimInput, k: Kinematics, tReal: number, slow: number) {
  const R = input.padMm / 2;
  const e = k.orbitRadiusMm;
  const cx0 = w / 2;
  const cy0 = h / 2;
  const s = (Math.min(w, h) / 2 - 18 * dpr) / (R + e + 6); // px per mm
  const X = (mm: number) => cx0 + mm * s;
  const Y = (mm: number) => cy0 - mm * s;

  ctx.clearRect(0, 0, w, h);

  // mm grid: 10 mm minor, 50 mm major
  ctx.lineWidth = 1 * dpr;
  const span = Math.ceil(Math.max(w, h) / s / 2 / 10) * 10;
  for (let g = -span; g <= span; g += 10) {
    ctx.strokeStyle = g % 50 === 0 ? "rgba(245,242,234,0.07)" : "rgba(245,242,234,0.035)";
    ctx.beginPath();
    ctx.moveTo(X(g), 0);
    ctx.lineTo(X(g), h);
    ctx.moveTo(0, Y(g));
    ctx.lineTo(w, Y(g));
    ctx.stroke();
  }

  // spindle crosshair
  ctx.strokeStyle = "rgba(201,165,92,0.55)";
  ctx.beginPath();
  ctx.moveTo(X(-4), Y(0));
  ctx.lineTo(X(4), Y(0));
  ctx.moveTo(X(0), Y(-4));
  ctx.lineTo(X(0), Y(4));
  ctx.stroke();

  const pose = poseAt(k, tReal);

  // DA: orbit circle + eccentric arm from spindle to pad centre
  if (e > 0) {
    ctx.setLineDash([3 * dpr, 4 * dpr]);
    ctx.strokeStyle = "rgba(201,165,92,0.7)";
    ctx.beginPath();
    ctx.arc(X(0), Y(0), e * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // pad body
  const px = X(pose.cx);
  const py = Y(pose.cy);
  const grad = ctx.createRadialGradient(px - R * s * 0.3, py - R * s * 0.3, R * s * 0.1, px, py, R * s);
  grad.addColorStop(0, "rgba(140,245,110,0.95)");
  grad.addColorStop(1, "rgba(80,190,50,0.92)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(px, py, R * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2 * dpr;
  ctx.strokeStyle = "rgba(30,80,20,0.6)";
  ctx.stroke();

  // radial ticks so the spin is readable
  ctx.lineWidth = 1.2 * dpr;
  ctx.strokeStyle = "rgba(10,40,5,0.28)";
  for (let i = 0; i < 12; i++) {
    const a = pose.theta + (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(px + Math.cos(a) * R * s * 0.22, py - Math.sin(a) * R * s * 0.22);
    ctx.lineTo(px + Math.cos(a) * R * s * 0.94, py - Math.sin(a) * R * s * 0.94);
    ctx.stroke();
  }
  // centre hole
  ctx.fillStyle = "#0b0b0e";
  ctx.beginPath();
  ctx.arc(px, py, Math.max(2.2, 0.065 * input.padMm) * s, 0, Math.PI * 2);
  ctx.fill();
  // arm (drawn over the pad so the mechanism reads)
  if (e > 0) {
    ctx.strokeStyle = "rgba(241,227,190,0.85)";
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.fillStyle = "#f1e3be";
    ctx.beginPath();
    ctx.arc(X(0), Y(0), 2.5 * dpr, 0, Math.PI * 2);
    ctx.fill();
  }

  // trail of a point near the edge: the path the paint actually sees
  const rMark = R * 0.86;
  const windowReal = TRAIL_SECONDS / slow;
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const per = TRAIL_POINTS / BUCKETS;
  for (let b = 0; b < BUCKETS; b++) {
    const age = 1 - b / BUCKETS; // 1 = oldest
    ctx.strokeStyle = b > BUCKETS * 0.75 ? `rgba(255,122,26,${(0.95 - age * 0.6).toFixed(3)})` : `rgba(201,165,92,${(0.85 * (1 - age)).toFixed(3)})`;
    ctx.lineWidth = (1.2 + 1.6 * (1 - age)) * dpr;
    ctx.beginPath();
    for (let j = 0; j <= per; j++) {
      const idx = b * per + j;
      const t = tReal - windowReal * (1 - idx / TRAIL_POINTS);
      const p = pointAt(k, t, rMark);
      if (j === 0) ctx.moveTo(X(p.x), Y(p.y));
      else ctx.lineTo(X(p.x), Y(p.y));
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  // marker
  const m = pointAt(k, tReal, rMark);
  ctx.fillStyle = "#ff7a1a";
  ctx.shadowColor = "rgba(255,122,26,0.9)";
  ctx.shadowBlur = 14 * dpr;
  ctx.beginPath();
  ctx.arc(X(m.x), Y(m.y), 4.5 * dpr, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // scale bar: 10 mm
  const bx = 18 * dpr;
  const by = h - 18 * dpr;
  ctx.strokeStyle = "rgba(245,242,234,0.5)";
  ctx.lineWidth = 1.5 * dpr;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + 10 * s, by);
  ctx.moveTo(bx, by - 4 * dpr);
  ctx.lineTo(bx, by + 4 * dpr);
  ctx.moveTo(bx + 10 * s, by - 4 * dpr);
  ctx.lineTo(bx + 10 * s, by + 4 * dpr);
  ctx.stroke();
  ctx.fillStyle = "rgba(245,242,234,0.6)";
  ctx.font = `${10 * dpr}px "JetBrains Mono Variable", ui-monospace, monospace`;
  ctx.fillText("10 MM", bx + 10 * s + 8 * dpr, by + 3.5 * dpr);
}

function Segmented<T extends string | number>({
  label,
  hint,
  value,
  options,
  onChange,
  format = (v) => String(v),
}: {
  label: string;
  hint?: React.ReactNode;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-2.5 flex w-full items-baseline justify-between gap-3">
        <span className="font-display text-[13px] font-bold uppercase tracking-wide [font-stretch:115%]">{label}</span>
        {hint}
      </legend>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <label key={String(o)} className="pk-option flex h-11 cursor-pointer items-center justify-center rounded-xl px-1">
            <input type="radio" name={name} className="sr-only" checked={value === o} onChange={() => onChange(o)} />
            <span className="pk-mono text-[13px]">{format(o)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Illustrative() {
  return (
    <span className="pk-mono rounded-full border border-orange/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-orange">Illustrative</span>
  );
}

export function MotionLab() {
  const [machine, setMachine] = useState<Machine>("da");
  const [speeds, setSpeeds] = useState({ da: SPEED_RANGE.da.def, rotary: SPEED_RANGE.rotary.def });
  const [throwMm, setThrow] = useState<number>(15);
  const [padMm, setPad] = useState<number>(125);
  const [pressure, setPressure] = useState<Pressure>("medium");
  const speedId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tRef = useRef(0);

  const speed = speeds[machine];
  const input = useMemo<SimInput>(() => ({ machine, speed, throwMm, padMm, pressure }), [machine, speed, throwMm, padMm, pressure]);
  const k = useMemo(() => kinematics(input), [input]);
  const slow = slowFactor(k);
  const range = SPEED_RANGE[machine];

  // live params for the render loop, so it never restarts on a slider move
  const live = useRef({ input, k, slow });
  useLayoutEffect(() => {
    live.current = { input, k, slow };
    stageRef.current?.dispatchEvent(new Event("pk-params"));
  }, [input, k, slow]);


  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let visible = true;
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = stage.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      paint();
    };
    const paint = () => {
      const { input, k, slow } = live.current;
      draw(ctx, canvas.width, canvas.height, dpr, input, k, tRef.current, slow);
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tRef.current += dt / live.current.slow;
      paint();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (reduced || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(stage);
    resize();
    if (reduced) {
      // static: show a long stretch of the pattern instead of animating it
      tRef.current = 6 / live.current.slow;
      paint();
    } else if (visible) start();

    const onParams = () => paint();
    stage.addEventListener("pk-params", onParams);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      stage.removeEventListener("pk-params", onParams);
    };
  }, []);

  const pct = ((speed - range.min) / (range.max - range.min)) * 100;
  const isDA = machine === "da";
  const insight = isDA
    ? `Even the centre of the pad moves ${nf(k.centreSpeed, 1)} m/s from the orbit alone, which is why a DA is forgiving. If the pad stops spinning under pressure, back off.`
    : `The edge is moving ${nf(k.edgeSpeed, 1)} m/s while the centre barely moves. That's where a rotary does its work, and why it needs control.`;

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8">
      {/* stage */}
      <div className="pk-glass pk-solid relative aspect-square overflow-hidden rounded-[28px] md:aspect-auto md:min-h-[560px]">
        <div ref={stageRef} className="absolute inset-0">
          <canvas
            ref={canvasRef}
            className="block size-full"
            role="img"
            aria-label={`${isDA ? "DA" : "Rotary"} motion: path traced by a point near the edge of a ${padMm} mm pad`}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-5">
          <div>
            <p className="pk-mono text-[10px] uppercase tracking-[0.2em] text-muted">Motion Lab</p>
            <p className="pk-mono mt-1 text-sm text-text">
              {isDA ? `DA · ${throwMm} mm throw` : "Rotary"} · Ø{padMm}
            </p>
          </div>
          <div className="text-right">
            <p className="pk-mono flex items-center justify-end gap-2 text-[10px] uppercase tracking-[0.2em] text-text-2">
              <span className="pk-live" aria-hidden /> Live
            </p>
            <p className="pk-mono mt-1 text-[10px] uppercase tracking-[0.16em] text-muted">Slowed ×{nf(slow)}</p>
          </div>
        </div>
        <p className="pk-mono pointer-events-none absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.16em] text-muted md:bottom-5 md:right-5">
          Orange = one point on the pad
        </p>
      </div>

      {/* controls + readouts */}
      <div className="pk-glass rounded-[28px] p-5 md:p-7">
        <div className="space-y-6">
          <Segmented<Machine>
            label="Machine"
            value={machine}
            options={["da", "rotary"]}
            onChange={setMachine}
            format={(m) => (m === "da" ? "DA" : "Rotary")}
          />

          <div>
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <label htmlFor={speedId} className="font-display text-[13px] font-bold uppercase tracking-wide [font-stretch:115%]">
                Speed
              </label>
              <span className="pk-mono text-[13px] text-gold-hi" aria-live="polite">
                {nf(speed)} {range.unit}
              </span>
            </div>
            <input
              id={speedId}
              type="range"
              className="pk-range"
              min={range.min}
              max={range.max}
              step={range.step}
              value={speed}
              style={{ "--p": `${pct}%` } as React.CSSProperties}
              onChange={(e) => setSpeeds((s) => ({ ...s, [machine]: Number(e.target.value) }))}
            />
            <div className="pk-mono mt-1.5 flex justify-between text-[10px] text-muted">
              <span>{nf(range.min)}</span>
              <span>{nf(range.max)}</span>
            </div>
          </div>

          {isDA && <Segmented<number> label="Throw" value={throwMm} options={THROWS} onChange={setThrow} format={(t) => `${t}mm`} />}

          <Segmented<number> label="Pad Ø" value={padMm} options={PAD_SIZES} onChange={setPad} />

          {isDA && (
            <Segmented<Pressure>
              label="Pressure"
              hint={<Illustrative />}
              value={pressure}
              options={["light", "medium", "heavy"]}
              onChange={setPressure}
              format={(p) => p[0].toUpperCase() + p.slice(1)}
            />
          )}
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-line pt-6">
          <div>
            <dt className="pk-mono text-[10px] uppercase tracking-[0.16em] text-text-2">Centre speed</dt>
            <dd className="pk-display mt-1 text-[30px] md:text-[36px]">
              {nf(k.centreSpeed, 1)}
              <span className="ml-1 text-[14px] text-gold">m/s</span>
            </dd>
          </div>
          <div>
            <dt className="pk-mono text-[10px] uppercase tracking-[0.16em] text-text-2">Edge speed (peak)</dt>
            <dd className="pk-display mt-1 text-[30px] md:text-[36px]">
              {nf(k.edgeSpeed, 1)}
              <span className="ml-1 text-[14px] text-gold">m/s</span>
            </dd>
          </div>
          <div>
            <dt className="pk-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-text-2">
              Pad spin {k.spinIllustrative && <Illustrative />}
            </dt>
            <dd className="pk-display mt-1 text-[30px] md:text-[36px]">
              {k.spinIllustrative && "≈"}
              {nf(k.spinRpm)}
              <span className="ml-1 text-[14px] text-gold">RPM</span>
            </dd>
          </div>
          <div>
            <dt className="pk-mono text-[10px] uppercase tracking-[0.16em] text-text-2">Orbit</dt>
            <dd className="pk-display mt-1 text-[30px] md:text-[36px]">
              {isDA ? nf(k.orbitRadiusMm, 1) : "—"}
              {isDA && <span className="ml-1 text-[14px] text-gold">mm</span>}
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-[15px] leading-relaxed text-text-2">{insight}</p>
        <p className="mt-3 text-[12px] leading-snug text-muted">
          Motion is exact geometry. DA pad spin depends on machine, pad, paint and pressure, so it&apos;s shown as an
          estimate until it&apos;s replaced with The Pad King&apos;s test data.
        </p>
      </div>
    </div>
  );
}
