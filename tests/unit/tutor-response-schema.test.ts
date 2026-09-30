import { describe, expect, it } from "vitest";
import {
  TUTOR_MAX_RESPONSE_LENGTH,
  parseTutorResponse,
  safeParseTutorResponse,
} from "../../src/domain/tutor-contract";

describe("tutor response-schema (H-I2)", () => {
  it("parsea respuesta válida", () => {
    const data = parseTutorResponse({
      titulo: "Estable",
      explicacion: "Flujo adherido.",
      alerta_seguridad: "Sin pérdida.",
      siguiente_paso: "Sube α gradualmente.",
    });
    expect(data.titulo).toBe("Estable");
  });

  it("rechaza campos vacíos", () => {
    const r = safeParseTutorResponse({
      titulo: "  ",
      explicacion: "ok",
      alerta_seguridad: "ok",
      siguiente_paso: "ok",
    });
    expect(r.success).toBe(false);
  });

  it("rechaza suma de longitudes > TUTOR_MAX_RESPONSE_LENGTH", () => {
    const big = "x".repeat(TUTOR_MAX_RESPONSE_LENGTH);
    const r = safeParseTutorResponse({
      titulo: "T",
      explicacion: big,
      alerta_seguridad: "a",
      siguiente_paso: "b",
    });
    expect(r.success).toBe(false);
  });
});
