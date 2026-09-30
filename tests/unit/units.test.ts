import { describe, expect, it } from "vitest";
import {
  knotsToMetersPerSecond,
  newtonsToPoundsForce,
  KT_TO_MS,
  N_TO_LBF,
} from "../../src/domain/units";

describe("units", () => {
  it("convierte KT y N con factores documentados", () => {
    expect(knotsToMetersPerSecond(100)).toBeCloseTo(100 * KT_TO_MS, 6);
    expect(newtonsToPoundsForce(2389)).toBeCloseTo(2389 * N_TO_LBF, 4);
  });
});
