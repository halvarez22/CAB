import { describe, expect, it } from "vitest";
import { createSmokeSim, stepSmoke } from "../../src/ui/flow-visual/smoke";
import { rotatePoint } from "../../src/ui/tunnel/airfoil-geometry";

describe("flow-visual / geometry (Fase 3)", () => {
  it("no avanza humo si paused", () => {
    const sim = createSmokeSim(10);
    const before = sim.particles.map((p) => p.x);
    stepSmoke(sim, 0.05, 100, "stable", true);
    expect(sim.particles.map((p) => p.x)).toEqual(before);
  });

  it("avanza partículas con IAS > 0", () => {
    const sim = createSmokeSim(10);
    const before = sim.particles[0].x;
    stepSmoke(sim, 0.05, 100, "stable", false);
    expect(sim.particles[0].x).not.toBe(before);
  });

  it("rota geometría del perfil", () => {
    const p = rotatePoint({ x: 1, y: 0 }, 90);
    expect(p.x).toBeCloseTo(0, 5);
    expect(p.y).toBeCloseTo(1, 5);
  });
});
