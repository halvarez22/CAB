import type { FlowStatus } from "../../domain/types";

export interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  life: number;
}

export interface SmokeSimState {
  particles: SmokeParticle[];
}

export function createSmokeSim(count = 80): SmokeSimState {
  const particles: SmokeParticle[] = [];
  for (let i = 0; i < count; i += 1) {
    particles.push(spawnParticle(true));
  }
  return { particles };
}

function spawnParticle(randomX: boolean): SmokeParticle {
  return {
    x: randomX ? Math.random() : -0.05,
    y: 0.15 + Math.random() * 0.7,
    vx: 0.35 + Math.random() * 0.35,
    life: 0.4 + Math.random() * 0.6,
  };
}

/**
 * Avanza partículas en coords normalizadas [0,1]².
 * Velocidad base ~ IAS; turbulencia extra en stall.
 */
export function stepSmoke(
  state: SmokeSimState,
  dt: number,
  iasKt: number,
  status: FlowStatus,
  paused: boolean,
): void {
  if (paused) return;

  const speedScale = iasKt / 100;
  const turb =
    status === "stall" ? 0.55 : status === "near_stall" ? 0.25 : 0.05;

  for (let i = 0; i < state.particles.length; i += 1) {
    const p = state.particles[i];
    p.x += p.vx * speedScale * dt;
    p.y += (Math.random() - 0.5) * turb * dt * 2;
    p.life -= dt * 0.08;

    if (p.x > 1.05 || p.life <= 0) {
      state.particles[i] = spawnParticle(false);
    }
  }
}

export function drawSmoke(
  ctx: CanvasRenderingContext2D,
  state: SmokeSimState,
  width: number,
  height: number,
): void {
  for (const p of state.particles) {
    const px = p.x * width;
    const py = p.y * height;
    const alpha = Math.max(0.15, Math.min(0.7, p.life));
    ctx.fillStyle = `rgba(120, 190, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}
