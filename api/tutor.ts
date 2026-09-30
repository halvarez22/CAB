import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  TUTOR_GROQ_MODEL,
  TUTOR_RATE_LIMIT_PER_MINUTE,
  assertStudentQuestionLength,
  getTutorPromptVersion,
  runTutorExplain,
  type AeroSnapshot,
  type TutorErrorCode,
} from "../src/domain/tutor-contract";

/** Rate limit best-effort en instancia cálida (APO-IA-1.1 H-I4). */
const hits = new Map<string, number[]>();

function clientKey(req: VercelRequest): string {
  const xf = req.headers["x-forwarded-for"];
  const raw = Array.isArray(xf) ? xf[0] : xf;
  const ip = (raw?.split(",")[0] ?? req.socket.remoteAddress ?? "unknown").trim();
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function allowRequest(key: string, now: number): boolean {
  const windowMs = 60_000;
  const prev = hits.get(key) ?? [];
  const recent = prev.filter((t) => now - t < windowMs);
  if (recent.length >= TUTOR_RATE_LIMIT_PER_MINUTE) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

function snapshotHash(snapshot: AeroSnapshot): string {
  return createHash("sha256")
    .update(JSON.stringify(snapshot))
    .digest("hex")
    .slice(0, 16);
}

function isAeroSnapshot(value: unknown): value is AeroSnapshot {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.alphaDeg === "number" &&
    typeof s.iasKt === "number" &&
    typeof s.cl === "number" &&
    typeof s.cd === "number" &&
    typeof s.status === "string" &&
    typeof s.criticalAlphaDeg === "number"
  );
}

type TutorLogOutcome =
  | "ok"
  | "error"
  | "timeout"
  | "rate_limited"
  | "unverifiable_numbers"
  | "invalid_schema"
  | "invalid_input_length"
  | "missing_api_key"
  | "invalid_request"
  | "upstream_error";

function logTutor(entry: {
  outcome: TutorLogOutcome;
  snapshotHash: string;
  latencyMs: number;
  modelId: string;
  detail?: string;
}): void {
  const payload: Record<string, unknown> = {
    ts: new Date().toISOString(),
    snapshotHash: entry.snapshotHash,
    outcome: entry.outcome,
    latencyMs: entry.latencyMs,
    modelId: entry.modelId,
    promptVersion: getTutorPromptVersion(),
  };
  if (process.env.NODE_ENV !== "production" && entry.detail) {
    payload.detail = entry.detail;
  }
  console.info(JSON.stringify(payload));
}

function statusForCode(code: TutorErrorCode): number {
  switch (code) {
    case "rate_limited":
      return 429;
    case "invalid_input_length":
    case "invalid_request":
      return 400;
    case "invalid_schema":
    case "unverifiable_numbers":
      return 422;
    case "missing_api_key":
      return 503;
    case "timeout":
      return 504;
    case "upstream_error":
      return 502;
    default:
      return 500;
  }
}

/** Extrae pregunta del body (studentQuestion | question). */
export function extractStudentQuestion(body: {
  studentQuestion?: unknown;
  question?: unknown;
}): string | undefined {
  if (typeof body.studentQuestion === "string") return body.studentQuestion;
  if (typeof body.question === "string") return body.question;
  return undefined;
}

/**
 * Validación de longitud de pregunta (testeable sin HTTP).
 */
export function validateTutorQuestionField(
  raw: string | undefined,
): { ok: true; question?: string } | { ok: false; code: "invalid_input_length" } {
  const lengthCheck = assertStudentQuestionLength(raw);
  if (!lengthCheck.ok) return lengthCheck;
  return { ok: true, question: raw };
}

/**
 * Vercel Serverless — POST /api/tutor
 * SSD: GROQ_API_KEY solo process.env.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, code: "invalid_request" });
  }

  const started = Date.now();
  const modelId = process.env.GROQ_MODEL ?? TUTOR_GROQ_MODEL;
  const key = clientKey(req);

  if (!allowRequest(key, started)) {
    logTutor({
      outcome: "rate_limited",
      snapshotHash: "none",
      latencyMs: Date.now() - started,
      modelId,
    });
    return res.status(429).json({ ok: false, code: "rate_limited" });
  }

  const body = (req.body ?? {}) as {
    snapshot?: unknown;
    studentQuestion?: unknown;
    question?: unknown;
  };
  if (!isAeroSnapshot(body.snapshot)) {
    logTutor({
      outcome: "invalid_request",
      snapshotHash: "none",
      latencyMs: Date.now() - started,
      modelId,
    });
    return res.status(400).json({ ok: false, code: "invalid_request" });
  }

  const rawQuestion = extractStudentQuestion(body);
  const qCheck = validateTutorQuestionField(rawQuestion);
  if (!qCheck.ok) {
    logTutor({
      outcome: "invalid_input_length",
      snapshotHash: snapshotHash(body.snapshot),
      latencyMs: Date.now() - started,
      modelId,
    });
    return res.status(400).json({ ok: false, code: "invalid_input_length" });
  }

  const snapshot = body.snapshot;
  const hash = snapshotHash(snapshot);
  const apiKey = process.env.GROQ_API_KEY ?? "";
  const result = await runTutorExplain({
    snapshot,
    studentQuestion: qCheck.question,
    groq: { apiKey, model: modelId },
  });

  const latencyMs = Date.now() - started;

  if (!result.ok) {
    logTutor({
      outcome: result.code as TutorLogOutcome,
      snapshotHash: hash,
      latencyMs,
      modelId,
      detail: result.detail,
    });
    return res.status(statusForCode(result.code)).json({
      ok: false,
      code: result.code,
    });
  }

  logTutor({
    outcome: "ok",
    snapshotHash: hash,
    latencyMs,
    modelId,
  });
  return res.status(200).json({ ok: true, data: result.data });
}
