import type { AeroResult, FlowStatus } from "../../domain/types";
import { AIRFOIL_OUTLINE, rotatePoint } from "./airfoil-geometry";
import {
  createSmokeSim,
  drawSmoke,
  stepSmoke,
  type SmokeSimState,
} from "../flow-visual/smoke";
import { drawForceVectors } from "../vectors/draw-vectors";

export interface TunnelFrameInput {
  width: number;
  height: number;
  alphaDeg: number;
  iasKt: number;
  paused: boolean;
  vectorsOn: boolean;
  smokeOn: boolean;
  aero: AeroResult;
  dt: number;
}

export interface TunnelRuntime {
  smoke: SmokeSimState;
}

export function createTunnelRuntime(): TunnelRuntime {
  return { smoke: createSmokeSim(90) };
}

function statusGlow(status: FlowStatus): string {
  if (status === "stall") return "rgba(255, 80, 80, 0.18)";
  if (status === "near_stall") return "rgba(240, 180, 40, 0.14)";
  return "rgba(40, 180, 120, 0.10)";
}

function drawAirfoil(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  chordPx: number,
  alphaDeg: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  // Convención pantalla: α positivo (nariz arriba) = rotación antihoraria en canvas Y-down → negativo
  ctx.beginPath();
  AIRFOIL_OUTLINE.forEach((p, i) => {
    const r = rotatePoint(p, -alphaDeg);
    const x = (r.x - 0.25) * chordPx;
    const y = -r.y * chordPx;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(90, 170, 255, 0.15)";
  ctx.strokeStyle = "#7ec8ff";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function renderTunnelFrame(
  ctx: CanvasRenderingContext2D,
  runtime: TunnelRuntime,
  input: TunnelFrameInput,
): void {
  const { width, height, alphaDeg, iasKt, paused, vectorsOn, smokeOn, aero, dt } =
    input;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#07101c";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = statusGlow(aero.status);
  ctx.fillRect(0, 0, width, height);

  // Flujo de referencia (izquierda → derecha)
  ctx.strokeStyle = "rgba(80, 110, 150, 0.35)";
  ctx.beginPath();
  ctx.moveTo(16, height * 0.5);
  ctx.lineTo(width * 0.18, height * 0.5);
  ctx.stroke();

  if (smokeOn) {
    stepSmoke(runtime.smoke, dt, iasKt, aero.status, paused);
    drawSmoke(ctx, runtime.smoke, width, height);
  }

  const cx = width * 0.45;
  const cy = height * 0.52;
  const chordPx = Math.min(width, height) * 0.42;
  drawAirfoil(ctx, cx, cy, chordPx, alphaDeg);

  if (vectorsOn) {
    drawForceVectors(ctx, {
      aero,
      originX: cx,
      originY: cy,
      scalePxPerN: 0.035,
    });
  }
}
