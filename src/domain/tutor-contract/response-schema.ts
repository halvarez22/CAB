import { z } from "zod";
import { TUTOR_MAX_RESPONSE_LENGTH } from "./constants";
import type { TutorResponse } from "./types";

const nonEmpty = z.string().trim().min(1);

export const TutorResponseSchema = z
  .object({
    titulo: nonEmpty.max(200),
    explicacion: nonEmpty,
    alerta_seguridad: nonEmpty,
    siguiente_paso: nonEmpty,
  })
  .superRefine((val, ctx) => {
    const sum =
      val.titulo.length +
      val.explicacion.length +
      val.alerta_seguridad.length +
      val.siguiente_paso.length;
    if (sum > TUTOR_MAX_RESPONSE_LENGTH) {
      ctx.addIssue({
        code: "custom",
        message: `Respuesta tutor excede ${TUTOR_MAX_RESPONSE_LENGTH} caracteres`,
      });
    }
  });

export type TutorResponseParsed = z.infer<typeof TutorResponseSchema>;

export function parseTutorResponse(raw: unknown): TutorResponse {
  return TutorResponseSchema.parse(raw);
}

export function safeParseTutorResponse(raw: unknown) {
  return TutorResponseSchema.safeParse(raw);
}
