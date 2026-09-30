import { afterEach, describe, expect, it, vi } from "vitest";
import { createBrowserAudioContext } from "../../src/ui/audio/create-browser-context";

describe("createBrowserAudioContext (A-5 Safari fallback)", () => {
  const originalAC = window.AudioContext;
  // webkit no tipado en DOM lib estándar
  const win = window as Window & { webkitAudioContext?: typeof AudioContext };

  afterEach(() => {
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      writable: true,
      value: originalAC,
    });
    delete win.webkitAudioContext;
  });

  it("usa AudioContext estándar cuando existe", () => {
    const ctor = vi.fn(function MockAC(this: { state: string }) {
      this.state = "suspended";
    });
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      writable: true,
      value: ctor,
    });
    delete win.webkitAudioContext;

    const ctx = createBrowserAudioContext();
    expect(ctor).toHaveBeenCalledOnce();
    expect(ctx).toBeDefined();
  });

  it("cae a webkitAudioContext si falta AudioContext (Safari)", () => {
    const webkitCtor = vi.fn(function MockWebkit(this: { state: string }) {
      this.state = "suspended";
    });
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      writable: true,
      value: undefined,
    });
    win.webkitAudioContext = webkitCtor as unknown as typeof AudioContext;

    const ctx = createBrowserAudioContext();
    expect(webkitCtor).toHaveBeenCalledOnce();
    expect(ctx).toBeDefined();
  });

  it("lanza si no hay ningún constructor", () => {
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      writable: true,
      value: undefined,
    });
    delete win.webkitAudioContext;
    expect(() => createBrowserAudioContext()).toThrow(/no disponible/);
  });
});
