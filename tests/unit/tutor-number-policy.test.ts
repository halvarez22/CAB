import { describe, expect, it } from "vitest";
import {
  assertTutorNumbersMatchSnapshot,
  extractNumbersFromText,
  isInnocuousTutorNumber,
  numberMatchesSnapshot,
  tutorResponseTextBlob,
} from "../../src/domain/tutor-contract";
import type { AeroSnapshot } from "../../src/domain/tutor-contract";

const baseSnap: AeroSnapshot = {
  alphaDeg: 4,
  iasKt: 100,
  flapsDeg: 0,
  cl: 0.67,
  cd: 0.043,
  liftN: 2389,
  dragN: 154,
  liftLbf: 537,
  dragLbf: 35,
  lOverD: 15.5,
  status: "stable",
  criticalAlphaDeg: 15.5,
};

describe("tutor number-policy (H-I1)", () => {
  it("extrae literales numéricos completos", () => {
    expect(extractNumbersFromText("α=4° CL 0.67 y 15.5")).toEqual([
      4, 0.67, 15.5,
    ]);
  });

  it("marca 1–4 y años 20xx como inocuos", () => {
    expect(isInnocuousTutorNumber(1)).toBe(true);
    expect(isInnocuousTutorNumber(4)).toBe(true);
    expect(isInnocuousTutorNumber(5)).toBe(false);
    expect(isInnocuousTutorNumber(2026)).toBe(true);
  });

  it("acepta números del snapshot dentro de tolerancia", () => {
    expect(numberMatchesSnapshot(4, baseSnap)).toBe(true);
    expect(numberMatchesSnapshot(0.67, baseSnap)).toBe(true);
    expect(numberMatchesSnapshot(15.5, baseSnap)).toBe(true);
    expect(numberMatchesSnapshot(100, baseSnap)).toBe(true);
  });

  it("ok: explicación cualitativa + números del snapshot + pasos 1–3", () => {
    const text = tutorResponseTextBlob({
      titulo: "Régimen estable",
      explicacion:
        "Con α cerca de 4° y CL 0.67 el flujo es estable. Pasos: 1 subir α con cuidado 2 observar L/D 15.5",
      alerta_seguridad: "Mantén margen respecto al crítico 15.5°.",
      siguiente_paso: "3 Explora flaps 0 primero.",
    });
    expect(assertTutorNumbersMatchSnapshot(text, baseSnap).ok).toBe(true);
  });

  it("rechaza número inventado (CL falso)", () => {
    const text = "El CL es 1.99 en este punto.";
    const r = assertTutorNumbersMatchSnapshot(text, baseSnap);
    expect(r.ok).toBe(false);
    expect(r.offenders).toContain(1.99);
  });

  it("rechaza α crítico inventado", () => {
    const r = assertTutorNumbersMatchSnapshot(
      "El crítico está en 22 grados.",
      baseSnap,
    );
    expect(r.ok).toBe(false);
    expect(r.offenders).toContain(22);
  });
});
