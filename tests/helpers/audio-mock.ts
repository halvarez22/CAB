/**
 * Mock Web Audio — APO-AUDIO-1.1 Mejora 4 / A-3.
 * Registra llamadas para asertar secuencia de crossfade.
 */

import type {
  AudioBufferLike,
  AudioBufferSourceNodeLike,
  AudioContextLike,
  AudioContextState,
  AudioNodeLike,
  AudioParamLike,
  GainNodeLike,
  OscillatorNodeLike,
} from "../../src/domain/audio-runtime/context-like";

export type MockAudioCall =
  | { type: "resume" }
  | { type: "createGain" }
  | { type: "createBufferSource"; id: number }
  | { type: "createOscillator"; id: number }
  | { type: "createBuffer" }
  | { type: "setValueAtTime"; node: string; value: number; time: number }
  | {
      type: "linearRampToValueAtTime";
      node: string;
      value: number;
      time: number;
    }
  | { type: "cancelScheduledValues"; node: string; time: number }
  | { type: "connect"; from: string; to: string }
  | { type: "disconnect"; node: string }
  | { type: "sourceStart"; id: number; when: number }
  | { type: "sourceStop"; id: number; when: number }
  | { type: "sourceLoop"; id: number; loop: boolean }
  | { type: "oscillatorStart"; id: number; when: number }
  | { type: "oscillatorStop"; id: number; when: number }
  | { type: "oscillatorType"; id: number; oscType: string };

class MockAudioParam implements AudioParamLike {
  value: number;

  constructor(
    private readonly nodeName: string,
    private readonly log: MockAudioCall[],
    initial = 0,
  ) {
    this.value = initial;
  }

  setValueAtTime(value: number, startTime: number): void {
    this.value = value;
    this.log.push({
      type: "setValueAtTime",
      node: this.nodeName,
      value,
      time: startTime,
    });
  }

  linearRampToValueAtTime(value: number, endTime: number): void {
    this.value = value;
    this.log.push({
      type: "linearRampToValueAtTime",
      node: this.nodeName,
      value,
      time: endTime,
    });
  }

  cancelScheduledValues(startTime: number): void {
    this.log.push({
      type: "cancelScheduledValues",
      node: this.nodeName,
      time: startTime,
    });
  }
}

class MockNode implements AudioNodeLike {
  constructor(
    readonly name: string,
    private readonly log: MockAudioCall[],
  ) {}

  connect(destination: AudioNodeLike | unknown): AudioNodeLike {
    const to =
      destination && typeof destination === "object" && "name" in destination
        ? String((destination as { name: string }).name)
        : "destination";
    this.log.push({ type: "connect", from: this.name, to });
    return destination as AudioNodeLike;
  }

  disconnect(): void {
    this.log.push({ type: "disconnect", node: this.name });
  }
}

class MockGainNode extends MockNode implements GainNodeLike {
  gain: AudioParamLike;

  constructor(name: string, log: MockAudioCall[]) {
    super(name, log);
    this.gain = new MockAudioParam(name, log, 0);
  }
}

class MockBufferSource extends MockNode implements AudioBufferSourceNodeLike {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  private _loop = false;

  constructor(
    readonly id: number,
    private readonly callLog: MockAudioCall[],
  ) {
    super(`source:${id}`, callLog);
  }

  get loop(): boolean {
    return this._loop;
  }

  set loop(value: boolean) {
    this._loop = value;
    this.callLog.push({ type: "sourceLoop", id: this.id, loop: value });
  }

  start(when = 0): void {
    this.callLog.push({ type: "sourceStart", id: this.id, when });
  }

  stop(when = 0): void {
    this.callLog.push({ type: "sourceStop", id: this.id, when });
    if (this.onended) this.onended();
  }
}

class MockOscillator extends MockNode implements OscillatorNodeLike {
  type = "sawtooth";
  frequency: AudioParamLike;

  constructor(
    readonly id: number,
    private readonly callLog: MockAudioCall[],
  ) {
    super(`osc:${id}`, callLog);
    this.frequency = new MockAudioParam(`osc:${id}:freq`, callLog, 440);
  }

  start(when = 0): void {
    this.callLog.push({ type: "oscillatorStart", id: this.id, when });
  }

  stop(when = 0): void {
    this.callLog.push({ type: "oscillatorStop", id: this.id, when });
  }
}

export class MockAudioContext implements AudioContextLike {
  state: AudioContextState = "suspended";
  currentTime = 0;
  destination: AudioNodeLike;
  readonly calls: MockAudioCall[] = [];
  private sourceSeq = 0;
  private oscSeq = 0;
  private gainSeq = 0;

  constructor() {
    this.destination = new MockNode("destination", this.calls);
  }

  async resume(): Promise<void> {
    this.calls.push({ type: "resume" });
    this.state = "running";
  }

  createGain(): GainNodeLike {
    this.calls.push({ type: "createGain" });
    this.gainSeq += 1;
    return new MockGainNode(`gain:${this.gainSeq}`, this.calls);
  }

  createBufferSource(): AudioBufferSourceNodeLike {
    const id = ++this.sourceSeq;
    this.calls.push({ type: "createBufferSource", id });
    return new MockBufferSource(id, this.calls);
  }

  createOscillator(): OscillatorNodeLike {
    const id = ++this.oscSeq;
    this.calls.push({ type: "createOscillator", id });
    const osc = new MockOscillator(id, this.calls);
    // Proxy type assignment through setter log
    Object.defineProperty(osc, "type", {
      get: () => (osc as unknown as { _type: string })._type ?? "sawtooth",
      set: (v: string) => {
        (osc as unknown as { _type: string })._type = v;
        this.calls.push({ type: "oscillatorType", id, oscType: v });
      },
      configurable: true,
    });
    return osc;
  }

  createBuffer(
    numberOfChannels: number,
    length: number,
    sampleRate: number,
  ): AudioBufferLike {
    this.calls.push({ type: "createBuffer" });
    return {
      numberOfChannels,
      length,
      sampleRate,
      duration: length / sampleRate,
    };
  }

  advance(seconds: number): void {
    this.currentTime += seconds;
  }

  callsOfType<T extends MockAudioCall["type"]>(
    type: T,
  ): Extract<MockAudioCall, { type: T }>[] {
    return this.calls.filter((c) => c.type === type) as Extract<
      MockAudioCall,
      { type: T }
    >[];
  }
}
