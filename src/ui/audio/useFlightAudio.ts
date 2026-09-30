import { useEffect, useRef, useState } from "react";
import { decideAudio } from "../../domain/audio-engine";
import type { FlowStatus } from "../../domain/types";
import {
  AudioRuntime,
  type AudioContextLike,
  type ResumeResult,
} from "../../domain/audio-runtime";
import { useFlightStore } from "../../domain/flight-state";
import { createBrowserAudioContext } from "./create-browser-context";

export interface UseFlightAudioOptions {
  status: FlowStatus;
  /** Inyectable para tests (MockAudioContext). */
  createContext?: () => AudioContextLike;
}

export interface UseFlightAudioApi {
  ensureContextResumed: () => Promise<ResumeResult>;
}

/**
 * Orquesta store + FlowStatus → decideAudio → AudioRuntime (APO-AUDIO A-4/A-5).
 * Respeta H-A2: prevStatus null en theory; ignoreOneShot al volver a tunnel.
 */
export function useFlightAudio(
  options: UseFlightAudioOptions,
): UseFlightAudioApi {
  const { status, createContext = createBrowserAudioContext } = options;
  const audioOn = useFlightStore((s) => s.audioOn);
  const paused = useFlightStore((s) => s.paused);
  const view = useFlightStore((s) => s.view);

  const [runtime] = useState(
    () => new AudioRuntime({ createContext }),
  );
  const prevStatusRef = useRef<FlowStatus | null>(null);
  const prevViewRef = useRef(view);
  const ignoreOneShotRef = useRef(false);

  useEffect(() => {
    const prevView = prevViewRef.current;
    if (prevView === "theory" && view === "tunnel") {
      ignoreOneShotRef.current = true;
      prevStatusRef.current = null;
    }
    if (view === "theory") {
      prevStatusRef.current = null;
    }
    prevViewRef.current = view;
  }, [view]);

  useEffect(() => {
    if (!audioOn) {
      runtime.stopAll();
      return;
    }

    const ignoreOneShot = ignoreOneShotRef.current;
    const decision = decideAudio({
      audioOn,
      paused,
      view,
      status,
      prevStatus: prevStatusRef.current,
      ignoreOneShot,
    });
    runtime.apply(decision);

    if (ignoreOneShot) {
      ignoreOneShotRef.current = false;
    }

    if (view === "theory") {
      prevStatusRef.current = null;
    } else if (!paused) {
      prevStatusRef.current = status;
    }
  }, [audioOn, paused, view, status, runtime]);

  useEffect(() => {
    return () => {
      runtime.stopAll();
    };
  }, [runtime]);

  return {
    ensureContextResumed: () => runtime.ensureContextResumed(),
  };
}

export type { AudioContextLike, ResumeResult };
