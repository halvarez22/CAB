import { useEffect, useRef } from "react";
import type { AeroResult } from "../../domain/types";
import { COPY_ES } from "../../data/copy/es";
import { createTunnelRuntime, renderTunnelFrame } from "./render-frame";

export interface TunnelCanvasProps {
  alphaDeg: number;
  iasKt: number;
  paused: boolean;
  vectorsOn: boolean;
  smokeOn: boolean;
  aero: AeroResult;
}

export function TunnelCanvas({
  alphaDeg,
  iasKt,
  paused,
  vectorsOn,
  smokeOn,
  aero,
}: TunnelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef(createTunnelRuntime());
  const frameRef = useRef({
    alphaDeg,
    iasKt,
    paused,
    vectorsOn,
    smokeOn,
    aero,
  });

  useEffect(() => {
    frameRef.current = { alphaDeg, iasKt, paused, vectorsOn, smokeOn, aero };
  }, [alphaDeg, iasKt, paused, vectorsOn, smokeOn, aero]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let alive = true;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || 800;
      const h = Math.max(280, Math.min(420, Math.round(w * 0.42)));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = frameRef.current;
      renderTunnelFrame(ctx, runtimeRef.current, {
        width: canvas.clientWidth || 800,
        height: canvas.clientHeight || 320,
        alphaDeg: f.alphaDeg,
        iasKt: f.iasKt,
        paused: f.paused,
        vectorsOn: f.vectorsOn,
        smokeOn: f.smokeOn,
        aero: f.aero,
        dt,
      });
      raf = requestAnimationFrame(loop);
    };

    // En tests evitamos el loop RAF (jsdom + StrictMode generan ruido/flakes).
    if (import.meta.env.MODE === "test") {
      const f = frameRef.current;
      renderTunnelFrame(ctx, runtimeRef.current, {
        width: canvas.clientWidth || 800,
        height: canvas.clientHeight || 320,
        alphaDeg: f.alphaDeg,
        iasKt: f.iasKt,
        paused: f.paused,
        vectorsOn: f.vectorsOn,
        smokeOn: f.smokeOn,
        aero: f.aero,
        dt: 0.016,
      });
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="tunnel" data-testid="tunnel-canvas">
      <div className="tunnel__meta">
        <span>
          {COPY_ES.telemetry.relativeWind}: {iasKt} KT
        </span>
        <span>
          {COPY_ES.telemetry.profile}: {aero.airfoilProfile}
        </span>
      </div>
      <div className="tunnel__stage">
        <canvas ref={canvasRef} role="img" aria-label={COPY_ES.views.tunnel} />
      </div>
      {vectorsOn ? (
        <ul className="tunnel__legend">
          <li className="tunnel__legend--lift">{COPY_ES.legend.lift}</li>
          <li className="tunnel__legend--drag">{COPY_ES.legend.drag}</li>
          <li className="tunnel__legend--r">{COPY_ES.legend.resultant}</li>
        </ul>
      ) : null}
    </div>
  );
}
