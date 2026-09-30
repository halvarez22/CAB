/**
 * E2E local del tutor (APO-IA-1.2) — NO CI.
 *
 * Carga `.env.local`, llama el mismo pipeline que `/api/tutor` (Groq real)
 * con pregunta de alumno, valida schema + anti-números, imprime la respuesta.
 *
 * Uso: pnpm test:e2e:tutor
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertTutorNumbersMatchSnapshot,
  runTutorExplain,
  tutorResponseTextBlob,
  type AeroSnapshot,
  type TutorExplainResult,
  type TutorResponse,
} from "../src/domain/tutor-contract";
import { TUTOR_PROMPT_VERSION } from "../src/data/tutor/system-prompt";

function loadEnvLocal(): void {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const CRUISE_SNAPSHOT: AeroSnapshot = {
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

const CASES: Array<{ name: string; question: string; snapshot: AeroSnapshot }> =
  [
    {
      name: "consulta L/D en crucero",
      question: "¿Qué significa un L/D alto en este régimen?",
      snapshot: CRUISE_SNAPSHOT,
    },
    {
      name: "consulta pérdida (concepto)",
      question: "¿Qué es la pérdida y cómo la veo en el túnel?",
      snapshot: CRUISE_SNAPSHOT,
    },
  ];

const MAX_ATTEMPTS = 2;

function assertQuality(data: TutorResponse, snapshot: AeroSnapshot): string[] {
  const issues: string[] = [];
  const keys: (keyof TutorResponse)[] = [
    "titulo",
    "explicacion",
    "alerta_seguridad",
    "siguiente_paso",
  ];
  for (const k of keys) {
    const v = data[k]?.trim() ?? "";
    if (v.length < 8) issues.push(`${k}: demasiado corto`);
  }
  const blob = tutorResponseTextBlob(data);
  const nums = assertTutorNumbersMatchSnapshot(blob, snapshot);
  if (!nums.ok) {
    issues.push(`números no verificables: ${nums.offenders.join(",")}`);
  }
  const lower = blob.toLowerCase();
  const flightHints = [
    "ángulo",
    "ataque",
    "sustent",
    "resist",
    "pérdida",
    "perdida",
    "túnel",
    "tunel",
    "régimen",
    "regimen",
    "flaps",
    "l/d",
    "flujo",
    "polar",
    "α",
    "alpha",
    "ias",
  ];
  if (!flightHints.some((h) => lower.includes(h))) {
    issues.push("no parece hablar de aerodinámica del laboratorio");
  }
  return issues;
}

/** Captura el texto crudo del asistente Groq para diagnóstico E2E. */
function makeLoggingFetch(): {
  fetchImpl: typeof fetch;
  lastAssistant: () => string | null;
} {
  let last: string | null = null;
  const fetchImpl: typeof fetch = async (input, init) => {
    const res = await fetch(input, init);
    const clone = res.clone();
    try {
      const json = (await clone.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      last = json.choices?.[0]?.message?.content ?? null;
    } catch {
      last = null;
    }
    return res;
  };
  return { fetchImpl, lastAssistant: () => last };
}

async function runCase(
  c: (typeof CASES)[number],
  key: string,
  modelId: string | undefined,
): Promise<{
  result: TutorExplainResult;
  ms: number;
  raw: string | null;
}> {
  const { fetchImpl, lastAssistant } = makeLoggingFetch();
  const started = Date.now();
  const result = await runTutorExplain({
    snapshot: c.snapshot,
    studentQuestion: c.question,
    groq: { apiKey: key, model: modelId, fetchImpl },
  });
  return { result, ms: Date.now() - started, raw: lastAssistant() };
}

const apiKey = process.env.GROQ_API_KEY ?? "";
const model = process.env.GROQ_MODEL;

if (!apiKey) {
  console.error("❌ Falta GROQ_API_KEY (ponla en .env.local).");
  process.exit(1);
}

console.log("── E2E tutor local (APO-IA-1.2) ──");
console.log(`promptVersion: ${TUTOR_PROMPT_VERSION}`);
console.log(`model: ${model ?? "(default pipeline)"}`);
console.log(`casos: ${CASES.length} · reintentos máx: ${MAX_ATTEMPTS}`);
console.log("");

let failed = 0;

for (const c of CASES) {
  console.log(`▶ ${c.name}`);
  console.log(`  Q: ${c.question}`);

  let passed = false;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { result, ms, raw } = await runCase(c, apiKey, model);
    if (!result.ok) {
      console.error(
        `  ✗ intento ${attempt}/${MAX_ATTEMPTS} (${ms} ms): ${result.code}`,
      );
      if (result.detail) console.error(`    detail: ${result.detail}`);
      if (raw) {
        console.error("    raw assistant:");
        console.error(raw.length > 1400 ? `${raw.slice(0, 1400)}…` : raw);
      }
      continue;
    }

    const issues = assertQuality(result.data, c.snapshot);
    console.log(`  ✓ ok intento ${attempt} (${ms} ms)`);
    console.log(`  título: ${result.data.titulo}`);
    console.log(`  explicación: ${result.data.explicacion}`);
    console.log(`  alerta: ${result.data.alerta_seguridad}`);
    console.log(`  siguiente: ${result.data.siguiente_paso}`);
    if (issues.length) {
      console.error(`  ✗ calidad:`);
      for (const i of issues) console.error(`    - ${i}`);
      continue;
    }
    console.log(`  ✓ calidad / FDP números OK`);
    passed = true;
    break;
  }

  if (!passed) failed += 1;
  console.log("");
}

if (failed > 0) {
  console.error(`── FALLÓ ${failed} caso(s) ──`);
  process.exit(2);
}

console.log("── E2E tutor local: PASS ──");
process.exit(0);
