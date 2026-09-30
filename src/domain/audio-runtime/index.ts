import {
  AMBIENT_GAIN_DB,
  FADE_IN_MS,
  FADE_OUT_MS,
  ONESHOT_GAIN_DB,
  STALL_HORN_BEEP_MS,
  STALL_HORN_FREQ_HZ,
  STALL_HORN_INTERVAL_MS,
  type AmbientCueId,
  type AudioDecision,
  type OneShotCueId,
} from "../audio-engine";
import type {
  AudioBufferSourceNodeLike,
  AudioContextLike,
  GainNodeLike,
} from "./context-like";

export type { AudioContextLike } from "./context-like";

export type ResumeResult = "running" | "suspended" | "unavailable";

export type ScheduleHandle = { cancel: () => void };

export type ScheduleFn = (
  fn: () => void,
  delayMs: number,
) => ScheduleHandle;

export interface AudioRuntimeDeps {
  /** Factory inyectable (tests → MockAudioContext). */
  createContext: () => AudioContextLike;
  /** setTimeout por defecto; tests pueden sincronizar. */
  schedule?: ScheduleFn;
}

function dbToLinear(db: number): number {
  return 10 ** (db / 20);
}

function defaultSchedule(fn: () => void, delayMs: number): ScheduleHandle {
  const id = setTimeout(fn, delayMs);
  return { cancel: () => clearTimeout(id) };
}

interface AmbientVoice {
  cue: Exclude<AmbientCueId, "none">;
  source: AudioBufferSourceNodeLike;
  gain: GainNodeLike;
}

/**
 * Runtime Web Audio mockeable — APO-AUDIO A-3 + CAB C-A5 stall horn.
 * Crossfade: fade-out FADE_OUT_MS → stop → fade-in FADE_IN_MS.
 * Horn periódico solo vía decideAudio.stallHorn (pipeline Audio On).
 */
export class AudioRuntime {
  private readonly createContext: () => AudioContextLike;
  private readonly schedule: ScheduleFn;
  private ctx: AudioContextLike | null = null;
  private ambient: AmbientVoice | null = null;
  private ambientId: AmbientCueId = "none";
  private transitionGen = 0;
  private pending: ScheduleHandle | null = null;
  private oneshotSources: AudioBufferSourceNodeLike[] = [];
  private lastOneShot: OneShotCueId = "none";
  private hornArmed = false;
  private hornTick: ScheduleHandle | null = null;

  constructor(deps: AudioRuntimeDeps) {
    this.createContext = deps.createContext;
    this.schedule = deps.schedule ?? defaultSchedule;
  }

  /** Solo desde gesto de usuario (toggle). Nunca desde useEffect/status. */
  async ensureContextResumed(): Promise<ResumeResult> {
    try {
      const ctx = this.getOrCreateContext();
      if (ctx.state !== "running") {
        await ctx.resume();
      }
      const state = ctx.state as typeof ctx.state | "running";
      return state === "running" ? "running" : "suspended";
    } catch {
      return "unavailable";
    }
  }

  apply(decision: AudioDecision): void {
    const targetAmbient: AmbientCueId =
      decision.masterGain <= 0 ? "none" : decision.ambient;

    if (targetAmbient !== this.ambientId) {
      this.beginAmbientTransition(targetAmbient);
    }

    if (decision.masterGain > 0 && decision.oneShot !== "none") {
      this.playOneShot(decision.oneShot);
    }

    if (decision.stallHorn) {
      this.ensureStallHorn();
    } else {
      this.stopStallHorn();
    }
  }

  stopAll(): void {
    this.cancelPending();
    this.transitionGen += 1;
    this.stopStallHorn();
    this.stopAmbientVoice();
    this.stopOneShots();
    this.ambientId = "none";
  }

  dispose(): void {
    this.stopAll();
    this.ctx = null;
  }

  getCurrentAmbient(): AmbientCueId {
    return this.ambientId;
  }

  getLastOneShot(): OneShotCueId {
    return this.lastOneShot;
  }

  /** Expuesto a tests C-A5. */
  isStallHornActive(): boolean {
    return this.hornArmed;
  }

  private getOrCreateContext(): AudioContextLike {
    if (!this.ctx) {
      this.ctx = this.createContext();
    }
    return this.ctx;
  }

  private cancelPending(): void {
    if (this.pending) {
      this.pending.cancel();
      this.pending = null;
    }
  }

  private beginAmbientTransition(next: AmbientCueId): void {
    this.cancelPending();
    const gen = ++this.transitionGen;
    const hadAmbient = this.ambient !== null;

    if (hadAmbient) {
      this.rampAmbientGain(0, FADE_OUT_MS);
      this.pending = this.schedule(() => {
        if (gen !== this.transitionGen) return;
        this.stopAmbientVoice();
        if (next === "none") {
          this.ambientId = "none";
          return;
        }
        this.startAmbient(next as Exclude<AmbientCueId, "none">);
      }, FADE_OUT_MS);
      this.ambientId = next;
      return;
    }

    if (next === "none") {
      this.ambientId = "none";
      return;
    }

    this.startAmbient(next as Exclude<AmbientCueId, "none">);
    this.ambientId = next;
  }

  private rampAmbientGain(targetLinear: number, durationMs: number): void {
    if (!this.ambient || !this.ctx) return;
    const g = this.ambient.gain.gain;
    const t0 = this.ctx.currentTime;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(g.value, t0);
    g.linearRampToValueAtTime(targetLinear, t0 + durationMs / 1000);
  }

  private stopAmbientVoice(): void {
    if (!this.ambient) return;
    try {
      this.ambient.source.stop(0);
    } catch {
      /* already stopped */
    }
    try {
      this.ambient.source.disconnect();
      this.ambient.gain.disconnect();
    } catch {
      /* ignore */
    }
    this.ambient = null;
  }

  private startAmbient(cue: Exclude<AmbientCueId, "none">): void {
    const ctx = this.getOrCreateContext();
    const gain = ctx.createGain();
    const source = ctx.createBufferSource();
    source.buffer = this.silentBuffer(ctx);
    source.loop = true;
    const target = dbToLinear(AMBIENT_GAIN_DB);
    const t0 = ctx.currentTime;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(target, t0 + FADE_IN_MS / 1000);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(t0);
    this.ambient = { cue, source, gain };
  }

  private playOneShot(cue: Exclude<OneShotCueId, "none">): void {
    this.lastOneShot = cue;
    if (cue === "stall_horn") {
      this.fireHornBeep();
      return;
    }
    const ctx = this.getOrCreateContext();
    const gain = ctx.createGain();
    const source = ctx.createBufferSource();
    source.buffer = this.silentBuffer(ctx);
    source.loop = false;
    const target = dbToLinear(ONESHOT_GAIN_DB);
    const t0 = ctx.currentTime;
    gain.gain.setValueAtTime(target, t0);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.onended = () => {
      this.oneshotSources = this.oneshotSources.filter((s) => s !== source);
      try {
        source.disconnect();
        gain.disconnect();
      } catch {
        /* ignore */
      }
    };
    source.start(t0);
    this.oneshotSources.push(source);
  }

  private ensureStallHorn(): void {
    if (this.hornArmed) return;
    this.hornArmed = true;
    this.lastOneShot = "stall_horn";
    const pulse = () => {
      if (!this.hornArmed) return;
      this.fireHornBeep();
      this.hornTick = this.schedule(pulse, STALL_HORN_INTERVAL_MS);
    };
    pulse();
  }

  private stopStallHorn(): void {
    this.hornArmed = false;
    if (this.hornTick) {
      this.hornTick.cancel();
      this.hornTick = null;
    }
  }

  /** Beep sintético sawtooth — cue `stall_horn` (sin física). */
  private fireHornBeep(): void {
    const ctx = this.getOrCreateContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime;
    const peak = dbToLinear(ONESHOT_GAIN_DB);
    const beepSec = STALL_HORN_BEEP_MS / 1000;
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(STALL_HORN_FREQ_HZ, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.02, beepSec / 4));
    gain.gain.linearRampToValueAtTime(0, t0 + beepSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + beepSec);
  }

  private stopOneShots(): void {
    for (const s of this.oneshotSources) {
      try {
        s.stop(0);
      } catch {
        /* ignore */
      }
    }
    this.oneshotSources = [];
  }

  private silentBuffer(ctx: AudioContextLike) {
    return ctx.createBuffer(1, 1, 22050);
  }
}

export function dbToLinearGain(db: number): number {
  return dbToLinear(db);
}
