import type { AeroResult } from "../../domain/types";
import { COPY_ES } from "../../data/copy/es";
import { useFlightStore } from "../../domain/flight-state";

export interface StatusBarProps {
  aero: AeroResult;
}

export function StatusBar({ aero }: StatusBarProps) {
  const resetToCruise = useFlightStore((s) => s.resetToCruise);
  const setAlpha = useFlightStore((s) => s.setAlpha);

  return (
    <div
      className={`status status--${aero.status} glass-panel`}
      data-testid="flow-status"
      data-status={aero.status}
      role="status"
    >
      <strong>{COPY_ES.telemetry.flowStatus}</strong>
      <span
        className={`status__badge status__badge--${aero.status}`}
        data-testid="flow-status-badge"
      >
        {COPY_ES.flowStatus[aero.status]}
      </span>
      {aero.status === "stall" || aero.status === "near_stall" ? (
        <div className="status__actions">
          <button
            type="button"
            data-testid="recover-alpha"
            onClick={() => setAlpha(4)}
          >
            {COPY_ES.controls.recoverAlpha}
          </button>
          <button
            type="button"
            data-testid="recover-reset"
            onClick={resetToCruise}
          >
            {COPY_ES.controls.resetToCruise}
          </button>
        </div>
      ) : null}
    </div>
  );
}
