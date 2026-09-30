import { afterEach, describe, expect, it, vi } from "vitest";
import {
  runTutorExplain,
  type AeroSnapshot,
} from "../../src/domain/tutor-contract";

const snap: AeroSnapshot = {
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

function groqJson(content: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      choices: [{ message: { content: JSON.stringify(content) } }],
    }),
  } as Response;
}

describe("tutor pipeline (mock Groq — sin red)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("missing_api_key sin llamar fetch", async () => {
    const fetchImpl = vi.fn();
    const r = await runTutorExplain({
      snapshot: snap,
      groq: { apiKey: "", fetchImpl },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("missing_api_key");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("éxito: Zod + números coherentes con snapshot", async () => {
    const fetchImpl = vi.fn(async () =>
      groqJson({
        titulo: "Crucero estable",
        explicacion: "Con α 4° y CL 0.67 el flujo es estable.",
        alerta_seguridad: "Crítico cerca de 15.5°; conserva margen.",
        siguiente_paso: "1 Observa L/D 15.5 2 Sube α con cuidado.",
      }),
    );
    const r = await runTutorExplain({
      snapshot: snap,
      groq: { apiKey: "test-key", fetchImpl },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.titulo).toContain("estable");
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("invalid_schema si el LLM no devuelve JSON válido", async () => {
    const fetchImpl = vi.fn(async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: "no soy json" } }],
        }),
      }) as Response,
    );
    const r = await runTutorExplain({
      snapshot: snap,
      groq: { apiKey: "test-key", fetchImpl },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("invalid_schema");
  });

  it("unverifiable_numbers si inventa magnitudes", async () => {
    const fetchImpl = vi.fn(async () =>
      groqJson({
        titulo: "Alerta",
        explicacion: "El CL es 2.5 en este punto.",
        alerta_seguridad: "Peligro",
        siguiente_paso: "Baja α",
      }),
    );
    const r = await runTutorExplain({
      snapshot: snap,
      groq: { apiKey: "test-key", fetchImpl },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("unverifiable_numbers");
  });

  it("timeout cuando fetch aborta", async () => {
    const fetchImpl = vi.fn(async () => {
      const err = new Error("aborted");
      err.name = "AbortError";
      throw err;
    });
    const r = await runTutorExplain({
      snapshot: snap,
      groq: { apiKey: "test-key", fetchImpl, timeoutMs: 5 },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("timeout");
  });
});
