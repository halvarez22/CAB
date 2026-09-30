import { beforeEach, describe, expect, it } from "vitest";
import { useFlightStore } from "../../src/domain/flight-state";

describe("flight-state store (Zustand)", () => {
  beforeEach(() => {
    useFlightStore.getState().resetToCruise();
    useFlightStore.setState({
      view: "tunnel",
      vectorsOn: true,
      smokeOn: true,
      paused: false,
      audioOn: false,
      audioBlocked: false,
    });
  });

  it("clampa α e IAS vía acciones", () => {
    useFlightStore.getState().setAlpha(99);
    useFlightStore.getState().setIas(10);
    const s = useFlightStore.getState();
    expect(s.alphaDeg).toBe(20);
    expect(s.iasKt).toBe(40);
  });

  it("ignora flaps inválidos (incl. 15°) y acepta 10/20/30", () => {
    useFlightStore.getState().setFlaps(10);
    expect(useFlightStore.getState().flapsDeg).toBe(10);
    useFlightStore.getState().setFlaps(20);
    expect(useFlightStore.getState().flapsDeg).toBe(20);
    useFlightStore.getState().setFlaps(30);
    expect(useFlightStore.getState().flapsDeg).toBe(30);
    // @ts-expect-error — 15° purgado del contrato C-A2
    useFlightStore.getState().setFlaps(15);
    expect(useFlightStore.getState().flapsDeg).toBe(30);
    // @ts-expect-error — fuerza valor inválido en runtime
    useFlightStore.getState().setFlaps(7);
    expect(useFlightStore.getState().flapsDeg).toBe(30);
  });

  it("presets y toggles de vista/vectores/humo/pausa", () => {
    useFlightStore.getState().applyPresetClimb();
    expect(useFlightStore.getState().alphaDeg).toBe(12);
    useFlightStore.getState().applyPresetStallDemo();
    expect(useFlightStore.getState().alphaDeg).toBe(16);
    useFlightStore.getState().applyPresetCruise();
    expect(useFlightStore.getState().alphaDeg).toBe(4);

    useFlightStore.getState().setPaused(true);
    useFlightStore.getState().setView("theory");
    useFlightStore.getState().setVectorsOn(false);
    useFlightStore.getState().setSmokeOn(false);
    const s = useFlightStore.getState();
    expect(s.paused).toBe(true);
    expect(s.view).toBe("theory");
    expect(s.vectorsOn).toBe(false);
    expect(s.smokeOn).toBe(false);
  });

  it("audioOn / audioBlocked default false y acciones", () => {
    const s0 = useFlightStore.getState();
    expect(s0.audioOn).toBe(false);
    expect(s0.audioBlocked).toBe(false);
    useFlightStore.getState().setAudioOn(true);
    useFlightStore.getState().setAudioBlocked(true);
    const s = useFlightStore.getState();
    expect(s.audioOn).toBe(true);
    expect(s.audioBlocked).toBe(true);
  });
});
