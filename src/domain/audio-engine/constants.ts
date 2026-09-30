/** Constantes de audio de dominio (HRU) — APO-AUDIO-1.1 H-A3 + Mejora 1 + CAB C-A5. */

/** Fade-out lineal del ambient saliente (ms). */
export const FADE_OUT_MS = 150;

/** Fade-in lineal del ambient entrante (ms). Sin solape con el anterior. */
export const FADE_IN_MS = 300;

/** Gain relativo ambient (dB). Runtime convierte a linear gain. */
export const AMBIENT_GAIN_DB = -18;

/** Gain relativo one-shot / horn (dB). */
export const ONESHOT_GAIN_DB = -6;

/** Periodo entre pulsos del stall horn (ms) — paridad cliente CAB. */
export const STALL_HORN_INTERVAL_MS = 440;

/** Frecuencia del horn sintético (Hz). */
export const STALL_HORN_FREQ_HZ = 740;

/** Duración de cada beep del horn (ms); usa rampa corta alineada a FADE_OUT. */
export const STALL_HORN_BEEP_MS = FADE_OUT_MS;
