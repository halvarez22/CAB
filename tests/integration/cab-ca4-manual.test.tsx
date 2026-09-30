import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/app/App";
import { useFlightStore } from "../../src/domain/flight-state";
import {
  CAB_MANUAL_META,
  CAB_MANUAL_SECTIONS,
  getCabManualSection,
} from "../../src/data/theory/cab-manual";
import { COPY_ES } from "../../src/data/copy/es";

const theoryTsxPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../src/ui/theory/TheoryManual.tsx",
);

describe("data/theory cab-manual (C-A4)", () => {
  it("expone meta DOC-CAB y las 4 secciones P1/P2/TCP/CRM", () => {
    expect(CAB_MANUAL_META.docId).toBe("DOC-CAB-AERO-01");
    expect(CAB_MANUAL_SECTIONS.map((s) => s.id)).toEqual([
      "P1",
      "P2",
      "TCP",
      "CRM",
    ]);
    expect(getCabManualSection("CRM").paragraphs?.[0]).toMatch(/windshear/i);
  });
});

describe("integración CAB C-A4 — TheoryManual desde data/", () => {
  beforeEach(() => {
    useFlightStore.getState().resetToCruise();
    useFlightStore.setState({ view: "tunnel" });
  });

  it("renderiza secciones P1/P2/TCP/CRM con el texto del archivo de datos", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("nav-theory"));

    expect(screen.getByTestId("theory-manual")).toBeInTheDocument();
    expect(COPY_ES.views.theory).toBe("Manual CAB");
    expect(screen.getByTestId("theory-doc-id")).toHaveTextContent(
      CAB_MANUAL_META.docId,
    );
    expect(screen.getByTestId("theory-cab-heading")).toHaveTextContent(
      CAB_MANUAL_META.heading,
    );

    for (const section of CAB_MANUAL_SECTIONS) {
      const el = screen.getByTestId(`theory-section-${section.id}`);
      expect(el).toHaveTextContent(section.title);
      expect(el).toHaveTextContent(section.lead);
      for (const bullet of section.bullets ?? []) {
        expect(el).toHaveTextContent(bullet);
      }
      for (const para of section.paragraphs ?? []) {
        expect(el).toHaveTextContent(para);
      }
    }

    expect(screen.getByTestId("theory-critical")).toBeInTheDocument();
    expect(
      document.querySelector(".theory__disclaimer")?.textContent,
    ).toBe(COPY_ES.disclaimer);
  });

  it("TheoryManual.tsx no hardcodea el cuerpo de secciones CAB", () => {
    const src = readFileSync(theoryTsxPath, "utf8");
    for (const section of CAB_MANUAL_SECTIONS) {
      expect(src).not.toContain(section.title);
      expect(src).not.toContain(section.lead);
    }
    expect(src).not.toContain("Bernoulli");
    expect(src).not.toContain("windshear");
    expect(src).not.toContain("cabina estéril");
  });
});
