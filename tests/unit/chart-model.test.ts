import { describe, expect, it } from "vitest";
import { getDefaultAirfoil } from "../../src/data/airfoils";
import { computeAero } from "../../src/domain/aero-engine";
import {
  buildChartScale,
  buildTheorySnapshot,
  polarToPolyline,
} from "../../src/ui/charts/chart-model";

describe("chart-model (Fase 4/5)", () => {
  const airfoil = getDefaultAirfoil();

  it("construye polyline desde polar tabular sin alterar CL", () => {
    const scale = buildChartScale(airfoil.polar, 400, 240);
    const poly = polarToPolyline(airfoil.polar, scale);
    expect(poly.split(" ").length).toBe(airfoil.polar.length);
    expect(airfoil.polar.find((p) => p.alphaDeg === 4)?.cl).toBe(0.67);
  });

  it("theory snapshot lee densidades del airfoil y crítico/CL del motor (FDP)", () => {
    const aero = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 0 },
      airfoil,
    );
    const snap = buildTheorySnapshot(airfoil, aero);
    expect(snap.density).toBe(airfoil.air_density_kg_m3);
    expect(snap.area).toBe(airfoil.reference_area_m2);
    expect(snap.criticalAlpha).toBe(aero.criticalAlphaDeg);
    expect(snap.cl).toBe(aero.cl);
    expect(snap.version).toBe(airfoil.version);
  });
});
