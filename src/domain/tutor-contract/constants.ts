/** Constantes tutor IA — APO-IA-1.1 H-I4 (HRU). */

export const TUTOR_TIMEOUT_MS = 10_000;
export const TUTOR_RATE_LIMIT_PER_MINUTE = 5;
export const TUTOR_MAX_INPUT_LENGTH = 200;
export const TUTOR_MAX_RESPONSE_LENGTH = 1500;
export const TUTOR_TEMPERATURE = 0.3;

/** Modelo default Groq (APO-IA-1.1). Override server: env GROQ_MODEL. */
export const TUTOR_GROQ_MODEL = "llama-3.3-70b-versatile";

export const NUMBER_TOLERANCE = {
  alphaDeg: 0.5,
  criticalAlphaDeg: 0.5,
  cl: 0.05,
  cd: 0.01,
  lOverD: 0.5,
  iasKt: 1,
  forceRel: 0.05,
  forceAbsN: 50,
  forceAbsLbf: 10,
} as const;
