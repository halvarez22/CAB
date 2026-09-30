import { useEffect, useRef } from "react";
import { COPY_ES } from "../../data/copy/es";
import { TUTOR_MAX_INPUT_LENGTH } from "../../domain/tutor-contract/constants";
import type { TutorErrorCode, TutorResponse } from "../../domain/tutor-contract/types";

export type TutorPanelStatus = "idle" | "loading" | "success" | "error";

export interface TutorPanelProps {
  status: TutorPanelStatus;
  data?: TutorResponse | null;
  errorCode?: TutorErrorCode | null;
  question: string;
  onQuestionChange: (value: string) => void;
  questionDisabled?: boolean;
  onClose?: () => void;
}

function errorMessage(code: TutorErrorCode | null | undefined): string {
  if (code === "rate_limited") return COPY_ES.tutor.rateLimited;
  if (code === "unverifiable_numbers") return COPY_ES.tutor.unverifiable;
  if (code === "invalid_input_length") return COPY_ES.tutor.inputTooLong;
  return COPY_ES.tutor.unavailable;
}

/**
 * Panel tutor: pregunta corta + resultados (I-A3 / H-I8).
 */
export function TutorPanel({
  status,
  data,
  errorCode,
  question,
  onQuestionChange,
  questionDisabled,
  onClose,
}: TutorPanelProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const overLimit = question.length > TUTOR_MAX_INPUT_LENGTH;

  useEffect(() => {
    if (status === "success" || status === "error") {
      titleRef.current?.focus();
    }
  }, [status]);

  return (
    <section
      className="tutor__panel glass-panel"
      data-testid="tutor-panel"
      aria-labelledby="tutor-panel-title"
    >
      <div className="tutor__panel-head">
        <h2
          id="tutor-panel-title"
          className="tutor__panel-title"
          ref={titleRef}
          tabIndex={-1}
        >
          {COPY_ES.tutor.title}
        </h2>
        {onClose && status !== "idle" ? (
          <button
            type="button"
            className="tutor__close"
            data-testid="tutor-close"
            onClick={onClose}
          >
            {COPY_ES.tutor.close}
          </button>
        ) : null}
      </div>

      <label className="tutor__question" htmlFor="tutor-student-question">
        <span className="tutor__question-label">
          {COPY_ES.tutor.questionLabel}
        </span>
        <textarea
          id="tutor-student-question"
          className="tutor__question-input"
          data-testid="tutor-question"
          rows={3}
          maxLength={TUTOR_MAX_INPUT_LENGTH}
          placeholder={COPY_ES.tutor.questionPlaceholder}
          value={question}
          disabled={questionDisabled}
          aria-invalid={overLimit || undefined}
          aria-describedby="tutor-question-hint"
          onChange={(e) => onQuestionChange(e.target.value)}
        />
        <span id="tutor-question-hint" className="tutor__question-hint">
          {COPY_ES.tutor.questionHint}{" "}
          <span data-testid="tutor-question-count">
            {question.length}/{TUTOR_MAX_INPUT_LENGTH}
          </span>
        </span>
      </label>

      <div
        className="tutor__live"
        role="status"
        aria-live="polite"
        aria-busy={status === "loading"}
        data-testid="tutor-live"
      >
        {status === "loading" ? (
          <p className="tutor__loading">{COPY_ES.tutor.loading}</p>
        ) : null}

        {status === "error" ? (
          <p className="tutor__error" data-testid="tutor-error">
            {errorMessage(errorCode)}
          </p>
        ) : null}

        {status === "success" && data ? (
          <div className="tutor__result" data-testid="tutor-result">
            <h3 className="tutor__result-title">{data.titulo}</h3>
            <p>
              <strong>{COPY_ES.tutor.labelExplicacion}:</strong>{" "}
              {data.explicacion}
            </p>
            <p>
              <strong>{COPY_ES.tutor.labelAlerta}:</strong>{" "}
              {data.alerta_seguridad}
            </p>
            <p>
              <strong>{COPY_ES.tutor.labelSiguiente}:</strong>{" "}
              {data.siguiente_paso}
            </p>
          </div>
        ) : null}
      </div>

      <p className="tutor__disclaimer">{COPY_ES.tutor.disclaimer}</p>
    </section>
  );
}
