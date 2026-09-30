import { create } from "zustand";
import type { AppView, FlapsDeg, FlightParams } from "../types";
import {
  clampAlpha,
  clampIas,
  createClimbParams,
  createCruiseParams,
  createStallDemoParams,
  DEFAULT_FLIGHT_PARAMS,
  isFlapsDeg,
} from "./params";

export interface FlightStoreState extends FlightParams {
  view: AppView;
  vectorsOn: boolean;
  smokeOn: boolean;
  /** Master de audio pedagógico (default OFF — autoplay / aula). */
  audioOn: boolean;
  /** true si el navegador no pudo reanudar AudioContext tras gesto. */
  audioBlocked: boolean;
  setAlpha: (alphaDeg: number) => void;
  setIas: (iasKt: number) => void;
  setFlaps: (flapsDeg: FlapsDeg) => void;
  setPaused: (paused: boolean) => void;
  setView: (view: AppView) => void;
  setVectorsOn: (on: boolean) => void;
  setSmokeOn: (on: boolean) => void;
  setAudioOn: (on: boolean) => void;
  setAudioBlocked: (blocked: boolean) => void;
  resetToCruise: () => void;
  applyPresetCruise: () => void;
  applyPresetClimb: () => void;
  applyPresetStallDemo: () => void;
}

export const useFlightStore = create<FlightStoreState>((set) => ({
  ...DEFAULT_FLIGHT_PARAMS,
  view: "tunnel",
  vectorsOn: true,
  smokeOn: true,
  audioOn: false,
  audioBlocked: false,
  setAlpha: (alphaDeg) => set({ alphaDeg: clampAlpha(alphaDeg) }),
  setIas: (iasKt) => set({ iasKt: clampIas(iasKt) }),
  setFlaps: (flapsDeg) => {
    if (!isFlapsDeg(flapsDeg)) return;
    set({ flapsDeg });
  },
  setPaused: (paused) => set({ paused }),
  setView: (view) => set({ view }),
  setVectorsOn: (vectorsOn) => set({ vectorsOn }),
  setSmokeOn: (smokeOn) => set({ smokeOn }),
  setAudioOn: (audioOn) => set({ audioOn }),
  setAudioBlocked: (audioBlocked) => set({ audioBlocked }),
  resetToCruise: () => set({ ...createCruiseParams() }),
  applyPresetCruise: () => set({ ...createCruiseParams() }),
  applyPresetClimb: () => set({ ...createClimbParams() }),
  applyPresetStallDemo: () => set({ ...createStallDemoParams() }),
}));

export * from "./params";
