import type { FlapsDeg, FlightParams } from "../types";
import { getRegimeById } from "../../data/regimes/es";

/** Estado de vuelo por defecto = baseline crucero (FDP / no-regresión). */
export const DEFAULT_FLIGHT_PARAMS: FlightParams = {
  alphaDeg: getRegimeById("cruise").alphaDeg,
  iasKt: 100,
  flapsDeg: 0,
  paused: false,
};

export function clampAlpha(alphaDeg: number): number {
  return Math.min(20, Math.max(-6, alphaDeg));
}

export function clampIas(iasKt: number): number {
  return Math.min(180, Math.max(40, iasKt));
}

export function isFlapsDeg(value: number): value is FlapsDeg {
  return value === 0 || value === 10 || value === 20 || value === 30;
}

export function createCruiseParams(): FlightParams {
  return { ...DEFAULT_FLIGHT_PARAMS };
}

export function createClimbParams(): FlightParams {
  return {
    ...DEFAULT_FLIGHT_PARAMS,
    alphaDeg: getRegimeById("climb").alphaDeg,
  };
}

export function createStallDemoParams(): FlightParams {
  return {
    ...DEFAULT_FLIGHT_PARAMS,
    alphaDeg: getRegimeById("stall").alphaDeg,
  };
}
