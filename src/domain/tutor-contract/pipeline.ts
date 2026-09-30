import {
  TUTOR_GROQ_MODEL,
  TUTOR_MAX_RESPONSE_LENGTH,
  TUTOR_TEMPERATURE,
  TUTOR_TIMEOUT_MS,
} from "./constants";
import {
  assertTutorNumbersMatchSnapshot,
  tutorResponseTextBlob,
} from "./number-policy";
import { safeParseTutorResponse } from "./response-schema";
import { sanitizeStudentQuestion } from "./student-question";
import type {
  AeroSnapshot,
  TutorExplainResult,
  TutorResponse,
} from "./types";
import { TUTOR_PROMPT_VERSION, TUTOR_SYSTEM_PROMPT } from "../../data/tutor/system-prompt";

export interface GroqChatDeps {
  apiKey: string;
  model?: string;
  /** Inyectable para tests — sin red real. */
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface RunTutorExplainInput {
  snapshot: AeroSnapshot;
  /** Pregunta ya validada en longitud; se re-sanitiza aquí. */
  studentQuestion?: string;
  groq: GroqChatDeps;
  nowMs?: () => number;
}

function buildUserPayload(snapshot: AeroSnapshot, question?: string): string {
  const body: Record<string, unknown> = { snapshot };
  if (question) body.studentQuestion = question;
  return JSON.stringify(body);
}

function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    }
    throw new Error("no_json");
  }
}

/**
 * Orquestación pura del tutor (inyecta fetch). Sin DOM / sin store.
 * Validación: Zod siempre + anti-alucinación numérica (APO-IA-1.1).
 */
export async function runTutorExplain(
  input: RunTutorExplainInput,
): Promise<TutorExplainResult> {
  const { snapshot, groq } = input;
  if (!groq.apiKey) {
    return { ok: false, code: "missing_api_key" };
  }

  const question = sanitizeStudentQuestion(input.studentQuestion);
  const model = groq.model ?? TUTOR_GROQ_MODEL;
  const timeoutMs = groq.timeoutMs ?? TUTOR_TIMEOUT_MS;
  const fetchImpl = groq.fetchImpl ?? fetch;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groq.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: TUTOR_TEMPERATURE,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: TUTOR_SYSTEM_PROMPT },
          { role: "user", content: buildUserPayload(snapshot, question) },
        ],
        max_tokens: Math.min(800, TUTOR_MAX_RESPONSE_LENGTH),
      }),
    });

    if (!res.ok) {
      return { ok: false, code: "upstream_error", detail: `http_${res.status}` };
    }

    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return { ok: false, code: "invalid_schema", detail: "empty_content" };
    }

    let parsedJson: unknown;
    try {
      parsedJson = extractJsonObject(content);
    } catch {
      return { ok: false, code: "invalid_schema", detail: "json_parse" };
    }

    const zodResult = safeParseTutorResponse(parsedJson);
    if (!zodResult.success) {
      return {
        ok: false,
        code: "invalid_schema",
        detail: zodResult.error.issues[0]?.message,
      };
    }

    const data = zodResult.data as TutorResponse;
    const blob = tutorResponseTextBlob(data);
    const numbers = assertTutorNumbersMatchSnapshot(blob, snapshot);
    if (!numbers.ok) {
      return {
        ok: false,
        code: "unverifiable_numbers",
        detail: numbers.offenders.join(","),
      };
    }

    return { ok: true, data };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "AbortError") {
      return { ok: false, code: "timeout" };
    }
    return { ok: false, code: "error", detail: name || "unknown" };
  } finally {
    clearTimeout(timer);
  }
}

export function getTutorPromptVersion(): string {
  return TUTOR_PROMPT_VERSION;
}
