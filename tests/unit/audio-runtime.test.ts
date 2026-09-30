import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AMBIENT_GAIN_DB,
  FADE_IN_MS,
  FADE_OUT_MS,
  ONESHOT_GAIN_DB,
  type AudioDecision,
} from "../../src/domain/audio-engine";
import {
  AudioRuntime,
  dbToLinearGain,
} from "../../src/domain/audio-runtime";
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

describe("audio-runtime helpers", () => {
  it("dbToLinearGain convierte dB de dominio", () => {
    expect(dbToLinearGain(AMBIENT_GAIN_DB)).toBeCloseTo(10 ** (-18 / 20), 6);
    expect(dbToLinearGain(ONESHOT_GAIN_DB)).toBeCloseTo(10 ** (-6 / 20), 6);
  });
});

describe("audio-runtime ensureContextResumed", () => {
  it("resume desde suspended → running", async () => {
    const mock = new MockAudioContext();
    const runtime = new AudioRuntime({ createContext: () => mock });
    await expect(runtime.ensureContextResumed()).resolves.toBe("running");
    expect(mock.callsOfType("resume")).toHaveLength(1);
    expect(mock.state).toBe("running");
  });

  it("ya running no vuelve a resume", async () => {
    const mock = new MockAudioContext();
    mock.state = "running";
    const runtime = new AudioRuntime({ createContext: () => mock });
    await expect(runtime.ensureContextResumed()).resolves.toBe("running");
    expect(mock.callsOfType("resume")).toHaveLength(0);
  });
});

describe("audio-runtime crossfade H-A3", () => {
  let mock: MockAudioContext;
  let runtime: AudioRuntime;

  beforeEach(() => {
    vi.useFakeTimers();
    mock = new MockAudioContext();
    mock.state = "running";
    runtime = new AudioRuntime({
      createContext: () => mock,
      schedule: (fn, delayMs) => {
        const id = setTimeout(fn, delayMs);
        return { cancel: () => clearTimeout(id) };
      },
    });
  });

  afterEach(() => {
    runtime.dispose();
    vi.useRealTimers();
  });

  it("primer ambient: fade-in FADE_IN_MS sin fade-out previo", () => {
    runtime.apply(decision({ ambient: "ambient_stable" }));
    const ramps = mock.callsOfType("linearRampToValueAtTime");
    expect(ramps).toHaveLength(1);
    expect(ramps[0].value).toBeCloseTo(dbToLinearGain(AMBIENT_GAIN_DB), 6);
    expect(ramps[0].time).toBeCloseTo(FADE_IN_MS / 1000, 6);
    expect(mock.callsOfType("sourceStart")).toHaveLength(1);
    expect(mock.callsOfType("sourceStop")).toHaveLength(0);
    expect(runtime.getCurrentAmbient()).toBe("ambient_stable");
  });

  it("stable→stall: fade-out → stop → fade-in sin solape", () => {
    runtime.apply(decision({ ambient: "ambient_stable" }));
    const firstStart = mock.callsOfType("sourceStart")[0];
    expect(firstStart.id).toBe(1);

    mock.advance(1);
    runtime.apply(decision({ ambient: "ambient_stall" }));

    const fadeOutRamps = mock
      .callsOfType("linearRampToValueAtTime")
      .filter((c) => c.value === 0);
    expect(fadeOutRamps.length).toBeGreaterThanOrEqual(1);
    const out = fadeOutRamps[fadeOutRamps.length - 1];
    expect(out.time).toBeCloseTo(1 + FADE_OUT_MS / 1000, 6);

    expect(mock.callsOfType("sourceStart")).toHaveLength(1);
    expect(mock.callsOfType("sourceStop")).toHaveLength(0);

    vi.advanceTimersByTime(FADE_OUT_MS);

    const starts = mock.callsOfType("sourceStart");
    const stops = mock.callsOfType("sourceStop");
    expect(stops).toHaveLength(1);
    expect(stops[0].id).toBe(1);
    expect(starts).toHaveLength(2);
    expect(starts[1].id).toBe(2);

    const stopIdx = mock.calls.findIndex(
      (c) => c.type === "sourceStop" && c.id === 1,
    );
    const startIdx = mock.calls.findIndex(
      (c) => c.type === "sourceStart" && c.id === 2,
    );
    expect(stopIdx).toBeGreaterThanOrEqual(0);
    expect(startIdx).toBeGreaterThan(stopIdx);

    const fadeIn = mock
      .callsOfType("linearRampToValueAtTime")
      .filter((c) => c.value > 0)
      .at(-1);
    expect(fadeIn).toBeDefined();
    expect(fadeIn!.value).toBeCloseTo(dbToLinearGain(AMBIENT_GAIN_DB), 6);
    expect(fadeIn!.time - mock.currentTime).toBeCloseTo(FADE_IN_MS / 1000, 6);
  });

  it("ambient→none: solo fade-out 150ms + stop", () => {
    runtime.apply(decision({ ambient: "ambient_near_stall" }));
    mock.advance(0.5);
    runtime.apply(decision({ ambient: "none", masterGain: 0, reason: "paused" }));

    expect(
      mock.callsOfType("linearRampToValueAtTime").some((c) => c.value === 0),
    ).toBe(true);
    vi.advanceTimersByTime(FADE_OUT_MS);
    expect(mock.callsOfType("sourceStop")).toHaveLength(1);
    expect(mock.callsOfType("sourceStart")).toHaveLength(1);
    expect(runtime.getCurrentAmbient()).toBe("none");
  });
});

describe("audio-runtime apply / stopAll", () => {
  let mock: MockAudioContext;
  let runtime: AudioRuntime;

  beforeEach(() => {
    vi.useFakeTimers();
    mock = new MockAudioContext();
    mock.state = "running";
    runtime = new AudioRuntime({
      createContext: () => mock,
      schedule: (fn, delayMs) => {
        const id = setTimeout(fn, delayMs);
        return { cancel: () => clearTimeout(id) };
      },
    });
  });

  afterEach(() => {
    runtime.dispose();
    vi.useRealTimers();
  });

  it("oneShot dispara source no-loop tras ambient", () => {
    runtime.apply(
      decision({
        ambient: "ambient_stall",
        oneShot: "enter_stall",
      }),
    );
    expect(runtime.getLastOneShot()).toBe("enter_stall");
    const loops = mock.callsOfType("sourceLoop");
    expect(loops.some((l) => l.loop === true)).toBe(true);
    expect(loops.some((l) => l.loop === false)).toBe(true);
    expect(mock.callsOfType("sourceStart").length).toBeGreaterThanOrEqual(2);
    const oneShotGains = mock
      .callsOfType("setValueAtTime")
      .filter((c) => c.value === dbToLinearGain(ONESHOT_GAIN_DB));
    expect(oneShotGains.length).toBeGreaterThanOrEqual(1);
  });

  it("stopAll corta ambient y one-shots", () => {
    runtime.apply(
      decision({ ambient: "ambient_stable", oneShot: "recover_stable" }),
    );
    runtime.stopAll();
    expect(runtime.getCurrentAmbient()).toBe("none");
    expect(mock.callsOfType("sourceStop").length).toBeGreaterThanOrEqual(1);
  });

  it("cambio de ambient a mitad del fade-out cancela el pendiente", () => {
    runtime.apply(decision({ ambient: "ambient_stable" }));
    runtime.apply(decision({ ambient: "ambient_near_stall" }));
    runtime.apply(decision({ ambient: "ambient_stall" }));
    vi.advanceTimersByTime(FADE_OUT_MS);
    const starts = mock.callsOfType("sourceStart");
    const ambientStarts = starts.filter((s) => {
      const loopCall = mock.calls.find(
        (c) => c.type === "sourceLoop" && c.id === s.id && c.loop === true,
      );
      return Boolean(loopCall);
    });
    expect(ambientStarts.length).toBeGreaterThanOrEqual(2);
    expect(runtime.getCurrentAmbient()).toBe("ambient_stall");
  });

  it("apply none sin ambient previo es no-op de grafo", () => {
    runtime.apply(decision({ ambient: "none", masterGain: 0, reason: "user_off" }));
    expect(mock.callsOfType("createBufferSource")).toHaveLength(0);
    expect(runtime.getCurrentAmbient()).toBe("none");
  });
});

describe("audio-runtime ensureContextResumed — errores", () => {
  it("createContext que lanza → unavailable", async () => {
    const runtime = new AudioRuntime({
      createContext: () => {
        throw new Error("no audio");
      },
    });
    await expect(runtime.ensureContextResumed()).resolves.toBe("unavailable");
  });
});

describe("audio manifest A-2", () => {
  it("descriptionKey apunta a COPY_ES.audioDescriptions", async () => {
    const { AUDIO_MANIFEST, getCueManifest } = await import(
      "../../src/data/audio/manifest"
    );
    const { COPY_ES } = await import("../../src/data/copy/es");
    expect(AUDIO_MANIFEST).toHaveLength(6);
    for (const entry of AUDIO_MANIFEST) {
      expect(COPY_ES.audioDescriptions[entry.descriptionKey]).toBeTruthy();
      expect(entry.src.startsWith("/audio/")).toBe(true);
      expect(getCueManifest(entry.id).id).toBe(entry.id);
    }
  });

  it("getCueManifest rechaza id desconocido", async () => {
    const { getCueManifest } = await import("../../src/data/audio/manifest");
    expect(() =>
      getCueManifest("ambient_stable"),
    ).not.toThrow();
    // forzamos path de error vía cast
    expect(() =>
      getCueManifest("no_existe" as "ambient_stable"),
    ).toThrow(/desconocido/);
  });
});
