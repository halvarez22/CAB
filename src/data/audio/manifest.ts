import type { AmbientCueId, OneShotCueId } from "../../domain/audio-engine";
import type { AudioDescriptionKey } from "../copy/es";

export interface AudioCueManifestEntry {
  id: Exclude<AmbientCueId | OneShotCueId, "none">;
  /** Ruta bajo public/ (placeholder hasta assets reales). */
  src: string;
  loop: boolean;
  descriptionKey: AudioDescriptionKey;
}

/**
 * Manifiesto de cues — HRU / APO-AUDIO A-2.
 * descriptionKey → COPY_ES.audioDescriptions.*
 */
export const AUDIO_MANIFEST: readonly AudioCueManifestEntry[] = [
  {
    id: "ambient_stable",
    src: "/audio/ambient-stable.ogg",
    loop: true,
    descriptionKey: "ambient_stable",
  },
  {
    id: "ambient_near_stall",
    src: "/audio/ambient-near-stall.ogg",
    loop: true,
    descriptionKey: "ambient_near_stall",
  },
  {
    id: "ambient_stall",
    src: "/audio/ambient-stall.ogg",
    loop: true,
    descriptionKey: "ambient_stall",
  },
  {
    id: "enter_stall",
    src: "/audio/oneshot-enter-stall.ogg",
    loop: false,
    descriptionKey: "enter_stall",
  },
  {
    id: "recover_stable",
    src: "/audio/oneshot-recover.ogg",
    loop: false,
    descriptionKey: "recover_stable",
  },
  {
    id: "stall_horn",
    src: "/audio/oneshot-stall-horn.ogg",
    loop: false,
    descriptionKey: "stall_horn",
  },
] as const;

export function getCueManifest(
  id: Exclude<AmbientCueId | OneShotCueId, "none">,
): AudioCueManifestEntry {
  const found = AUDIO_MANIFEST.find((e) => e.id === id);
  if (!found) {
    throw new Error(`Cue de audio desconocido: ${id}`);
  }
  return found;
}
