import { describe, expect, it } from "vitest";
import {
  clampAlpha,
  clampIas,
  createClimbParams,
  createCruiseParams,
  createStallDemoParams,
  DEFAULT_FLIGHT_PARAMS,
} from "../../src/domain/flight-state";

describe("flight-state params", () => {
  it("default coincide con crucero baseline", () => {
    expect(DEFAULT_FLIGHT_PARAMS.alphaDeg).toBe(4);
    expect(DEFAULT_FLIGHT_PARAMS.iasKt).toBe(100);
    expect(DEFAULT_FLIGHT_PARAMS.flapsDeg).toBe(0);
  });

  it("presets de instructor son coherentes", () => {
    expect(createCruiseParams().alphaDeg).toBe(4);
    expect(createClimbParams().alphaDeg).toBe(12);
    expect(createStallDemoParams().alphaDeg).toBe(16);
  });

  it("clampa α e IAS a rangos didácticos", () => {
    expect(clampAlpha(-100)).toBe(-6);
    expect(clampAlpha(99)).toBe(20);
    expect(clampIas(10)).toBe(40);
    expect(clampIas(400)).toBe(180);
  });
});
