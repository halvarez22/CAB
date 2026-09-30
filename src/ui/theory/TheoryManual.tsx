import type { AeroResult, AirfoilData } from "../../domain/types";
import { COPY_ES } from "../../data/copy/es";
import {
  CAB_MANUAL_META,
  CAB_MANUAL_SECTIONS,
} from "../../data/theory/cab-manual";
import { buildTheorySnapshot } from "../charts/chart-model";
import type { TheorySnapshot } from "../charts/chart-model";
import { useFlightStore } from "../../domain/flight-state";

export interface TheoryManualProps {
  airfoil: AirfoilData;
  aero: AeroResult;
}

function TheoryCabModules() {
  return (
    <div className="theory__cab-grid" data-testid="theory-cab-sections">
      {CAB_MANUAL_SECTIONS.map((section) => (
        <section
          key={section.id}
          className="theory__cab-card glass-panel"
          data-testid={`theory-section-${section.id}`}
        >
          <h3>
            <span className="theory__cab-badge">{section.id}</span>
            {section.title}
          </h3>
          <p>{section.lead}</p>
          {section.bullets && section.bullets.length > 0 ? (
            <ul>
              {section.bullets.map((bullet, i) => (
                <li key={`${section.id}-b-${i}`}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          {section.paragraphs?.map((para, i) => (
            <p key={`${section.id}-p-${i}`}>{para}</p>
          ))}
        </section>
      ))}
    </div>
  );
}

function TheoryProfileOps({ snap }: { snap: TheorySnapshot }) {
  return (
    <div className="theory__ops">
      <section className="theory__ops-card glass-panel">
        <h3>{COPY_ES.theory.sectionProfile}</h3>
        <dl className="theory__dl">
          <div>
            <dt>{COPY_ES.telemetry.profile}</dt>
            <dd data-testid="theory-profile">{snap.profile}</dd>
          </div>
          <div>
            <dt>{COPY_ES.telemetry.version}</dt>
            <dd data-testid="theory-version">{snap.version}</dd>
          </div>
          <div>
            <dt>{COPY_ES.theory.sourceLabel}</dt>
            <dd data-testid="theory-source">{snap.source}</dd>
          </div>
          <div>
            <dt>{COPY_ES.theory.calibratedLabel}</dt>
            <dd>{snap.calibratedAt}</dd>
          </div>
          <div>
            <dt>{COPY_ES.theory.densityLabel}</dt>
            <dd data-testid="theory-density">{snap.density} kg/m³</dd>
          </div>
          <div>
            <dt>{COPY_ES.theory.areaLabel}</dt>
            <dd data-testid="theory-area">{snap.area} m²</dd>
          </div>
          <div>
            <dt>{COPY_ES.theory.criticalLabel}</dt>
            <dd data-testid="theory-critical">{snap.criticalAlpha}°</dd>
          </div>
        </dl>
      </section>

      <section className="theory__ops-card glass-panel">
        <h3>{COPY_ES.theory.sectionForces}</h3>
        <p>
          <strong>{COPY_ES.theory.liftFormulaLabel}:</strong>{" "}
          <code>{COPY_ES.theory.liftFormula}</code>
        </p>
        <p>
          <strong>{COPY_ES.theory.dragFormulaLabel}:</strong>{" "}
          <code>{COPY_ES.theory.dragFormula}</code>
        </p>
      </section>

      <section className="theory__ops-card glass-panel">
        <h3>{COPY_ES.theory.sectionCurve}</h3>
        <p>{COPY_ES.theory.stallExplain}</p>
      </section>

      <section className="theory__ops-card glass-panel">
        <h3>{COPY_ES.theory.sectionOps}</h3>
        <dl className="theory__dl">
          <div>
            <dt>{COPY_ES.theory.currentAlpha}</dt>
            <dd data-testid="theory-alpha">{snap.alphaDeg.toFixed(1)}°</dd>
          </div>
          <div>
            <dt>{COPY_ES.theory.currentCl}</dt>
            <dd data-testid="theory-cl">{snap.cl.toFixed(3)}</dd>
          </div>
          <div>
            <dt>{COPY_ES.theory.currentCd}</dt>
            <dd data-testid="theory-cd">{snap.cd.toFixed(4)}</dd>
          </div>
          <div>
            <dt>{COPY_ES.theory.currentLd}</dt>
            <dd data-testid="theory-ld">{snap.lOverD.toFixed(2)}</dd>
          </div>
          <div>
            <dt>{COPY_ES.theory.currentStatus}</dt>
            <dd data-testid="theory-status">
              {COPY_ES.flowStatus[snap.status]}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

/**
 * Manual CAB — orquesta copy + cab-manual + snapshot del motor (APO-CAB C-A4).
 * Skin glass: contenedores presentacionales (APO-GLASS G-A3). Sin hardcode de contenido.
 */
export function TheoryManual({ airfoil, aero }: TheoryManualProps) {
  const setView = useFlightStore((s) => s.setView);
  const snap = buildTheorySnapshot(airfoil, aero);

  return (
    <article className="theory glass-panel" data-testid="theory-manual">
      <header className="theory__header">
        <div>
          <h2>{COPY_ES.theory.title}</h2>
          <p className="theory__doc-meta" data-testid="theory-doc-id">
            {CAB_MANUAL_META.docId}
          </p>
          <p className="theory__audience">{CAB_MANUAL_META.audience}</p>
        </div>
        <button
          type="button"
          data-testid="back-to-tunnel"
          onClick={() => setView("tunnel")}
        >
          {COPY_ES.theory.backToTunnel}
        </button>
      </header>

      <p className="theory__heading-cab" data-testid="theory-cab-heading">
        {CAB_MANUAL_META.heading}
      </p>
      <p className="theory__intro">{COPY_ES.theory.intro}</p>

      <TheoryCabModules />
      <TheoryProfileOps snap={snap} />

      <p className="theory__disclaimer">{COPY_ES.disclaimer}</p>
    </article>
  );
}
