import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type { AudioDecision } from "../../src/domain/audio-engine";
import { AudioRuntime } from "../../src/domain/audio-runtime";
import { useFlightStore } from "../../src/domain/flight-state";
import type { FlowStatus } from "../../src/domain/types";
import { COPY_ES } from "../../src/data/copy/es";
import { AudioToggle } from "../../src/ui/audio/AudioToggle";
import { useFlightAudio } from "../../src/ui/audio/useFlightAudio";
import { ViewNav } from "../../src/ui/controls/ViewNav";
import { MockAudioContext } from "../helpers/audio-mock";

function AudioA4Harness({
  initialStatus,
  createContext,
}: {
  initialStatus: FlowStatus;
  createContext: () => MockAudioContext;
}) {
  const [status, setStatus] = useState<FlowStatus>(initialStatus);
  const { ensureContextResumed } = useFlightAudio({
    status,
    createContext,
  });

  return (
    <div>
      <AudioToggle ensureContextResumed={ensureContextResumed} />
      <ViewNav />
      <button
        type="button"
        data-testid="force-status-stall"
        onClick={() => setStatus("stall")}
      >
        stall
      </button>
      <button
        type="button"
        data-testid="force-status-stable"
        onClick={() => setStatus("stable")}
      >
        stable
      </button>
      <span data-testid="harness-status">{status}</span>
    </div>
  );
}

describe("integración audio A-4", () => {
  let mock: MockAudioContext;
  let decisions: AudioDecision[];
  let applySpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    useFlightStore.getState().resetToCruise();
    useFlightStore.setState({
      view: "tunnel",
      paused: false,
      audioOn: false,
      audioBlocked: false,
      vectorsOn: true,
      smokeOn: true,
    });
    mock = new MockAudioContext();
    decisions = [];
    const original = AudioRuntime.prototype.apply;
    applySpy = vi
      .spyOn(AudioRuntime.prototype, "apply")
      .mockImplementation(function (this: AudioRuntime, decision: AudioDecision) {
        decisions.push({ ...decision });
        return original.call(this, decision);
      });
  });

  afterEach(() => {
    applySpy.mockRestore();
  });

  it("click toggle con contexto suspended → audioBlockedHint y audioOn false", async () => {
    const user = userEvent.setup();
    mock.resume = async () => {
      mock.calls.push({ type: "resume" });
      // permanece suspended (H-A1)
    };

    render(
      <AudioA4Harness
        initialStatus="stable"
        createContext={() => mock}
      />,
    );

    await user.click(screen.getByTestId("toggle-audio"));

    await waitFor(() => {
      expect(screen.getByTestId("audio-blocked-hint")).toHaveTextContent(
        COPY_ES.controls.audioBlockedHint,
      );
    });
    expect(useFlightStore.getState().audioOn).toBe(false);
    expect(useFlightStore.getState().audioBlocked).toBe(true);
    expect(screen.getByTestId("toggle-audio")).toHaveTextContent(
      COPY_ES.controls.audioOff,
    );
  });

  it("vista theory → silencio (reason theory_view)", async () => {
    const user = userEvent.setup();
    mock.state = "running";

    render(
      <AudioA4Harness
        initialStatus="stable"
        createContext={() => mock}
      />,
    );

    await user.click(screen.getByTestId("toggle-audio"));
    await waitFor(() => {
      expect(useFlightStore.getState().audioOn).toBe(true);
    });

    await user.click(screen.getByTestId("nav-theory"));
    await waitFor(() => {
      const last = decisions.at(-1);
      expect(last?.reason).toBe("theory_view");
      expect(last?.masterGain).toBe(0);
      expect(last?.ambient).toBe("none");
      expect(last?.oneShot).toBe("none");
    });
  });

  it("theory→tunnel con stall → ignoreOneShot (sin enter_stall)", async () => {
    const user = userEvent.setup();
    mock.state = "running";

    render(
      <AudioA4Harness
        initialStatus="stable"
        createContext={() => mock}
      />,
    );

    await user.click(screen.getByTestId("toggle-audio"));
    await waitFor(() => expect(useFlightStore.getState().audioOn).toBe(true));

    await user.click(screen.getByTestId("force-status-stall"));
    await waitFor(() => {
      expect(decisions.some((d) => d.oneShot === "enter_stall")).toBe(true);
    });

    await user.click(screen.getByTestId("nav-theory"));
    await waitFor(() => {
      expect(decisions.at(-1)?.reason).toBe("theory_view");
    });

    const beforeReturn = decisions.length;
    await user.click(screen.getByTestId("nav-tunnel"));

    await waitFor(() => {
      expect(useFlightStore.getState().view).toBe("tunnel");
      expect(decisions.length).toBeGreaterThan(beforeReturn);
    });

    const afterReturn = decisions.slice(beforeReturn);
    const tunnelDecisions = afterReturn.filter((d) => d.reason === "status");
    expect(tunnelDecisions.length).toBeGreaterThanOrEqual(1);
    expect(tunnelDecisions[0].ambient).toBe("ambient_stall");
    expect(tunnelDecisions[0].oneShot).toBe("none");
    expect(
      tunnelDecisions.every((d) => d.oneShot !== "enter_stall"),
    ).toBe(true);
  });
});
