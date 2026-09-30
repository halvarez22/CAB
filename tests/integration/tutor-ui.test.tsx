import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TutorDock } from "../../src/ui/tutor/TutorDock";
import { isTutorUiEnabled } from "../../src/ui/tutor/isTutorUiEnabled";
import { useFlightStore } from "../../src/domain/flight-state";
import { COPY_ES } from "../../src/data/copy/es";
import { computeAero } from "../../src/domain/aero-engine";
import { getDefaultAirfoil } from "../../src/data/airfoils";

describe("tutor UI flag (APO-IA-1.2)", () => {
  it("visible por defecto; solo se oculta con VITE_TUTOR_ENABLED=false", () => {
    expect(isTutorUiEnabled({ VITE_TUTOR_ENABLED: undefined })).toBe(true);
    expect(isTutorUiEnabled({ VITE_TUTOR_ENABLED: "true" })).toBe(true);
    expect(isTutorUiEnabled({ VITE_TUTOR_ENABLED: "false" })).toBe(false);
  });

  it("prompt visible con enabled=true (CTA piloto)", () => {
    const aero = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 0 },
      getDefaultAirfoil(),
    );
    render(<TutorDock aero={aero} enabled />);
    expect(screen.getByTestId("tutor-dock")).toBeInTheDocument();
    expect(screen.getByTestId("tutor-question")).toBeInTheDocument();
    expect(screen.getByTestId("tutor-cta")).toHaveTextContent(
      COPY_ES.tutor.explainCta,
    );
  });

  it("oculta tutor si enabled=false (simula VITE_TUTOR_ENABLED=false)", () => {
    const aero = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 0 },
      getDefaultAirfoil(),
    );
    const { container } = render(
      <TutorDock aero={aero} enabled={false} />,
    );
    expect(container.querySelector("[data-testid=tutor-dock]")).toBeNull();
  });
});

describe("TutorDock — consulta piloto (I-A3 + 1.2)", () => {
  beforeEach(() => {
    useFlightStore.getState().resetToCruise();
  });

  it("incluye studentQuestion sanitizada en el payload", async () => {
    const user = userEvent.setup();
    const aero = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 0 },
      getDefaultAirfoil(),
    );

    const fetchImpl = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 15));
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          data: {
            titulo: "Con pregunta",
            explicacion: "Respuesta didáctica.",
            alerta_seguridad: "Sin pérdida.",
            siguiente_paso: "Sigue explorando α.",
          },
        }),
      } as Response;
    });

    render(<TutorDock aero={aero} enabled fetchImpl={fetchImpl} />);

    await user.type(
      screen.getByTestId("tutor-question"),
      "<b>¿Por qué baja L/D?</b>",
    );
    await user.click(screen.getByTestId("tutor-cta"));

    expect(screen.getByTestId("tutor-live")).toHaveAttribute(
      "aria-busy",
      "true",
    );

    await waitFor(() => {
      expect(screen.getByTestId("tutor-result")).toBeInTheDocument();
    });

    expect(fetchImpl).toHaveBeenCalled();
    const body = JSON.parse(
      String((fetchImpl.mock.calls[0]?.[1] as RequestInit)?.body),
    ) as { studentQuestion?: string; snapshot: unknown };
    expect(body.studentQuestion).toBe("¿Por qué baja L/D?");
    expect(body.snapshot).toBeTruthy();
    expect(screen.getByText(COPY_ES.tutor.disclaimer)).toBeInTheDocument();
  });

  it("CTA deshabilitado sin pregunta", async () => {
    const aero = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 0 },
      getDefaultAirfoil(),
    );
    render(<TutorDock aero={aero} enabled />);
    expect(screen.getByTestId("tutor-cta")).toBeDisabled();
  });

  it("rate_limited muestra copy y deshabilita pregunta", async () => {
    const user = userEvent.setup();
    const aero = computeAero(
      { alphaDeg: 4, iasKt: 100, flapsDeg: 0 },
      getDefaultAirfoil(),
    );
    const fetchImpl = vi.fn(async () =>
      ({
        ok: false,
        status: 429,
        json: async () => ({ ok: false, code: "rate_limited" }),
      }) as Response,
    );

    render(<TutorDock aero={aero} enabled fetchImpl={fetchImpl} />);
    await user.type(screen.getByTestId("tutor-question"), "¿Qué es la pérdida?");
    await user.click(screen.getByTestId("tutor-cta"));

    await waitFor(() => {
      expect(screen.getByTestId("tutor-error")).toHaveTextContent(
        COPY_ES.tutor.rateLimited,
      );
    });
    expect(screen.getByTestId("tutor-question")).toBeDisabled();
    expect(screen.getByTestId("tutor-cta")).toBeDisabled();
  });
});
