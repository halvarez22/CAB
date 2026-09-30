import { COPY_ES } from "../../data/copy/es";

export interface TutorCTAProps {
  disabled?: boolean;
  busy?: boolean;
  onExplain: () => void;
}

/** CTA “Explicar este régimen” — teclado + foco nativos (H-I8). */
export function TutorCTA({ disabled, busy, onExplain }: TutorCTAProps) {
  return (
    <button
      type="button"
      className="tutor__cta"
      data-testid="tutor-cta"
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      onClick={onExplain}
    >
      {busy ? COPY_ES.tutor.loading : COPY_ES.tutor.explainCta}
    </button>
  );
}
