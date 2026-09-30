import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/app/App";
import { computeAero } from "../../src/domain/aero-engine";
import { useFlightStore } from "../../src/domain/flight-state";
import { getDefaultAirfoil } from "../../src/data/airfoils";
import { COPY_ES } from "../../src/data/copy/es";
import { N_TO_LBF } from "../../src/domain/units";

describe("integración CAB C-A3 — telemetría lbf + α crítico efectivo", () => {
  beforeEach(() => {
    useFlightStore.getState().resetToCruise();
    useFlightStore.setState({
      view: "tunnel",
      flapsDeg: 0,
      vectorsOn: true,
      smokeOn: true,
    });
  });

  it("telemetría muestra N y lbf desde AeroResult", () => {
    const airfoil = getDefaultAirfoil();
    const aero = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 0 },
      airfoil,
    );
    render(<App />);
    const lift = screen.getByTestId("metric-lift");
    expect(lift.textContent).toContain(`${Math.round(aero.liftN)} ${COPY_ES.telemetry.unitN}`);
    expect(screen.getByTestId("metric-lift-lbf").textContent).toContain(
      `${Math.round(aero.liftLbf)} ${COPY_ES.telemetry.unitLbf}`,
    );
    expect(Math.round(aero.liftLbf)).toBe(Math.round(aero.liftN * N_TO_LBF));
    expect(screen.getByTestId("metric-drag-lbf").textContent).toContain(
      COPY_ES.telemetry.unitLbf,
    );
  });

  it("marcador de curva usa aero.criticalAlphaDeg (flaps 10° → 14.9°)", async () => {
    const user = userEvent.setup();
    const airfoil = getDefaultAirfoil();
    render(<App />);

    expect(screen.getByTestId("lift-curve-crit-label").textContent).toContain(
      "15.5",
    );

    await user.click(screen.getByTestId("flaps-10"));
    const expected = airfoil.critical_alpha_deg - 0.6; // 14.9
    expect(useFlightStore.getState().flapsDeg).toBe(10);
    expect(screen.getByTestId("metric-critical").textContent).toContain(
      expected.toFixed(1),
    );
    expect(screen.getByTestId("lift-curve-crit-label").textContent).toContain(
      expected.toFixed(1),
    );
  });
});
