import type { AeroResult, AirfoilData } from "../../domain/types";
import { COPY_ES } from "../../data/copy/es";

export interface TelemetryStripProps {
  aero: AeroResult;
  airfoil: AirfoilData;
}

/** Telemetría: magnitudes del motor (N + lbf) + meta del perfil — APO-CAB C-A3. */
export function TelemetryStrip({ aero, airfoil }: TelemetryStripProps) {
  return (
    <dl className="telemetry glass-panel" data-testid="telemetry-strip">
      <div>
        <dt>{COPY_ES.telemetry.lift}</dt>
        <dd data-testid="metric-lift">
          {Math.round(aero.liftN)} {COPY_ES.telemetry.unitN}
          <span className="telemetry__secondary" data-testid="metric-lift-lbf">
            {" "}
            ({Math.round(aero.liftLbf)} {COPY_ES.telemetry.unitLbf})
          </span>
        </dd>
      </div>
      <div>
        <dt>{COPY_ES.telemetry.drag}</dt>
        <dd data-testid="metric-drag">
          {Math.round(aero.dragN)} {COPY_ES.telemetry.unitN}
          <span className="telemetry__secondary" data-testid="metric-drag-lbf">
            {" "}
            ({Math.round(aero.dragLbf)} {COPY_ES.telemetry.unitLbf})
          </span>
        </dd>
      </div>
      <div>
        <dt>{COPY_ES.telemetry.coefficients}</dt>
        <dd data-testid="metric-clcd">
          {aero.cl.toFixed(2)} / {aero.cd.toFixed(3)}
        </dd>
      </div>
      <div>
        <dt>{COPY_ES.telemetry.efficiency}</dt>
        <dd data-testid="metric-ld">{aero.lOverD.toFixed(1)}</dd>
      </div>
      <div>
        <dt>{COPY_ES.telemetry.criticalAlpha}</dt>
        <dd data-testid="metric-critical">
          {aero.criticalAlphaDeg.toFixed(1)}°
        </dd>
      </div>
      <div>
        <dt>{COPY_ES.telemetry.profile}</dt>
        <dd data-testid="metric-profile">
          {airfoil.profile} · v{airfoil.version}
        </dd>
      </div>
    </dl>
  );
}
