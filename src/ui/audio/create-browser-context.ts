import type { AudioContextLike } from "../../domain/audio-runtime/context-like";

type AudioContextCtor = new () => AudioContext;

/**
 * Factory del navegador (APO-AUDIO A-5).
 * Preferencia: `AudioContext` estándar → fallback `webkitAudioContext` (Safari).
 * Lanza si ninguno existe (ensureContextResumed → "unavailable").
 */
export function createBrowserAudioContext(): AudioContextLike {
  const win = window as Window & {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  const Ctor = win.AudioContext ?? win.webkitAudioContext;
  if (!Ctor) {
    throw new Error("AudioContext no disponible en este navegador");
  }
  return new Ctor() as unknown as AudioContextLike;
}
