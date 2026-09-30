import type { AeroResult, AirfoilData, FlightParams, FlowStatus } from "../types";
import {
  dynamicPressurePa,
  knotsToMetersPerSecond,
  newtonsToPoundsForce,
} from "../units";
import { interpolatePolar, resolveFlapsDelta } from "./polar";

export function resolveFlowStatus(
  alphaDeg: number,
  criticalAlphaDeg: number,
  nearStallMarginDeg: number,
): FlowStatus {
  if (alphaDeg >= criticalAlphaDeg) {
    return "stall";
  }
  if (alphaDeg >= criticalAlphaDeg - nearStallMarginDeg) {
    return "near_stall";
  }
  return "stable";
}

/**
 * Motor aerodinámico puro (sin React/DOM).
 * Entrada: FlightParams + AirfoilData → AeroResult + FlowStatus.
 */
export function computeAero(
  params: Pick<FlightParams, "alphaDeg" | "iasKt" | "flapsDeg">,
  airfoil: AirfoilData,
): AeroResult {
  const flaps = resolveFlapsDelta(airfoil, params.flapsDeg);
  const criticalAlphaDeg =
    airfoil.critical_alpha_deg + flaps.criticalAlphaShiftDeg;

  const base = interpolatePolar(airfoil.polar, params.alphaDeg);
  const cl = base.cl + flaps.clAdd;
  const cd = Math.max(base.cd + flaps.cdAdd, 1e-6);

  const speedMs = knotsToMetersPerSecond(params.iasKt);
  const q = dynamicPressurePa(airfoil.air_density_kg_m3, speedMs);
  const liftN = q * airfoil.reference_area_m2 * cl;
  const dragN = q * airfoil.reference_area_m2 * cd;
  const lOverD = liftN / dragN;

  const status = resolveFlowStatus(
    params.alphaDeg,
    criticalAlphaDeg,
    airfoil.near_stall_margin_deg,
  );

  return {
    cl,
    cd,
    liftN,
    dragN,
    liftLbf: newtonsToPoundsForce(liftN),
    dragLbf: newtonsToPoundsForce(dragN),
    lOverD,
    criticalAlphaDeg,
    status,
    alphaDeg: params.alphaDeg,
    iasKt: params.iasKt,
    flapsDeg: params.flapsDeg,
    airfoilProfile: airfoil.profile,
    airfoilVersion: airfoil.version,
  };
}

export { interpolatePolar, resolveFlapsDelta } from "./polar";
