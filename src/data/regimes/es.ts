/** Regímenes de vuelo versionados — dato, no copy en JSX (H5 / U-First / HRU). */

export type RegimeId = "dive" | "cruise" | "climb" | "stall";

export interface RegimeDefinition {
  id: RegimeId;
  label: string;
  alphaDeg: number;
  note: string;
}

export const REGIMES_ES: readonly RegimeDefinition[] = [
  {
    id: "dive",
    label: "Picado",
    alphaDeg: -6,
    note: "Ángulo de ataque negativo de referencia en el slider.",
  },
  {
    id: "cruise",
    label: "Crucero",
    alphaDeg: 4,
    note: "Preset y baseline de no-regresión (α = +4°).",
  },
  {
    id: "climb",
    label: "Ascenso",
    alphaDeg: 12,
    note: "Régimen de ascenso de referencia.",
  },
  {
    id: "stall",
    label: "Pérdida",
    alphaDeg: 16,
    note: "Por encima del ángulo crítico — requiere acción de recuperación.",
  },
] as const;

export function getRegimeById(id: RegimeId): RegimeDefinition {
  const found = REGIMES_ES.find((r) => r.id === id);
  if (!found) {
    throw new Error(`Régimen desconocido: ${id}`);
  }
  return found;
}
