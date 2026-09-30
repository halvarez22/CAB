import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  STALL_HORN_FREQ_HZ,
  STALL_HORN_INTERVAL_MS,
  decideAudio,
  type AudioDecision,
} from "../../src/domain/audio-engine";
import { AudioRuntime } from "../../src/domain/audio-runtime";
import { MockAudioContext } from "../helpers/audio-mock";

function decision(
  partial: Partial<AudioDecision> & Pick<AudioDecision, "ambient">,
): AudioDecision {
  return {
    oneShot: "none",
    masterGain: 1,
    reason: "status",
    stallHorn: false,
    ...partial,
  };
}

function makeRuntime(): { mock: MockAudioContext; runtime: AudioRuntime } {
  const mock = new MockAudioContext();
  mock.state = "running";
  const runtime = new AudioRuntime({
    createContext: () => mock,
    schedule: (fn, delayMs) => {
      const id = setTimeout(fn, delayMs);
      return { cancel: () => clearTimeout(id) };
    },
  });
  return { mock, runtime };
}

describe("audio-runtime stall horn — activación", () => {
  let mock: MockAudioContext;
  let runtime: AudioRuntime;

  beforeEach(() => {
    vi.useFakeTimers();
    ({ mock, runtime } = makeRuntime());
  });

  afterEach(() => {
    runtime.dispose();
    vi.useRealTimers();
  });

  it("audioOn+stall → decideAudio.stallHorn y oscilador periódico", () => {
    const d = decideAudio({
      audioOn: true,
      paused: false,
      view: "tunnel",
      status: "stall",
      prevStatus: "stable",
      ignoreOneShot: false,
    });
    expect(d.stallHorn).toBe(true);
    runtime.apply(d);
    expect(runtime.isStallHornActive()).toBe(true);
    expect(mock.callsOfType("createOscillator").length).toBeGreaterThanOrEqual(1);
    expect(mock.callsOfType("oscillatorStart").length).toBeGreaterThanOrEqual(1);
    const freqSets = mock
      .callsOfType("setValueAtTime")
      .filter((c) => c.node.includes("freq") && c.value === STALL_HORN_FREQ_HZ);
    expect(freqSets.length).toBeGreaterThanOrEqual(1);
    vi.advanceTimersByTime(STALL_HORN_INTERVAL_MS);
    expect(mock.callsOfType("createOscillator").length).toBeGreaterThanOrEqual(2);
  });
});

describe("audio-runtime stall horn — silencios", () => {
  let runtime: AudioRuntime;

  beforeEach(() => {
    vi.useFakeTimers();
    ({ runtime } = makeRuntime());
  });

  afterEach(() => {
    runtime.dispose();
    vi.useRealTimers();
  });

  it("paused / theory / user_off → horn off aunque status stall", () => {
    runtime.apply(
      decision({ ambient: "ambient_stall", stallHorn: true, oneShot: "enter_stall" }),
    );
    expect(runtime.isStallHornActive()).toBe(true);
    runtime.apply(
      decideAudio({
        audioOn: true,
        paused: true,
        view: "tunnel",
        status: "stall",
        prevStatus: "stall",
        ignoreOneShot: false,
      }),
    );
    expect(runtime.isStallHornActive()).toBe(false);
    runtime.apply(
      decideAudio({
        audioOn: true,
        paused: false,
        view: "theory",
        status: "stall",
        prevStatus: null,
        ignoreOneShot: false,
      }),
    );
    expect(runtime.isStallHornActive()).toBe(false);
    runtime.apply(
      decideAudio({
        audioOn: false,
        paused: false,
        view: "tunnel",
        status: "stall",
        prevStatus: "stable",
        ignoreOneShot: false,
      }),
    );
    expect(runtime.isStallHornActive()).toBe(false);
  });

  it("salida a stable / near_stall detiene el horn", () => {
    runtime.apply(
      decideAudio({
        audioOn: true,
        paused: false,
        view: "tunnel",
        status: "stall",
        prevStatus: "stable",
        ignoreOneShot: false,
      }),
    );
    expect(runtime.isStallHornActive()).toBe(true);
    runtime.apply(
      decideAudio({
        audioOn: true,
        paused: false,
        view: "tunnel",
        status: "stable",
        prevStatus: "stall",
        ignoreOneShot: false,
      }),
    );
    expect(runtime.isStallHornActive()).toBe(false);
    runtime.apply(
      decideAudio({
        audioOn: true,
        paused: false,
        view: "tunnel",
        status: "stall",
        prevStatus: "near_stall",
        ignoreOneShot: false,
      }),
    );
    expect(runtime.isStallHornActive()).toBe(true);
    runtime.apply(
      decideAudio({
        audioOn: true,
        paused: false,
        view: "tunnel",
        status: "near_stall",
        prevStatus: "stall",
        ignoreOneShot: false,
      }),
    );
    expect(runtime.isStallHornActive()).toBe(false);
  });

  it("stopAll corta el horn", () => {
    runtime.apply(decision({ ambient: "ambient_stall", stallHorn: true }));
    expect(runtime.isStallHornActive()).toBe(true);
    runtime.stopAll();
    expect(runtime.isStallHornActive()).toBe(false);
  });
});
