import type { FlapsDeg } from "../../domain/types";
import { COPY_ES } from "../../data/copy/es";
import { useFlightStore } from "../../domain/flight-state";

export function InstructorPresets() {
  const applyPresetCruise = useFlightStore((s) => s.applyPresetCruise);
  const applyPresetClimb = useFlightStore((s) => s.applyPresetClimb);
  const applyPresetStallDemo = useFlightStore((s) => s.applyPresetStallDemo);

  return (
    <div className="controls__presets">
      <button
        type="button"
        data-testid="preset-cruise"
        onClick={applyPresetCruise}
      >
        {COPY_ES.controls.presetCruise}
      </button>
      <button
        type="button"
        data-testid="preset-climb"
        onClick={applyPresetClimb}
      >
        {COPY_ES.controls.presetClimb}
      </button>
      <button
        type="button"
        data-testid="preset-stall"
        onClick={applyPresetStallDemo}
      >
        {COPY_ES.controls.presetStallDemo}
      </button>
    </div>
  );
}

/** Contrato CAB C-A2 — FlapsDeg 0 | 10 | 20 | 30. */
const FLAPS: FlapsDeg[] = [0, 10, 20, 30];

function flapsLabel(deg: FlapsDeg): string {
  if (deg === 0) return COPY_ES.controls.flapsClean;
  if (deg === 10) return COPY_ES.controls.flapsTakeoff;
  if (deg === 20) return COPY_ES.controls.flapsApproach;
  return COPY_ES.controls.flapsLanding;
}

export function FlapsControls() {
  const flapsDeg = useFlightStore((s) => s.flapsDeg);
  const setFlaps = useFlightStore((s) => s.setFlaps);

  return (
    <fieldset className="controls__flaps">
      <legend>{COPY_ES.controls.flaps}</legend>
      {FLAPS.map((deg) => (
        <button
          key={deg}
          type="button"
          data-testid={`flaps-${deg}`}
          className={flapsDeg === deg ? "is-active" : undefined}
          aria-pressed={flapsDeg === deg}
          onClick={() => setFlaps(deg)}
        >
          {flapsLabel(deg)}
        </button>
      ))}
    </fieldset>
  );
}
