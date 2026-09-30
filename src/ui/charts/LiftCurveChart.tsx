import type { AeroResult, AirfoilData } from "../../domain/types";
import { COPY_ES } from "../../data/copy/es";
import {
  alphaToX,
  buildChartScale,
  clToY,
  polarToPolyline,
} from "./chart-model";

export interface LiftCurveChartProps {
  airfoil: AirfoilData;
  aero: AeroResult;
  width?: number;
  height?: number;
}

/**
 * Curva CL–α: dibuja `airfoil.polar` tal cual + punto (α, CL) de AeroResult.
 * Sin re-interpolación de polar (FDP / puerta Qwen 4/5).
 */
export function LiftCurveChart({
  airfoil,
  aero,
  width = 420,
  height = 260,
}: LiftCurveChartProps) {
  const scale = buildChartScale(airfoil.polar, width, height);
  const poly = polarToPolyline(airfoil.polar, scale);
  const opX = alphaToX(scale, aero.alphaDeg);
  const opY = clToY(scale, aero.cl);
  const critX = alphaToX(scale, aero.criticalAlphaDeg);

  const stallZoneX = critX;
  const plotRight = width - scale.padR;
  const plotTop = scale.padT;
  const plotBottom = height - scale.padB;

  return (
    <figure className="lift-curve" data-testid="lift-curve-chart">
      <figcaption>{COPY_ES.chart.title}</figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label={COPY_ES.chart.title}
      >
        <rect
          x={stallZoneX}
          y={plotTop}
          width={Math.max(0, plotRight - stallZoneX)}
          height={plotBottom - plotTop}
          className="lift-curve__stall-zone"
        />
        <line
          x1={critX}
          y1={plotTop}
          x2={critX}
          y2={plotBottom}
          className="lift-curve__crit"
        />
        <polyline points={poly} className="lift-curve__polar" fill="none" />
        <circle
          cx={opX}
          cy={opY}
          r={6}
          className={`lift-curve__op lift-curve__op--${aero.status}`}
          data-testid="lift-curve-op"
        />
        <text x={scale.padL} y={14} className="lift-curve__label">
          {COPY_ES.chart.axisCl}
        </text>
        <text x={width - 40} y={height - 8} className="lift-curve__label">
          {COPY_ES.chart.axisAlpha}
        </text>
        <text
          x={critX + 4}
          y={plotTop + 12}
          className="lift-curve__crit-label"
          data-testid="lift-curve-crit-label"
        >
          {COPY_ES.chart.criticalMarker}: {aero.criticalAlphaDeg.toFixed(1)}°
        </text>
      </svg>
      <ul className="lift-curve__legend">
        <li>{COPY_ES.chart.operatingPoint}</li>
        <li>{COPY_ES.chart.stallZone}</li>
      </ul>
    </figure>
  );
}
