import type { AeroResult } from "../../domain/types";

const LIFT_COLOR = "#3dd68c";
const DRAG_COLOR = "#ff6b6b";
const RESULTANT_COLOR = "#f0c14a";

export interface VectorDrawInput {
  aero: AeroResult;
  originX: number;
  originY: number;
  /** Escala px por Newton (se clampa a longitudes legibles). */
  scalePxPerN: number;
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  dashed = false,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  if (dashed) ctx.setLineDash([6, 4]);
  else ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();

  const angle = Math.atan2(y1 - y0, x1 - x0);
  const head = 10;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(
    x1 - head * Math.cos(angle - 0.4),
    y1 - head * Math.sin(angle - 0.4),
  );
  ctx.lineTo(
    x1 - head * Math.cos(angle + 0.4),
    y1 - head * Math.sin(angle + 0.4),
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Vectores en pantalla: L ↑ (pantalla −Y), D → (+X flujo), R = L+D.
 * Magnitudes relativas a fuerzas del motor (FDP).
 */
export function drawForceVectors(
  ctx: CanvasRenderingContext2D,
  input: VectorDrawInput,
): void {
  const { aero, originX, originY, scalePxPerN } = input;
  const liftLen = Math.min(140, Math.max(24, aero.liftN * scalePxPerN));
  const dragLen = Math.min(120, Math.max(16, aero.dragN * scalePxPerN));

  const liftX = originX;
  const liftY = originY - liftLen;
  const dragX = originX + dragLen;
  const dragY = originY;
  const resX = originX + dragLen;
  const resY = originY - liftLen;

  drawArrow(ctx, originX, originY, liftX, liftY, LIFT_COLOR);
  drawArrow(ctx, originX, originY, dragX, dragY, DRAG_COLOR);
  drawArrow(ctx, originX, originY, resX, resY, RESULTANT_COLOR, true);
}
