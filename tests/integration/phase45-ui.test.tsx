import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/app/App";
import { useFlightStore } from "../../src/domain/flight-state";
import { getDefaultAirfoil } from "../../src/data/airfoils";
import { COPY_ES } from "../../src/data/copy/es";

describe("integración Fase 4/5 — curva + manual", () => {
  beforeEach(() => {
    useFlightStore.getState().resetToCruise();
    useFlightStore.setState({ view: "tunnel", vectorsOn: true, smokeOn: true });
  });

  it("muestra curva CL–α con punto de operación en túnel", () => {
    render(<App />);
    expect(screen.getByTestId("lift-curve-chart")).toBeInTheDocument();
    expect(screen.getByTestId("lift-curve-op")).toBeInTheDocument();
    expect(screen.getByTestId("metric-critical").textContent).toContain(
      String(getDefaultAirfoil().critical_alpha_deg),
    );
  });

  it("manual teórico lee densidades/versión del perfil y CL del motor", async () => {
    const user = userEvent.setup();
    const airfoil = getDefaultAirfoil();
    render(<App />);
    await user.click(screen.getByTestId("nav-theory"));
    expect(screen.getByTestId("theory-manual")).toBeInTheDocument();
    expect(screen.queryByTestId("tunnel-canvas")).not.toBeInTheDocument();
    expect(screen.getByTestId("theory-density")).toHaveTextContent(
      String(airfoil.air_density_kg_m3),
    );
    expect(screen.getByTestId("theory-area")).toHaveTextContent(
      String(airfoil.reference_area_m2),
    );
    expect(screen.getByTestId("theory-critical")).toHaveTextContent("15.5°");
    expect(screen.getByTestId("theory-version")).toHaveTextContent(
      airfoil.version,
    );
    expect(screen.getByTestId("theory-cl").textContent).toMatch(/0\.67/);
    expect(screen.getByText(COPY_ES.theory.liftFormula)).toBeInTheDocument();
  });

  it("volver al túnel remonta canvas y curva", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("nav-theory"));
    await user.click(screen.getByTestId("back-to-tunnel"));
    expect(screen.getByTestId("tunnel-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("lift-curve-chart")).toBeInTheDocument();
  });
});
