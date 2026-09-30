import { COPY_ES } from "../../data/copy/es";
import type { ResumeResult } from "../../domain/audio-runtime";
import { useFlightStore } from "../../domain/flight-state";

export interface AudioToggleProps {
  ensureContextResumed: () => Promise<ResumeResult>;
}

/**
 * Toggle Audio On — solo este click puede llamar ensureContextResumed (H-A1).
 */
export function AudioToggle({ ensureContextResumed }: AudioToggleProps) {
  const audioOn = useFlightStore((s) => s.audioOn);
  const audioBlocked = useFlightStore((s) => s.audioBlocked);
  const setAudioOn = useFlightStore((s) => s.setAudioOn);
  const setAudioBlocked = useFlightStore((s) => s.setAudioBlocked);

  async function handleClick() {
    if (audioOn) {
      setAudioOn(false);
      setAudioBlocked(false);
      return;
    }

    const result = await ensureContextResumed();
    if (result === "running") {
      setAudioOn(true);
      setAudioBlocked(false);
      return;
    }

    setAudioOn(false);
    setAudioBlocked(true);
  }

  return (
    <div className="audio-toggle" data-testid="audio-toggle-wrap">
      <button
        type="button"
        data-testid="toggle-audio"
        className={audioOn ? "is-active" : undefined}
        aria-pressed={audioOn}
        onClick={() => {
          void handleClick();
        }}
      >
        {audioOn ? COPY_ES.controls.audioOn : COPY_ES.controls.audioOff}
      </button>
      {audioBlocked ? (
        <p
          className="audio-toggle__hint"
          data-testid="audio-blocked-hint"
          role="status"
        >
          {COPY_ES.controls.audioBlockedHint}
        </p>
      ) : null}
    </div>
  );
}
