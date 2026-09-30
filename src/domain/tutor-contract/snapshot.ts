import type { AeroResult } from "../types";
import type { AeroSnapshot } from "./types";

/** Proyecta AeroResult → snapshot tutor (sin mutar el motor). */
export function toAeroSnapshot(aero: AeroResult): AeroSnapshot {
  return {
    alphaDeg: aero.alphaDeg,
    iasKt: aero.iasKt,
    flapsDeg: aero.flapsDeg,
    cl: aero.cl,
    cd: aero.cd,
    liftN: aero.liftN,
    dragN: aero.dragN,
    liftLbf: aero.liftLbf,
    dragLbf: aero.dragLbf,
    lOverD: aero.lOverD,
    status: aero.status,
    criticalAlphaDeg: aero.criticalAlphaDeg,
  };
}
