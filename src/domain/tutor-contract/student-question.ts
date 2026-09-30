import { TUTOR_MAX_INPUT_LENGTH } from "./constants";

/**
 * Sanitiza pregunta del alumno (I-A3): strip HTML + trim + truncado.
 * Usada en cliente (defensa) y en pipeline server.
 */
export function sanitizeStudentQuestion(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const cleaned = raw.replace(/<[^>]*>/g, "").trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, TUTOR_MAX_INPUT_LENGTH);
}

/**
 * Rechazo estricto si el cliente envía más de MAX sin truncar (API).
 */
export function assertStudentQuestionLength(
  raw: string | undefined,
): { ok: true } | { ok: false; code: "invalid_input_length" } {
  if (raw === undefined) return { ok: true };
  if (raw.length > TUTOR_MAX_INPUT_LENGTH) {
    return { ok: false, code: "invalid_input_length" };
  }
  return { ok: true };
}
