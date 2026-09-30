/** Geometría didáctica del perfil (aprox. NACA 2412) en coords locales chord=1. */

export interface Point2 {
  x: number;
  y: number;
}

/** Contorno cerrado upper→lower (chord de 0 a 1, origen en LE). */
export const AIRFOIL_OUTLINE: readonly Point2[] = [
  { x: 0, y: 0 },
  { x: 0.02, y: 0.035 },
  { x: 0.05, y: 0.055 },
  { x: 0.1, y: 0.075 },
  { x: 0.2, y: 0.09 },
  { x: 0.3, y: 0.092 },
  { x: 0.4, y: 0.085 },
  { x: 0.5, y: 0.072 },
  { x: 0.6, y: 0.055 },
  { x: 0.7, y: 0.038 },
  { x: 0.8, y: 0.022 },
  { x: 0.9, y: 0.01 },
  { x: 1, y: 0 },
  { x: 0.9, y: -0.008 },
  { x: 0.8, y: -0.015 },
  { x: 0.7, y: -0.02 },
  { x: 0.6, y: -0.022 },
  { x: 0.5, y: -0.02 },
  { x: 0.4, y: -0.015 },
  { x: 0.3, y: -0.008 },
  { x: 0.2, y: 0.002 },
  { x: 0.1, y: 0.012 },
  { x: 0.05, y: 0.01 },
  { x: 0.02, y: 0.005 },
  { x: 0, y: 0 },
];

export function rotatePoint(p: Point2, deg: number): Point2 {
  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}
