import { COPY_ES } from "../data/copy/es";
import { getDefaultAirfoil } from "../data/airfoils";
import { computeAero } from "../domain/aero-engine";
import { useFlightStore } from "../domain/flight-state";
import { CabBrand } from "../ui/brand/CabBrand";
import { FlightControls } from "../ui/controls/FlightControls";
import { StatusBar } from "../ui/controls/StatusBar";
import { ViewNav } from "../ui/controls/ViewNav";
import { TunnelCanvas } from "../ui/tunnel/TunnelCanvas";
import { TelemetryStrip } from "../ui/telemetry/TelemetryStrip";
import { LiftCurveChart } from "../ui/charts/LiftCurveChart";
import { TheoryManual } from "../ui/theory/TheoryManual";
import { AudioToggle } from "../ui/audio/AudioToggle";
import { useFlightAudio } from "../ui/audio/useFlightAudio";
import { TutorDock } from "../ui/tutor/TutorDock";

/**
 * Orquestador: FlightStore → aero-engine → vistas + audio + brand CAB + tutor (flag).
 * Skin glass: wrappers presentacionales. Túnel se desmonta en theory.
 */
export function App() {
  const view = useFlightStore((s) => s.view);
  const alphaDeg = useFlightStore((s) => s.alphaDeg);
  const iasKt = useFlightStore((s) => s.iasKt);
  const flapsDeg = useFlightStore((s) => s.flapsDeg);
  const paused = useFlightStore((s) => s.paused);
  const vectorsOn = useFlightStore((s) => s.vectorsOn);
  const smokeOn = useFlightStore((s) => s.smokeOn);

  const airfoil = getDefaultAirfoil();
  const aero = computeAero({ alphaDeg, iasKt, flapsDeg }, airfoil);
  const { ensureContextResumed } = useFlightAudio({ status: aero.status });

  return (
    <div className="app-frame">
      <div className="shell__atmosphere" aria-hidden="true">
        <span className="shell__blob shell__blob--sky" />
        <span className="shell__blob shell__blob--gold" />
      </div>
      <main className="shell">
        <header className="shell__header">
          <CabBrand />
          <div className="shell__header-row">
            <ViewNav />
            <AudioToggle ensureContextResumed={ensureContextResumed} />
          </div>
        </header>

        <StatusBar aero={aero} />

        {view === "theory" ? (
          <div className="view-pane">
            <TheoryManual airfoil={airfoil} aero={aero} />
          </div>
        ) : (
          <div className="view-pane">
            <div className="shell__grid">
              <TunnelCanvas
                alphaDeg={alphaDeg}
                iasKt={iasKt}
                paused={paused}
                vectorsOn={vectorsOn}
                smokeOn={smokeOn}
                aero={aero}
              />
              <div className="shell__side">
                <FlightControls />
                <LiftCurveChart airfoil={airfoil} aero={aero} />
              </div>
            </div>
            <TelemetryStrip aero={aero} airfoil={airfoil} />
            <TutorDock aero={aero} />
          </div>
        )}

        <p className="shell__note">{COPY_ES.phaseNote}</p>
        <footer
          className="shell__footer glass-panel"
          data-testid="disclaimer-footer"
        >
          <p>{COPY_ES.disclaimer}</p>
        </footer>
      </main>
    </div>
  );
}
