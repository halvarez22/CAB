import type { AppView, FlowStatus } from "../types";

export type AmbientCueId =
  | "ambient_stable"
  | "ambient_near_stall"
  | "ambient_stall"
  | "none";

export type OneShotCueId =
  | "enter_stall"
  | "recover_stable"
  | "stall_horn"
  | "none";

export type AudioDecisionReason =
  | "user_off"
  | "paused"
  | "theory_view"
  | "status";

export interface AudioDecision {
  ambient: AmbientCueId;
  oneShot: OneShotCueId;
  /** 0 = silencio lógico; 1 = master habilitado (gains dB los aplica el runtime). */
  masterGain: number;
  reason: AudioDecisionReason;
  /**
   * Horn periódico de pérdida (APO-CAB C-A5).
   * true solo con audio activo en túnel y status === stall.
   */
  stallHorn: boolean;
}

export interface DecideAudioInput {
  audioOn: boolean;
  paused: boolean;
  view: AppView;
  status: FlowStatus;
  prevStatus: FlowStatus | null;
  /** true solo en el primer tick tras theory→tunnel (APO-AUDIO-1.1 H-A2). */
  ignoreOneShot: boolean;
}
