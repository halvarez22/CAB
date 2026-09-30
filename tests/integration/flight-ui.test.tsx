import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { App } from "../../src/app/App";
import { useFlightStore } from "../../src/domain/flight-state";
import { COPY_ES } from "../../src/data/copy/es";

describe("integración estado → UI (Fase 3)", () => {
  beforeEach(() => {
    useFlightStore.getState().resetToCruise();
    useFlightStore.setState({
      vectorsOn: true,
      smokeOn: true,
      paused: false,
      view: "tunnel",
      audioOn: false,
      audioBlocked: false,
    });
  });

  it("muestra estado stable en crucero y telemetría desde el motor", () => {
    render(<App />);
    expect(screen.getByTestId("flow-status")).toHaveAttribute(
      "data-status",
      "stable",
    );
    expect(screen.getByTestId("flow-status")).toHaveTextContent(
      COPY_ES.flowStatus.stable,
    );
    expect(screen.getByTestId("metric-lift").textContent).toMatch(/\d+ N/);
    expect(screen.getByTestId("metric-lift-lbf").textContent).toMatch(/lbf/);
    expect(screen.getByTestId("disclaimer-footer")).toHaveTextContent(
      COPY_ES.disclaimer,
    );
  });

  it("preset pérdida → FlowStatus stall + acciones de recuperación", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("preset-stall"));
    expect(screen.getByTestId("flow-status")).toHaveAttribute(
      "data-status",
      "stall",
    );
    expect(screen.getByTestId("recover-reset")).toBeInTheDocument();
    await user.click(screen.getByTestId("recover-reset"));
    expect(screen.getByTestId("flow-status")).toHaveAttribute(
      "data-status",
      "stable",
    );
  });

  it("flaps 10/20/30 actualizan store y telemetría", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("flaps-10"));
    expect(useFlightStore.getState().flapsDeg).toBe(10);
    expect(screen.getByTestId("flaps-10")).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByTestId("flaps-20"));
    expect(useFlightStore.getState().flapsDeg).toBe(20);
    await user.click(screen.getByTestId("flaps-30"));
    expect(useFlightStore.getState().flapsDeg).toBe(30);

    const alpha = screen.getByTestId("alpha-slider");
    fireEvent.change(alpha, { target: { value: "12" } });
    await waitFor(() => {
      expect(useFlightStore.getState().alphaDeg).toBe(12);
      expect(screen.getByTestId("alpha-slider")).toHaveValue("12");
    });
    expect(screen.getByTestId("metric-clcd").textContent).toMatch(/\d/);
  });

  it("toggles vectores/humo/pausa usan copy y mutan store", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("toggle-vectors"));
    expect(useFlightStore.getState().vectorsOn).toBe(false);
    expect(screen.getByTestId("toggle-vectors")).toHaveTextContent(
      COPY_ES.controls.vectorsOff,
    );
    await user.click(screen.getByTestId("toggle-smoke"));
    expect(useFlightStore.getState().smokeOn).toBe(false);
    await user.click(screen.getByTestId("toggle-pause"));
    expect(useFlightStore.getState().paused).toBe(true);
    expect(screen.getByTestId("toggle-pause")).toHaveTextContent(
      COPY_ES.controls.resume,
    );
  });

  it("presets instructor: crucero / ascenso", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("preset-climb"));
    expect(useFlightStore.getState().alphaDeg).toBe(12);
    await user.click(screen.getByTestId("preset-cruise"));
    expect(useFlightStore.getState().alphaDeg).toBe(4);
  });
});
