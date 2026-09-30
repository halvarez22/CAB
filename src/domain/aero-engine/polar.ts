import type { AirfoilData, FlapsDeg, FlapsDelta, PolarPoint } from "../types";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Interpolación lineal en la polar tabular (α creciente). */
export function interpolatePolar(
  polar: readonly PolarPoint[],
  alphaDeg: number,
): { cl: number; cd: number } {
  if (polar.length === 0) {
    throw new Error("Polar vacía");
  }

  if (alphaDeg <= polar[0].alphaDeg) {
    return { cl: polar[0].cl, cd: polar[0].cd };
  }

  const last = polar[polar.length - 1];
  if (alphaDeg >= last.alphaDeg) {
    return { cl: last.cl, cd: last.cd };
  }

  for (let i = 0; i < polar.length - 1; i += 1) {
    const left = polar[i];
    const right = polar[i + 1];
    if (alphaDeg >= left.alphaDeg && alphaDeg <= right.alphaDeg) {
      const span = right.alphaDeg - left.alphaDeg;
      const t = span === 0 ? 0 : (alphaDeg - left.alphaDeg) / span;
      return {
        cl: lerp(left.cl, right.cl, t),
        cd: lerp(left.cd, right.cd, t),
      };
    }
  }

  return { cl: last.cl, cd: last.cd };
}

export function resolveFlapsDelta(
  airfoil: AirfoilData,
  flapsDeg: FlapsDeg,
): FlapsDelta {
  const key = String(flapsDeg);
  const delta = airfoil.flaps_deltas[key];
  if (!delta) {
    return { clAdd: 0, cdAdd: 0, criticalAlphaShiftDeg: 0 };
  }
  return delta;
}
