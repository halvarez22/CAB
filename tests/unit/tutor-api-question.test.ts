import { describe, expect, it } from "vitest";
import {
  extractStudentQuestion,
  validateTutorQuestionField,
} from "../../api/tutor";
import { TUTOR_MAX_INPUT_LENGTH } from "../../src/domain/tutor-contract";

describe("api/tutor question validation (I-A3)", () => {
  it("extractStudentQuestion prefiere studentQuestion", () => {
    expect(
      extractStudentQuestion({
        studentQuestion: "A",
        question: "B",
      }),
    ).toBe("A");
    expect(extractStudentQuestion({ question: "B" })).toBe("B");
  });

  it("rechaza input de 201 caracteres (invalid_input_length)", () => {
    const raw = "z".repeat(TUTOR_MAX_INPUT_LENGTH + 1);
    const r = validateTutorQuestionField(raw);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("invalid_input_length");
  });

  it("acepta 200 caracteres", () => {
    const raw = "z".repeat(TUTOR_MAX_INPUT_LENGTH);
    const r = validateTutorQuestionField(raw);
    expect(r.ok).toBe(true);
  });
});
