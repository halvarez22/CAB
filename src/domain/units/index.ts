/** Conversiones de unidades documentadas (HRU — no son hardcoding de negocio). */

export const KT_TO_MS = 0.514444;
export const N_TO_LBF = 0.224809;

export function knotsToMetersPerSecond(knots: number): number {
  return knots * KT_TO_MS;
}

export function newtonsToPoundsForce(newtons: number): number {
  return newtons * N_TO_LBF;
}

export function dynamicPressurePa(densityKgM3: number, speedMs: number): number {
  return 0.5 * densityKgM3 * speedMs * speedMs;
}
