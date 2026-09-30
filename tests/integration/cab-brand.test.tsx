import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../../src/app/App";
import { useFlightStore } from "../../src/domain/flight-state";
import { COPY_ES } from "../../src/data/copy/es";

describe("integración CAB C-A1 — brand", () => {
  beforeEach(() => {
    useFlightStore.getState().resetToCruise();
    useFlightStore.setState({
      view: "tunnel",
      audioOn: false,
      audioBlocked: false,
    });
  });

  it("header muestra logo CAB y copy institucional desde COPY_ES.brand", () => {
    render(<App />);
    const brand = screen.getByTestId("cab-brand");
    expect(brand).toHaveAttribute("aria-label", COPY_ES.brand.logoAlt);
    expect(brand).toHaveTextContent(COPY_ES.brand.organization);
    expect(brand).toHaveTextContent(COPY_ES.brand.badge);
    expect(brand).toHaveTextContent(COPY_ES.brand.product);
    expect(brand).toHaveTextContent(COPY_ES.brand.audience);
    expect(brand.querySelector(".cab-brand__logo")).toBeTruthy();
  });

  it("nav usa labels Túnel Virtual / Manual CAB", () => {
    render(<App />);
    expect(screen.getByTestId("nav-tunnel")).toHaveTextContent(
      COPY_ES.views.tunnel,
    );
    expect(screen.getByTestId("nav-theory")).toHaveTextContent(
      COPY_ES.views.theory,
    );
    expect(COPY_ES.views.tunnel).toBe("Túnel Virtual");
    expect(COPY_ES.views.theory).toBe("Manual CAB");
  });
});
