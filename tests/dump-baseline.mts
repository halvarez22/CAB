import { computeAero } from "../src/domain/aero-engine";
import { getDefaultAirfoil } from "../src/data/airfoils";
import fixture from "./fixtures/baseline-cruise.json";

const airfoil = getDefaultAirfoil();
const r = computeAero(
  {
    alphaDeg: fixture.condition.alpha_deg,
    iasKt: fixture.condition.IAS_KT,
    flapsDeg: 0,
  },
  airfoil,
);
const e = fixture.expected;
const t = fixture.tolerances;

const rows = [
  {
    name: "Lift_N",
    actual: r.liftN,
    expected: e.lift_N,
    delta: (r.liftN - e.lift_N) / e.lift_N,
    tol: t.lift_rel,
    kind: "rel" as const,
  },
  {
    name: "Drag_N",
    actual: r.dragN,
    expected: e.drag_N,
    delta: (r.dragN - e.drag_N) / e.drag_N,
    tol: t.drag_rel,
    kind: "rel" as const,
  },
  {
    name: "CL",
    actual: r.cl,
    expected: e.cl,
    delta: r.cl - e.cl,
    tol: t.cl_abs,
    kind: "abs" as const,
  },
  {
    name: "CD",
    actual: r.cd,
    expected: e.cd,
    delta: r.cd - e.cd,
    tol: t.cd_abs,
    kind: "abs" as const,
  },
  {
    name: "L_over_D",
    actual: r.lOverD,
    expected: e.l_over_d,
    delta: (r.lOverD - e.l_over_d) / e.l_over_d,
    tol: t.l_over_d_rel,
    kind: "rel" as const,
  },
  {
    name: "alpha_crit_deg",
    actual: r.criticalAlphaDeg,
    expected: e.critical_alpha_deg,
    delta: r.criticalAlphaDeg - e.critical_alpha_deg,
    tol: t.critical_alpha_abs_deg,
    kind: "abs" as const,
  },
];

console.log("=== BASELINE FORENSIC DUMP (α=4°, IAS=100KT, flaps=0°) ===");
for (const row of rows) {
  const pass = Math.abs(row.delta) <= row.tol;
  console.log(
    `${row.name}\tactual=${row.actual}\texpected=${row.expected}\tdelta=${row.delta}\ttol=${row.tol} (${row.kind})\tPASS=${pass}`,
  );
}
console.log(
  `status=${r.status}\tprofile=${r.airfoilProfile}\tversion=${r.airfoilVersion}`,
);
