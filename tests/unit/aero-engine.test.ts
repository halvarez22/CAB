import { describe, expect, it } from "vitest";
import { computeAero, resolveFlowStatus } from "../../src/domain/aero-engine";
import { getDefaultAirfoil } from "../../src/data/airfoils";
import type { BaselineCruiseFixture } from "../../src/domain/types";
import baseline from "../fixtures/baseline-cruise.json";

const fixture = baseline as BaselineCruiseFixture;
const airfoil = getDefaultAirfoil();

function withinRel(actual: number, expected: number, relTol: number): boolean {
  return Math.abs(actual - expected) <= Math.abs(expected) * relTol;
}

function withinAbs(actual: number, expected: number, absTol: number): boolean {
  return Math.abs(actual - expected) <= absTol;
}

describe("aero-engine — baseline crucero (FDP / SQA)", () => {
  it("cumple tolerancias del Addendum v1.1 en α=4°, 100 KT, flaps 0°", () => {
    const result = computeAero(
      {
        alphaDeg: fixture.condition.alpha_deg,
        iasKt: fixture.condition.IAS_KT,
        flapsDeg: 0,
      },
      airfoil,
    );

    expect(
      withinRel(result.liftN, fixture.expected.lift_N, fixture.tolerances.lift_rel),
    ).toBe(true);
    expect(
      withinRel(result.dragN, fixture.expected.drag_N, fixture.tolerances.drag_rel),
    ).toBe(true);
    expect(
      withinAbs(result.cl, fixture.expected.cl, fixture.tolerances.cl_abs),
    ).toBe(true);
    expect(
      withinAbs(result.cd, fixture.expected.cd, fixture.tolerances.cd_abs),
    ).toBe(true);
    expect(
      withinRel(
        result.lOverD,
        fixture.expected.l_over_d,
        fixture.tolerances.l_over_d_rel,
      ),
    ).toBe(true);
    expect(
      withinAbs(
        result.criticalAlphaDeg,
        fixture.expected.critical_alpha_deg,
        fixture.tolerances.critical_alpha_abs_deg,
      ),
    ).toBe(true);
    expect(result.status).toBe("stable");
    expect(result.airfoilVersion).toBe(airfoil.version);
  });

  it("marca stall cuando α ≥ crítico", () => {
    const result = computeAero(
      { alphaDeg: 16, iasKt: 100, flapsDeg: 0 },
      airfoil,
    );
    expect(result.status).toBe("stall");
  });

  it("marca near_stall dentro del margen", () => {
    const critical = airfoil.critical_alpha_deg;
    const alpha = critical - airfoil.near_stall_margin_deg / 2;
    expect(
      resolveFlowStatus(alpha, critical, airfoil.near_stall_margin_deg),
    ).toBe("near_stall");
  });

  it("aumenta CL y CD con flaps 30° respecto a limpio", () => {
    const clean = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 0 },
      airfoil,
    );
    const landing = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 30 },
      airfoil,
    );
    expect(landing.cl).toBeGreaterThan(clean.cl);
    expect(landing.cd).toBeGreaterThan(clean.cd);
  });

  it("aplica flaps_deltas 10° (despegue) sobre limpio", () => {
    const clean = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 0 },
      airfoil,
    );
    const takeoff = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 10 },
      airfoil,
    );
    expect(takeoff.cl).toBeCloseTo(clean.cl + 0.22, 5);
    expect(takeoff.cd).toBeCloseTo(clean.cd + 0.015, 5);
    expect(takeoff.criticalAlphaDeg).toBeCloseTo(
      airfoil.critical_alpha_deg - 0.6,
      5,
    );
  });

  it("aplica flaps_deltas 20° (aproximación) sobre limpio", () => {
    const clean = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 0 },
      airfoil,
    );
    const approach = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 20 },
      airfoil,
    );
    expect(approach.cl).toBeCloseTo(clean.cl + 0.4, 5);
    expect(approach.cd).toBeCloseTo(clean.cd + 0.035, 5);
    expect(approach.criticalAlphaDeg).toBeCloseTo(
      airfoil.critical_alpha_deg - 1.2,
      5,
    );
  });
});
