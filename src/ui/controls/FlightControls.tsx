import { COPY_ES } from "../../data/copy/es";
import { REGIMES_ES } from "../../data/regimes/es";
import { useFlightStore } from "../../domain/flight-state";
import { FlapsControls, InstructorPresets } from "./InstructorPresets";

export function FlightControls() {
  const alphaDeg = useFlightStore((s) => s.alphaDeg);
  const iasKt = useFlightStore((s) => s.iasKt);
  const paused = useFlightStore((s) => s.paused);
  const vectorsOn = useFlightStore((s) => s.vectorsOn);
  const smokeOn = useFlightStore((s) => s.smokeOn);
  const setAlpha = useFlightStore((s) => s.setAlpha);
  const setIas = useFlightStore((s) => s.setIas);
  const setPaused = useFlightStore((s) => s.setPaused);
  const setVectorsOn = useFlightStore((s) => s.setVectorsOn);
  const setSmokeOn = useFlightStore((s) => s.setSmokeOn);
  const resetToCruise = useFlightStore((s) => s.resetToCruise);

  return (
    <section className="controls glass-panel" data-testid="flight-controls">
      <h2>{COPY_ES.views.tunnel}</h2>

      <label className="controls__field">
        <span>
          {COPY_ES.controls.alpha}: {alphaDeg.toFixed(1)}°
        </span>
        <input
          data-testid="alpha-slider"
          type="range"
          min={-6}
          max={20}
          step={0.5}
          value={alphaDeg}
          onChange={(e) => setAlpha(Number(e.target.value))}
        />
        <div className="controls__ticks" aria-hidden>
          {REGIMES_ES.map((r) => (
            <span key={r.id}>
              {r.label} ({r.alphaDeg}°)
            </span>
          ))}
        </div>
      </label>

      <label className="controls__field">
        <span>
          {COPY_ES.controls.ias}: {iasKt} KT
        </span>
        <input
          data-testid="ias-slider"
          type="range"
          min={40}
          max={180}
          step={1}
          value={iasKt}
          onChange={(e) => setIas(Number(e.target.value))}
        />
      </label>

      <FlapsControls />

      <div className="controls__toggles">
        <button
          type="button"
          data-testid="toggle-vectors"
          aria-pressed={vectorsOn}
          onClick={() => setVectorsOn(!vectorsOn)}
        >
          {vectorsOn ? COPY_ES.controls.vectorsOn : COPY_ES.controls.vectorsOff}
        </button>
        <button
          type="button"
          data-testid="toggle-smoke"
          aria-pressed={smokeOn}
          onClick={() => setSmokeOn(!smokeOn)}
        >
          {smokeOn ? COPY_ES.controls.smokeOn : COPY_ES.controls.smokeOff}
        </button>
        <button
          type="button"
          data-testid="toggle-pause"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? COPY_ES.controls.resume : COPY_ES.controls.pause}
        </button>
        <button type="button" data-testid="btn-reset" onClick={resetToCruise}>
          {COPY_ES.controls.reset}
        </button>
      </div>

      <InstructorPresets />
    </section>
  );
}
