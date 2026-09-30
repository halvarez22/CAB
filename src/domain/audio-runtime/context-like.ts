/**
 * Abstracción mínima de Web Audio inyectable (APO-AUDIO A-3).
 * Permite MockAudioContext en tests sin DOM real.
 */

export type AudioContextState = "suspended" | "running" | "closed" | "interrupted";

export interface AudioParamLike {
  value: number;
  setValueAtTime(value: number, startTime: number): void;
  linearRampToValueAtTime(value: number, endTime: number): void;
  cancelScheduledValues(startTime: number): void;
}

export interface AudioNodeLike {
  connect(destination: AudioNodeLike | unknown): AudioNodeLike;
  disconnect(): void;
}

export interface GainNodeLike extends AudioNodeLike {
  gain: AudioParamLike;
}

export interface AudioBufferSourceNodeLike extends AudioNodeLike {
  buffer: unknown;
  loop: boolean;
  start(when?: number): void;
  stop(when?: number): void;
  onended: (() => void) | null;
}

export interface OscillatorNodeLike extends AudioNodeLike {
  type: OscillatorType | string;
  frequency: AudioParamLike;
  start(when?: number): void;
  stop(when?: number): void;
}

export interface AudioBufferLike {
  duration: number;
  length: number;
  sampleRate: number;
  numberOfChannels: number;
}

export interface AudioContextLike {
  state: AudioContextState;
  currentTime: number;
  destination: AudioNodeLike;
  resume(): Promise<void>;
  createGain(): GainNodeLike;
  createBufferSource(): AudioBufferSourceNodeLike;
  createOscillator(): OscillatorNodeLike;
  createBuffer(
    numberOfChannels: number,
    length: number,
    sampleRate: number,
  ): AudioBufferLike;
}
