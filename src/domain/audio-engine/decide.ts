import type {
  AmbientCueId,
  AudioDecision,
  DecideAudioInput,
  OneShotCueId,
} from "./types";

function ambientForStatus(status: DecideAudioInput["status"]): AmbientCueId {
  if (status === "stall") return "ambient_stall";
  if (status === "near_stall") return "ambient_near_stall";
  return "ambient_stable";
}

function oneShotForFlank(
  status: DecideAudioInput["status"],
  prevStatus: DecideAudioInput["prevStatus"],
  ignoreOneShot: boolean,
): OneShotCueId {
  if (ignoreOneShot) return "none";
  if (prevStatus !== "stall" && status === "stall") return "enter_stall";
  if (prevStatus === "stall" && status === "stable") return "recover_stable";
  return "none";
}

function silence(reason: AudioDecision["reason"]): AudioDecision {
  return {
    ambient: "none",
    oneShot: "none",
    masterGain: 0,
    reason,
    stallHorn: false,
  };
}

/**
 * Motor de decisión de audio puro (APO-AUDIO-1.0 / 1.1 + CAB C-A5).
 * Sin DOM, sin Web Audio, sin polar — solo FlowStatus + flags.
 */
export function decideAudio(input: DecideAudioInput): AudioDecision {
  const { audioOn, paused, view, status, prevStatus, ignoreOneShot } = input;

  if (!audioOn) {
    return silence("user_off");
  }

  if (paused) {
    return silence("paused");
  }

  if (view === "theory") {
    return silence("theory_view");
  }

  return {
    ambient: ambientForStatus(status),
    oneShot: oneShotForFlank(status, prevStatus, ignoreOneShot),
    masterGain: 1,
    reason: "status",
    stallHorn: status === "stall",
  };
}
