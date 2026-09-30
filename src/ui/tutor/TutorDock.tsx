import { useCallback, useEffect, useState } from "react";
import type { AeroResult } from "../../domain/types";
import { TUTOR_MAX_INPUT_LENGTH } from "../../domain/tutor-contract/constants";
import { sanitizeStudentQuestion } from "../../domain/tutor-contract/student-question";
import { toAeroSnapshot } from "../../domain/tutor-contract/snapshot";
import type {
  TutorErrorCode,
  TutorResponse,
} from "../../domain/tutor-contract/types";
import { isTutorUiEnabled } from "./isTutorUiEnabled";
import { requestTutorExplain } from "./requestTutorExplain";
import { TutorCTA } from "./TutorCTA";
import { TutorPanel, type TutorPanelStatus } from "./TutorPanel";

const RATE_LIMIT_COOLDOWN_MS = 60_000;

export interface TutorDockProps {
  aero: AeroResult;
  fetchImpl?: typeof fetch;
  enabled?: boolean;
}

/**
 * Prompt visible (APO-IA-1.2): consulta obligatoria al piloto experto.
 */
export function TutorDock({ aero, fetchImpl, enabled }: TutorDockProps) {
  const show = enabled ?? isTutorUiEnabled();
  const [status, setStatus] = useState<TutorPanelStatus>("idle");
  const [data, setData] = useState<TutorResponse | null>(null);
  const [errorCode, setErrorCode] = useState<TutorErrorCode | null>(null);
  const [question, setQuestion] = useState("");
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (rateLimitedUntil === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [rateLimitedUntil]);

  const isRateLimited =
    rateLimitedUntil !== null && now < rateLimitedUntil;
  const sanitizedPreview = sanitizeStudentQuestion(question);
  const overLimit = question.length > TUTOR_MAX_INPUT_LENGTH;
  const emptyQuestion = !sanitizedPreview;
  const submitDisabled = emptyQuestion || overLimit || isRateLimited;

  const onExplain = useCallback(async () => {
    if (submitDisabled || !sanitizedPreview) return;
    setStatus("loading");
    setData(null);
    setErrorCode(null);
    const snapshot = toAeroSnapshot(aero);
    const result = await requestTutorExplain(
      snapshot,
      sanitizedPreview,
      fetchImpl,
    );
    if (result.ok) {
      setData(result.data);
      setStatus("success");
      return;
    }
    if (result.code === "rate_limited") {
      setRateLimitedUntil(Date.now() + RATE_LIMIT_COOLDOWN_MS);
    }
    setErrorCode(result.code);
    setStatus("error");
  }, [aero, fetchImpl, sanitizedPreview, submitDisabled]);

  const onClose = useCallback(() => {
    setStatus("idle");
    setData(null);
    setErrorCode(null);
  }, []);

  if (!show) return null;

  return (
    <div className="tutor" data-testid="tutor-dock">
      <TutorPanel
        status={status}
        data={data}
        errorCode={errorCode}
        question={question}
        onQuestionChange={setQuestion}
        questionDisabled={isRateLimited || status === "loading"}
        onClose={status === "idle" ? undefined : onClose}
      />
      <TutorCTA
        busy={status === "loading"}
        disabled={submitDisabled}
        onExplain={() => void onExplain()}
      />
    </div>
  );
}
