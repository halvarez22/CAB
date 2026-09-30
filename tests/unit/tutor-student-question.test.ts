import { describe, expect, it } from "vitest";
import {
  TUTOR_MAX_INPUT_LENGTH,
  assertStudentQuestionLength,
  sanitizeStudentQuestion,
} from "../../src/domain/tutor-contract";

describe("sanitizeStudentQuestion (I-A3)", () => {
  it("elimina HTML, trim y trunca a MAX", () => {
    expect(sanitizeStudentQuestion("  <b>Hola</b> mundo  ")).toBe("Hola mundo");
    const long = "a".repeat(TUTOR_MAX_INPUT_LENGTH + 50);
    expect(sanitizeStudentQuestion(long)?.length).toBe(TUTOR_MAX_INPUT_LENGTH);
  });

  it("undefined / vacío → undefined", () => {
    expect(sanitizeStudentQuestion(undefined)).toBeUndefined();
    expect(sanitizeStudentQuestion("   ")).toBeUndefined();
    expect(sanitizeStudentQuestion("<p></p>")).toBeUndefined();
  });
});

describe("assertStudentQuestionLength (I-A3 API)", () => {
  it("acepta ≤ MAX", () => {
    expect(assertStudentQuestionLength("ok")).toEqual({ ok: true });
    expect(
      assertStudentQuestionLength("x".repeat(TUTOR_MAX_INPUT_LENGTH)),
    ).toEqual({ ok: true });
  });

  it("rechaza 201 caracteres", () => {
    const r = assertStudentQuestionLength(
      "y".repeat(TUTOR_MAX_INPUT_LENGTH + 1),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("invalid_input_length");
  });
});
