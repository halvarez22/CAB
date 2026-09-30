import type { AirfoilData, AeroResult, PolarPoint } from "../../domain/types";

export interface ChartScale {
  padL: number;
  padR: number;
  padT: number;
  padB: number;
  width: number;
  height: number;
  alphaMin: number;
  alphaMax: number;
  clMin: number;
  clMax: number;
}

/** Escala lineal pura para SVG — no interpola polar. */
export function buildChartScale(
  polar: readonly PolarPoint[],
  width: number,
  height: number,
): ChartScale {
  const alphas = polar.map((p) => p.alphaDeg);
  const cls = polar.map((p) => p.cl);
  const alphaMin = Math.min(...alphas);
  const alphaMax = Math.max(...alphas);
  const clMin = Math.min(0, ...cls) - 0.1;
  const clMax = Math.max(...cls) + 0.15;
  return {
    padL: 48,
    padR: 16,
    padT: 16,
    padB: 36,
    width,
    height,
    alphaMin,
    alphaMax,
    clMin,
    clMax,
  };
}

export function alphaToX(scale: ChartScale, alphaDeg: number): number {
  const { padL, padR, width, alphaMin, alphaMax } = scale;
  const t = (alphaDeg - alphaMin) / (alphaMax - alphaMin || 1);
  return padL + t * (width - padL - padR);
}

export function clToY(scale: ChartScale, cl: number): number {
  const { padT, padB, height, clMin, clMax } = scale;
  const t = (cl - clMin) / (clMax - clMin || 1);
  return height - padB - t * (height - padT - padB);
}

export function polarToPolyline(
  polar: readonly PolarPoint[],
  scale: ChartScale,
): string {
  return polar
    .map((p) => `${alphaToX(scale, p.alphaDeg)},${clToY(scale, p.cl)}`)
    .join(" ");
}

export interface TheorySnapshot {
  profile: string;
  version: string;
  source: string;
  calibratedAt: string;
  density: number;
  area: number;
  criticalAlpha: number;
  alphaDeg: number;
  cl: number;
  cd: number;
  lOverD: number;
  status: AeroResult["status"];
}

/** Proyecta airfoil + AeroResult a números del manual (HRU/FDP). */
export function buildTheorySnapshot(
  airfoil: AirfoilData,
  aero: AeroResult,
): TheorySnapshot {
  return {
    profile: airfoil.profile,
    version: airfoil.version,
    source: airfoil.source,
    calibratedAt: airfoil.calibrated_at,
    density: airfoil.air_density_kg_m3,
    area: airfoil.reference_area_m2,
    criticalAlpha: aero.criticalAlphaDeg,
    alphaDeg: aero.alphaDeg,
    cl: aero.cl,
    cd: aero.cd,
    lOverD: aero.lOverD,
    status: aero.status,
  };
}
