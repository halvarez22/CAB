import { describe, expect, it } from "vitest";
import {
  AMBIENT_GAIN_DB,
  FADE_IN_MS,
  FADE_OUT_MS,
  ONESHOT_GAIN_DB,
  STALL_HORN_FREQ_HZ,
  STALL_HORN_INTERVAL_MS,
  decideAudio,
  type DecideAudioInput,
} from "../../src/domain/audio-engine";

function base(overrides: Partial<DecideAudioInput> = {}): DecideAudioInput {
  return {
    audioOn: true,
    paused: false,
    view: "tunnel",
    status: "stable",
    prevStatus: "stable",
    ignoreOneShot: false,
    ...overrides,
  };
}

describe("audio-engine constants", () => {
  it("H-A3 / Mejora 1: fades y gains de dominio", () => {
    expect(FADE_OUT_MS).toBe(150);
    expect(FADE_IN_MS).toBe(300);
    expect(AMBIENT_GAIN_DB).toBe(-18);
    expect(ONESHOT_GAIN_DB).toBe(-6);
  });

  it("C-A5: constantes del stall horn", () => {
    expect(STALL_HORN_INTERVAL_MS).toBe(440);
    expect(STALL_HORN_FREQ_HZ).toBe(740);
  });
});

describe("audio-engine decideAudio — mute lógico", () => {
  it("audioOn=false → silencio user_off", () => {
    expect(
      decideAudio(base({ audioOn: false, status: "stall", prevStatus: "stable" })),
    ).toEqual({
      ambient: "none",
      oneShot: "none",
      masterGain: 0,
      reason: "user_off",
      stallHorn: false,
    });
  });

  it("paused=true → silencio paused (horn off aunque stall)", () => {
    expect(
      decideAudio(base({ paused: true, status: "stall", prevStatus: "stable" })),
    ).toEqual({
      ambient: "none",
      oneShot: "none",
      masterGain: 0,
      reason: "paused",
      stallHorn: false,
    });
  });

  it("view=theory → silencio theory_view (horn off)", () => {
    expect(
      decideAudio(
        base({ view: "theory", status: "stall", prevStatus: null }),
      ),
    ).toEqual({
      ambient: "none",
      oneShot: "none",
      masterGain: 0,
      reason: "theory_view",
      stallHorn: false,
    });
  });

  it("prioridad: user_off gana sobre paused y theory", () => {
    expect(
      decideAudio(
        base({
          audioOn: false,
          paused: true,
          view: "theory",
          status: "stall",
        }),
      ).reason,
    ).toBe("user_off");
  });

  it("prioridad: paused gana sobre theory si audioOn", () => {
    expect(
      decideAudio(
        base({
          audioOn: true,
          paused: true,
          view: "theory",
          status: "stable",
        }),
      ).reason,
    ).toBe("paused");
  });
});

describe("audio-engine decideAudio — flancos y H-A2", () => {
  it("stable→stall → ambient_stall + enter_stall + stallHorn", () => {
    const d = decideAudio(
      base({ status: "stall", prevStatus: "stable", ignoreOneShot: false }),
    );
    expect(d.ambient).toBe("ambient_stall");
    expect(d.oneShot).toBe("enter_stall");
    expect(d.masterGain).toBe(1);
    expect(d.reason).toBe("status");
    expect(d.stallHorn).toBe(true);
  });

  it("H-A2: theory→tunnel ignoreOneShot → ambient_stall + oneShot none + stallHorn", () => {
    const d = decideAudio(
      base({ status: "stall", prevStatus: null, ignoreOneShot: true }),
    );
    expect(d.ambient).toBe("ambient_stall");
    expect(d.oneShot).toBe("none");
    expect(d.masterGain).toBe(1);
    expect(d.reason).toBe("status");
    expect(d.stallHorn).toBe(true);
  });

  it("stall→stable → ambient_stable + recover_stable + horn off", () => {
    const d = decideAudio(
      base({ status: "stable", prevStatus: "stall", ignoreOneShot: false }),
    );
    expect(d.ambient).toBe("ambient_stable");
    expect(d.oneShot).toBe("recover_stable");
    expect(d.stallHorn).toBe(false);
  });

  it("stable→near_stall → ambient_near_stall + oneShot none + horn off", () => {
    const d = decideAudio(
      base({
        status: "near_stall",
        prevStatus: "stable",
        ignoreOneShot: false,
      }),
    );
    expect(d.ambient).toBe("ambient_near_stall");
    expect(d.oneShot).toBe("none");
    expect(d.stallHorn).toBe(false);
  });

  it("near_stall→stall → enter_stall + stallHorn", () => {
    const d = decideAudio(
      base({
        status: "stall",
        prevStatus: "near_stall",
        ignoreOneShot: false,
      }),
    );
    expect(d.oneShot).toBe("enter_stall");
    expect(d.ambient).toBe("ambient_stall");
    expect(d.stallHorn).toBe(true);
  });

  it("stall→near_stall → sin oneShot de recuperación + horn off", () => {
    const d = decideAudio(
      base({
        status: "near_stall",
        prevStatus: "stall",
        ignoreOneShot: false,
      }),
    );
    expect(d.ambient).toBe("ambient_near_stall");
    expect(d.oneShot).toBe("none");
    expect(d.stallHorn).toBe(false);
  });
});
