/** Contratos de dominio AEROLAB — fuente tipada única (AAD). */

export type FlapsDeg = 0 | 10 | 20 | 30;

export type FlowStatus = "stable" | "near_stall" | "stall";

export type AppView = "tunnel" | "theory";

export interface FlightParams {
  alphaDeg: number;
  iasKt: number;
  flapsDeg: FlapsDeg;
  paused: boolean;
}

export interface PolarPoint {
  alphaDeg: number;
  cl: number;
  cd: number;
}

export interface FlapsDelta {
  clAdd: number;
  cdAdd: number;
  criticalAlphaShiftDeg: number;
}

export interface AirfoilData {
  profile: string;
  version: string;
  source: string;
  calibrated_at: string;
  reference_conditions: {
    alpha_deg: number;
    IAS_KT: number;
    flaps_deg: number;
  };
  critical_alpha_deg: number;
  /** Área de referencia (m²) para fuerzas — calibrada al baseline Gemini. */
  reference_area_m2: number;
  /** Densidad del aire ISA (kg/m³). */
  air_density_kg_m3: number;
  units_note: string;
  polar: PolarPoint[];
  flaps_deltas: Record<string, FlapsDelta>;
  near_stall_margin_deg: number;
}

export interface AeroResult {
  cl: number;
  cd: number;
  liftN: number;
  dragN: number;
  liftLbf: number;
  dragLbf: number;
  lOverD: number;
  criticalAlphaDeg: number;
  status: FlowStatus;
  alphaDeg: number;
  iasKt: number;
  flapsDeg: FlapsDeg;
  airfoilProfile: string;
  airfoilVersion: string;
}

export interface BaselineCruiseFixture {
  condition: {
    alpha_deg: number;
    IAS_KT: number;
    flaps_deg: number;
  };
  expected: {
    lift_N: number;
    drag_N: number;
    cl: number;
    cd: number;
    l_over_d: number;
    critical_alpha_deg: number;
  };
  tolerances: {
    lift_rel: number;
    drag_rel: number;
    cl_abs: number;
    cd_abs: number;
    l_over_d_rel: number;
    critical_alpha_abs_deg: number;
  };
}
