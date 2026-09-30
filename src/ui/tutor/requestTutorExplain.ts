import type {
  AeroSnapshot,
  TutorErrorCode,
  TutorResponse,
} from "../../domain/tutor-contract/types";

export type TutorApiSuccess = { ok: true; data: TutorResponse };
export type TutorApiFailure = { ok: false; code: TutorErrorCode };
export type TutorApiResult = TutorApiSuccess | TutorApiFailure;

/**
 * Cliente HTTP → `/api/tutor` (nunca Groq directo; SSD).
 */
export async function requestTutorExplain(
  snapshot: AeroSnapshot,
  studentQuestion: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<TutorApiResult> {
  const payload: Record<string, unknown> = { snapshot };
  if (studentQuestion !== undefined && studentQuestion.length > 0) {
    payload.studentQuestion = studentQuestion;
  }

  const res = await fetchImpl("/api/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { ok: false, code: "error" };
  }

  if (
    body &&
    typeof body === "object" &&
    "ok" in body &&
    (body as { ok: unknown }).ok === true &&
    "data" in body
  ) {
    return body as TutorApiSuccess;
  }

  const code =
    body &&
    typeof body === "object" &&
    "code" in body &&
    typeof (body as { code: unknown }).code === "string"
      ? (body as { code: TutorErrorCode }).code
      : "error";

  return { ok: false, code };
}
