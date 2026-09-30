import type { FlapsDeg, FlowStatus } from "../types";

/** Vista reducida del resultado aerodinámico para el tutor (FDP — solo estos números). */
export interface AeroSnapshot {
  alphaDeg: number;
  iasKt: number;
  flapsDeg: FlapsDeg;
  cl: number;
  cd: number;
  liftN: number;
  dragN: number;
  liftLbf: number;
  dragLbf: number;
  lOverD: number;
  status: FlowStatus;
  criticalAlphaDeg: number;
}

export interface TutorResponse {
  titulo: string;
  explicacion: string;
  alerta_seguridad: string;
  siguiente_paso: string;
}

export type TutorErrorCode =
  | "missing_api_key"
  | "invalid_request"
  | "invalid_input_length"
  | "rate_limited"
  | "timeout"
  | "upstream_error"
  | "invalid_schema"
  | "unverifiable_numbers"
  | "error";

export interface TutorExplainRequest {
  snapshot: AeroSnapshot;
  /**
   * Pregunta corta del alumno (I-A3). Vive en el request, NO en el snapshot aero (FDP).
   * Alias API: `studentQuestion` | `question`.
   */
  studentQuestion?: string;
  /** @deprecated Preferir studentQuestion — se acepta por compat. */
  question?: string;
}

export type TutorExplainResult =
  | { ok: true; data: TutorResponse }
  | { ok: false; code: TutorErrorCode; detail?: string };
