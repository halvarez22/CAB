import { describe, expect, it } from "vitest";
import {
  interpolatePolar,
  resolveFlapsDelta,
} from "../../src/domain/aero-engine";
import { getDefaultAirfoil } from "../../src/data/airfoils";
import type { AirfoilData, PolarPoint } from "../../src/domain/types";

describe("aero-engine polar helpers", () => {
  const airfoil = getDefaultAirfoil();

  it("extrapola por clamp en extremos de la polar", () => {
    const lo = interpolatePolar(airfoil.polar, -99);
    const hi = interpolatePolar(airfoil.polar, 99);
    expect(lo.cl).toBe(airfoil.polar[0].cl);
    expect(hi.cl).toBe(airfoil.polar[airfoil.polar.length - 1].cl);
  });

  it("falla si la polar está vacía", () => {
    expect(() => interpolatePolar([], 0)).toThrow(/Polar vacía/);
  });

  it("interpola entre dos puntos contiguos", () => {
    const mid = interpolatePolar(airfoil.polar, 5);
    expect(mid.cl).toBeGreaterThan(0.67);
    expect(mid.cl).toBeLessThan(0.88);
  });

  it("resuelve delta de flaps 10/20/30 y fallback", () => {
    expect(resolveFlapsDelta(airfoil, 10)).toEqual({
      clAdd: 0.22,
      cdAdd: 0.015,
      criticalAlphaShiftDeg: -0.6,
    });
    expect(resolveFlapsDelta(airfoil, 20)).toEqual({
      clAdd: 0.40,
      cdAdd: 0.035,
      criticalAlphaShiftDeg: -1.2,
    });
    expect(resolveFlapsDelta(airfoil, 30).clAdd).toBeGreaterThan(0);
    const bare: AirfoilData = {
      ...airfoil,
      flaps_deltas: {},
    };
    expect(resolveFlapsDelta(bare, 30)).toEqual({
      clAdd: 0,
      cdAdd: 0,
      criticalAlphaShiftDeg: 0,
    });
  });

  it("maneja polar de un solo punto", () => {
    const single: PolarPoint[] = [{ alphaDeg: 0, cl: 0.2, cd: 0.01 }];
    expect(interpolatePolar(single, 4)).toEqual({ cl: 0.2, cd: 0.01 });
  });
});
