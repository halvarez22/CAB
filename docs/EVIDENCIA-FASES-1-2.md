# EVIDENCIA FORENSE — Fases 1 y 2 · AEROLAB

**Implementador:** Cursor Agent  
**Solicitud:** Qwen 2026-09-30  
**Fecha de generación:** 2026-09-29 (local) / corrida de comandos en esta entrega  
**Propósito:** Sustentar liberación de Fase 3  

---

## 1.1 — `tree src/` (3 niveles)

```
src/
  app/
    App.tsx
    styles.css
  data/
    airfoils/
      index.ts
      naca2412.json
    copy/
      es.ts
    regimes/
      es.ts
  domain/
    aero-engine/
      index.ts
      polar.ts
    flight-state/
      index.ts
      params.ts
    units/
      index.ts
    types.ts
  main.tsx
  vite-env.d.ts
```

`tests/`:
```
tests/fixtures/baseline-cruise.json
tests/unit/aero-engine-polar.test.ts
tests/unit/aero-engine.test.ts
tests/unit/flight-state.test.ts
tests/unit/flight-store.test.ts
tests/unit/units.test.ts
tests/dump-baseline.mts   # util forense (dump deltas), no es test de suite
```

---

## 1.2 — `package.json` completo

```json
{
  "name": "aerolab",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "description": "AEROLAB — Túnel de Viento Didáctico",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b --pretty false",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/node": "^26.6.3",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.1",
    "@vitest/coverage-v8": "^5.0.2",
    "eslint": "^10.11.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.7",
    "globals": "^17.12.0",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.71.0",
    "vite": "^8.3.1",
    "vite-node": "^6.0.0",
    "vitest": "^5.0.2"
  }
}
```

Nota: `vite-node` se añadió únicamente para el dump forense de baseline (artefacto 2.12). No forma parte del runtime de la app.

---

## 1.3 — TypeScript strict

`tsconfig.json` (project references):

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json` (strict efectivo sobre `src`):

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 1.4 — ESLint max-lines / max-lines-per-function

Archivo: `eslint.config.js`

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage", "node_modules"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // AAD / Addendum v1.1 — anti God-Object
      "max-lines": ["error", { max: 800, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": [
        "warn",
        { max: 120, skipBlankLines: true, skipComments: true },
      ],
    },
  },
);
```

Grep `eslint-disable` en `src/domain`: **0 matches**.

---

## 1.5 — Vitest coverage thresholds

Archivo: `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/domain/**/*.ts"],
      exclude: ["src/domain/types.ts"],
      thresholds: {
        // Addendum v1.1 — ≥90% aero-engine + flight-state; ≥70% global domain
        "src/domain/aero-engine/**/*.ts": {
          lines: 90,
          functions: 90,
          statements: 90,
          branches: 80,
        },
        "src/domain/flight-state/**/*.ts": {
          lines: 90,
          functions: 90,
          statements: 90,
          branches: 80,
        },
        "src/domain/**/*.ts": {
          lines: 70,
          functions: 70,
          statements: 70,
          branches: 60,
        },
      },
    },
  },
});
```

---

## 1.6 — CI merge gate

Archivo: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test:coverage
      - run: pnpm build
```

Orden efectivo: `lint → test:coverage → build`.

---

## 1.7 — `pnpm install` (verbatim)

```
Lockfile is up to date, resolution step is skipped
Already up to date

dependencies:
+ react 19.3.0
+ react-dom 19.3.0
+ zustand 5.0.15

devDependencies:
+ @eslint/js 10.0.1
+ @types/node 26.6.3
+ @types/react 19.3.0
+ @types/react-dom 19.3.0
+ @vitejs/plugin-react 6.1.1
+ @vitest/coverage-v8 5.0.2
+ eslint 10.11.0
+ eslint-plugin-react-hooks 7.1.1
+ eslint-plugin-react-refresh 0.5.7
+ globals 17.12.0
+ typescript 5.8.3
+ typescript-eslint 8.71.0
+ vite 8.3.1
+ vite-node 6.0.0
+ vitest 5.0.2

Done in 526ms
EXIT:0
```

`pnpm audit --prod`:

```
No known vulnerabilities found
EXIT:0
```

---

## 1.8 — `pnpm lint` (verbatim)

```
> aerolab@0.1.0 lint C:\CAP
> eslint .

EXIT:0
```

---

## 1.9 — `pnpm build` (verbatim)

```
> aerolab@0.1.0 build C:\CAP
> tsc -b && vite build

vite v8.3.1 building client environment for production...
transforming...
✓ 28 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.43 kB │ gzip:  0.30 kB
dist/assets/index-BnPrn6Yh.css    1.13 kB │ gzip:  0.56 kB
dist/assets/index-B1CJ6vXQ.js   227.47 kB │ gzip: 71.72 kB

✓ built in 97ms
EXIT:0
```

(`tsc -b` no emitió errores; exit 0.)

---

## 1.10 — `pnpm test` / reporter verbose (16 tests, nombres completos)

```
 ✓ tests/unit/units.test.ts > units > convierte KT y N con factores documentados
 ✓ tests/unit/aero-engine-polar.test.ts > aero-engine polar helpers > extrapola por clamp en extremos de la polar
 ✓ tests/unit/aero-engine-polar.test.ts > aero-engine polar helpers > falla si la polar está vacía
 ✓ tests/unit/aero-engine-polar.test.ts > aero-engine polar helpers > interpola entre dos puntos contiguos
 ✓ tests/unit/aero-engine-polar.test.ts > aero-engine polar helpers > resuelve delta de flaps existente y fallback
 ✓ tests/unit/aero-engine-polar.test.ts > aero-engine polar helpers > maneja polar de un solo punto
 ✓ tests/unit/flight-state.test.ts > flight-state params > default coincide con crucero baseline
 ✓ tests/unit/flight-state.test.ts > flight-state params > presets de instructor son coherentes
 ✓ tests/unit/flight-state.test.ts > flight-state params > clampa α e IAS a rangos didácticos
 ✓ tests/unit/flight-store.test.ts > flight-state store (Zustand) > clampa α e IAS vía acciones
 ✓ tests/unit/flight-store.test.ts > flight-state store (Zustand) > ignora flaps inválidos y acepta 15/30
 ✓ tests/unit/flight-store.test.ts > flight-state store (Zustand) > presets y toggles de vista/vectores/humo/pausa
 ✓ tests/unit/aero-engine.test.ts > aero-engine — baseline crucero (FDP / SQA) > cumple tolerancias del Addendum v1.1 en α=4°, 100 KT, flaps 0°
 ✓ tests/unit/aero-engine.test.ts > aero-engine — baseline crucero (FDP / SQA) > marca stall cuando α ≥ crítico
 ✓ tests/unit/aero-engine.test.ts > aero-engine — baseline crucero (FDP / SQA) > marca near_stall dentro del margen
 ✓ tests/unit/aero-engine.test.ts > aero-engine — baseline crucero (FDP / SQA) > aumenta CL y CD con flaps 30° respecto a limpio

 Test Files  5 passed (5)
      Tests  16 passed (16)
EXIT:0
```

---

## 1.11 — `pnpm test:coverage` (verbatim)

```
> aerolab@0.1.0 test:coverage C:\CAP
> vitest run --coverage

 RUN  v5.0.2 C:/CAP
      Coverage enabled with v8

 Test Files  5 passed (5)
      Tests  16 passed (16)

 % Coverage report from v8
--------------|---------|----------|---------|---------|-------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------|---------|----------|---------|---------|-------------------
All files     |   98.48 |    95.65 |     100 |   98.41 |                   
 aero-engine  |   97.43 |    94.44 |     100 |   97.36 |                   
  polar.ts    |   95.45 |    92.85 |     100 |   95.23 | 38                
--------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 98.48% ( 65/66 )
Branches     : 95.65% ( 22/23 )
Functions    : 100% ( 26/26 )
Lines        : 98.41% ( 62/63 )
================================================================================
EXIT:0
```

Nota forense: Vitest/v8 solo lista en detalle archivos <100%. `flight-state/*`, `units/*` y `aero-engine/index.ts` alcanzaron 100% y no aparecen en la tabla parcial; los umbrales del config (90%/70%) se cumplieron (exit 0). Línea 38 de `polar.ts` = fallback defensivo post-loop (inalcanzable con polar ordenada válida).

---

## 2.1 — `src/data/airfoils/naca2412.json` completo

```json
{
  "profile": "NACA2412-mod",
  "version": "1.0.0",
  "source": "calibración sobre prototipo Gemini share 0dd7f089300a · 2026-09",
  "calibrated_at": "2026-09-29",
  "reference_conditions": {
    "alpha_deg": 4.0,
    "IAS_KT": 100,
    "flaps_deg": 0
  },
  "critical_alpha_deg": 15.5,
  "reference_area_m2": 2.201,
  "air_density_kg_m3": 1.225,
  "near_stall_margin_deg": 2.0,
  "units_note": "polar adimensional; fuerzas en N vía aero-engine + units",
  "polar": [
    { "alphaDeg": -6, "cl": -0.38, "cd": 0.028 },
    { "alphaDeg": -2, "cl": 0.04, "cd": 0.018 },
    { "alphaDeg": 0, "cl": 0.25, "cd": 0.016 },
    { "alphaDeg": 2, "cl": 0.46, "cd": 0.022 },
    { "alphaDeg": 4, "cl": 0.67, "cd": 0.043 },
    { "alphaDeg": 6, "cl": 0.88, "cd": 0.055 },
    { "alphaDeg": 8, "cl": 1.09, "cd": 0.072 },
    { "alphaDeg": 10, "cl": 1.28, "cd": 0.095 },
    { "alphaDeg": 12, "cl": 1.47, "cd": 0.125 },
    { "alphaDeg": 14, "cl": 1.68, "cd": 0.165 },
    { "alphaDeg": 15.5, "cl": 1.82, "cd": 0.22 },
    { "alphaDeg": 16, "cl": 1.55, "cd": 0.28 },
    { "alphaDeg": 18, "cl": 1.15, "cd": 0.38 },
    { "alphaDeg": 20, "cl": 0.95, "cd": 0.45 }
  ],
  "flaps_deltas": {
    "0": { "clAdd": 0, "cdAdd": 0, "criticalAlphaShiftDeg": 0 },
    "15": { "clAdd": 0.35, "cdAdd": 0.025, "criticalAlphaShiftDeg": -1.0 },
    "30": { "clAdd": 0.55, "cdAdd": 0.055, "criticalAlphaShiftDeg": -1.5 }
  }
}
```

---

## 2.2 — `src/data/regimes/es.ts` completo

Ver archivo en repo (también reproducido abajo):

```ts
/** Regímenes de vuelo versionados — dato, no copy en JSX (H5 / U-First / HRU). */

export type RegimeId = "dive" | "cruise" | "climb" | "stall";

export interface RegimeDefinition {
  id: RegimeId;
  label: string;
  alphaDeg: number;
  note: string;
}

export const REGIMES_ES: readonly RegimeDefinition[] = [
  {
    id: "dive",
    label: "Picado",
    alphaDeg: -6,
    note: "Ángulo de ataque negativo de referencia en el slider.",
  },
  {
    id: "cruise",
    label: "Crucero",
    alphaDeg: 4,
    note: "Preset y baseline de no-regresión (α = +4°).",
  },
  {
    id: "climb",
    label: "Ascenso",
    alphaDeg: 12,
    note: "Régimen de ascenso de referencia.",
  },
  {
    id: "stall",
    label: "Pérdida",
    alphaDeg: 16,
    note: "Por encima del ángulo crítico — requiere acción de recuperación.",
  },
] as const;

export function getRegimeById(id: RegimeId): RegimeDefinition {
  const found = REGIMES_ES.find((r) => r.id === id);
  if (!found) {
    throw new Error(`Régimen desconocido: ${id}`);
  }
  return found;
}
```

---

## 2.3 — `src/data/copy/es.ts` completo

```ts
/** Copy UI en español — fuente única (HRU / U-First). */

export const COPY_ES = {
  appTitle: "AEROLAB",
  appSubtitle: "Túnel de Viento Didáctico",
  moduleLabel: "Escuela de Vuelo & Tripulantes de Cabina — Módulo Aerodinámica Básica",
  views: {
    tunnel: "Túnel",
    theory: "Manual teórico",
  },
  controls: {
    alpha: "Ángulo de ataque (α)",
    ias: "Velocidad del aire indicada (IAS)",
    flaps: "Configuración de flaps",
    flapsClean: "0° (Limpio)",
    flapsTakeoff: "15° (Despegue)",
    flapsLanding: "30° (Aterrizaje)",
    vectors: "Vectores",
    smoke: "Humo",
    pause: "Pausar",
    resume: "Reanudar",
    reset: "Reset",
    presetCruise: "Crucero",
    presetClimb: "Ascenso",
    presetStallDemo: "Demostrar pérdida",
    recoverAlpha: "Reducir α",
    resetToCruise: "Reset a crucero",
  },
  telemetry: {
    lift: "Sustentación (Lift)",
    drag: "Resistencia (Drag)",
    coefficients: "Coeficientes CL / CD",
    efficiency: "Eficiencia (L / D)",
  },
  flowStatus: {
    stable: "Flujo estable / Vuelo seguro",
    near_stall: "Cerca de la pérdida — reducir ángulo de ataque",
    stall: "Pérdida — reducir α o reset a crucero",
  },
  disclaimer:
    "Modelo didáctico 2D. No representa el performance de una aeronave certificada ni sustituye un túnel de viento físico o un FTD.",
  scaffoldNote:
    "Fases 1–2: scaffold + motor aerodinámico. La UI del túnel se construye en fases posteriores (APO).",
} as const;
```

---

## 2.4 — Fixture baseline golden master

`tests/fixtures/baseline-cruise.json`:

```json
{
  "condition": {
    "alpha_deg": 4.0,
    "IAS_KT": 100,
    "flaps_deg": 0
  },
  "expected": {
    "lift_N": 2389,
    "drag_N": 154,
    "cl": 0.67,
    "cd": 0.043,
    "l_over_d": 15.5,
    "critical_alpha_deg": 15.5
  },
  "tolerances": {
    "lift_rel": 0.015,
    "drag_rel": 0.03,
    "cl_abs": 0.01,
    "cd_abs": 0.002,
    "l_over_d_rel": 0.02,
    "critical_alpha_abs_deg": 0.2
  }
}
```

---

## 2.5 — `src/domain/aero-engine/*` completo

### `polar.ts`

```ts
import type { AirfoilData, FlapsDeg, FlapsDelta, PolarPoint } from "../types";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Interpolación lineal en la polar tabular (α creciente). */
export function interpolatePolar(
  polar: readonly PolarPoint[],
  alphaDeg: number,
): { cl: number; cd: number } {
  if (polar.length === 0) {
    throw new Error("Polar vacía");
  }

  if (alphaDeg <= polar[0].alphaDeg) {
    return { cl: polar[0].cl, cd: polar[0].cd };
  }

  const last = polar[polar.length - 1];
  if (alphaDeg >= last.alphaDeg) {
    return { cl: last.cl, cd: last.cd };
  }

  for (let i = 0; i < polar.length - 1; i += 1) {
    const left = polar[i];
    const right = polar[i + 1];
    if (alphaDeg >= left.alphaDeg && alphaDeg <= right.alphaDeg) {
      const span = right.alphaDeg - left.alphaDeg;
      const t = span === 0 ? 0 : (alphaDeg - left.alphaDeg) / span;
      return {
        cl: lerp(left.cl, right.cl, t),
        cd: lerp(left.cd, right.cd, t),
      };
    }
  }

  return { cl: last.cl, cd: last.cd };
}

export function resolveFlapsDelta(
  airfoil: AirfoilData,
  flapsDeg: FlapsDeg,
): FlapsDelta {
  const key = String(flapsDeg);
  const delta = airfoil.flaps_deltas[key];
  if (!delta) {
    return { clAdd: 0, cdAdd: 0, criticalAlphaShiftDeg: 0 };
  }
  return delta;
}
```

### `index.ts`

```ts
import type { AeroResult, AirfoilData, FlightParams, FlowStatus } from "../types";
import {
  dynamicPressurePa,
  knotsToMetersPerSecond,
  newtonsToPoundsForce,
} from "../units";
import { interpolatePolar, resolveFlapsDelta } from "./polar";

export function resolveFlowStatus(
  alphaDeg: number,
  criticalAlphaDeg: number,
  nearStallMarginDeg: number,
): FlowStatus {
  if (alphaDeg >= criticalAlphaDeg) {
    return "stall";
  }
  if (alphaDeg >= criticalAlphaDeg - nearStallMarginDeg) {
    return "near_stall";
  }
  return "stable";
}

/**
 * Motor aerodinámico puro (sin React/DOM).
 * Entrada: FlightParams + AirfoilData → AeroResult + FlowStatus.
 */
export function computeAero(
  params: Pick<FlightParams, "alphaDeg" | "iasKt" | "flapsDeg">,
  airfoil: AirfoilData,
): AeroResult {
  const flaps = resolveFlapsDelta(airfoil, params.flapsDeg);
  const criticalAlphaDeg =
    airfoil.critical_alpha_deg + flaps.criticalAlphaShiftDeg;

  const base = interpolatePolar(airfoil.polar, params.alphaDeg);
  const cl = base.cl + flaps.clAdd;
  const cd = Math.max(base.cd + flaps.cdAdd, 1e-6);

  const speedMs = knotsToMetersPerSecond(params.iasKt);
  const q = dynamicPressurePa(airfoil.air_density_kg_m3, speedMs);
  const liftN = q * airfoil.reference_area_m2 * cl;
  const dragN = q * airfoil.reference_area_m2 * cd;
  const lOverD = liftN / dragN;

  const status = resolveFlowStatus(
    params.alphaDeg,
    criticalAlphaDeg,
    airfoil.near_stall_margin_deg,
  );

  return {
    cl,
    cd,
    liftN,
    dragN,
    liftLbf: newtonsToPoundsForce(liftN),
    dragLbf: newtonsToPoundsForce(dragN),
    lOverD,
    criticalAlphaDeg,
    status,
    alphaDeg: params.alphaDeg,
    iasKt: params.iasKt,
    flapsDeg: params.flapsDeg,
    airfoilProfile: airfoil.profile,
    airfoilVersion: airfoil.version,
  };
}

export { interpolatePolar, resolveFlapsDelta } from "./polar";
```

Fórmulas explícitas:
- `V = IAS_KT * KT_TO_MS`
- `q = 0.5 * ρ * V²`
- `L = q * S * CL`, `D = q * S * CD`
- `CL/CD` desde polar tabular + `flaps_deltas`

---

## 2.6 — `src/domain/flight-state/*` completo

### `params.ts`

```ts
import type { FlapsDeg, FlightParams } from "../types";
import { getRegimeById } from "../../data/regimes/es";

/** Estado de vuelo por defecto = baseline crucero (FDP / no-regresión). */
export const DEFAULT_FLIGHT_PARAMS: FlightParams = {
  alphaDeg: getRegimeById("cruise").alphaDeg,
  iasKt: 100,
  flapsDeg: 0,
  paused: false,
};

export function clampAlpha(alphaDeg: number): number {
  return Math.min(20, Math.max(-6, alphaDeg));
}

export function clampIas(iasKt: number): number {
  return Math.min(180, Math.max(40, iasKt));
}

export function isFlapsDeg(value: number): value is FlapsDeg {
  return value === 0 || value === 15 || value === 30;
}

export function createCruiseParams(): FlightParams {
  return { ...DEFAULT_FLIGHT_PARAMS };
}

export function createClimbParams(): FlightParams {
  return {
    ...DEFAULT_FLIGHT_PARAMS,
    alphaDeg: getRegimeById("climb").alphaDeg,
  };
}

export function createStallDemoParams(): FlightParams {
  return {
    ...DEFAULT_FLIGHT_PARAMS,
    alphaDeg: getRegimeById("stall").alphaDeg,
  };
}
```

### `index.ts` (Zustand)

```ts
import { create } from "zustand";
import type { AppView, FlapsDeg, FlightParams } from "../types";
import {
  clampAlpha,
  clampIas,
  createClimbParams,
  createCruiseParams,
  createStallDemoParams,
  DEFAULT_FLIGHT_PARAMS,
  isFlapsDeg,
} from "./params";

export interface FlightStoreState extends FlightParams {
  view: AppView;
  vectorsOn: boolean;
  smokeOn: boolean;
  setAlpha: (alphaDeg: number) => void;
  setIas: (iasKt: number) => void;
  setFlaps: (flapsDeg: FlapsDeg) => void;
  setPaused: (paused: boolean) => void;
  setView: (view: AppView) => void;
  setVectorsOn: (on: boolean) => void;
  setSmokeOn: (on: boolean) => void;
  resetToCruise: () => void;
  applyPresetCruise: () => void;
  applyPresetClimb: () => void;
  applyPresetStallDemo: () => void;
}

export const useFlightStore = create<FlightStoreState>((set) => ({
  ...DEFAULT_FLIGHT_PARAMS,
  view: "tunnel",
  vectorsOn: true,
  smokeOn: true,
  setAlpha: (alphaDeg) => set({ alphaDeg: clampAlpha(alphaDeg) }),
  setIas: (iasKt) => set({ iasKt: clampIas(iasKt) }),
  setFlaps: (flapsDeg) => {
    if (!isFlapsDeg(flapsDeg)) return;
    set({ flapsDeg });
  },
  setPaused: (paused) => set({ paused }),
  setView: (view) => set({ view }),
  setVectorsOn: (vectorsOn) => set({ vectorsOn }),
  setSmokeOn: (smokeOn) => set({ smokeOn }),
  resetToCruise: () => set({ ...createCruiseParams() }),
  applyPresetCruise: () => set({ ...createCruiseParams() }),
  applyPresetClimb: () => set({ ...createClimbParams() }),
  applyPresetStallDemo: () => set({ ...createStallDemoParams() }),
}));

export * from "./params";
```

---

## 2.7 — `src/domain/units/*` completo

```ts
/** Conversiones de unidades documentadas (HRU — no son hardcoding de negocio). */

export const KT_TO_MS = 0.514444;
export const N_TO_LBF = 0.224809;

export function knotsToMetersPerSecond(knots: number): number {
  return knots * KT_TO_MS;
}

export function newtonsToPoundsForce(newtons: number): number {
  return newtons * N_TO_LBF;
}

export function dynamicPressurePa(densityKgM3: number, speedMs: number): number {
  return 0.5 * densityKgM3 * speedMs * speedMs;
}
```

---

## 2.8 — Diagrama de trazabilidad (texto)

```
[UI Controls / Presets]  useFlightStore (Zustand)
        │  alphaDeg, iasKt, flapsDeg, paused, view, vectorsOn, smokeOn
        ▼
[FlightParams] ──────────────┐
                             ▼
                    computeAero(params, airfoil)
                             │
              ┌──────────────┼────────────────┐
              ▼              ▼                ▼
     naca2412.json    interpolatePolar   resolveFlapsDelta
     (polar, S, ρ,    (CL, CD base)      (clAdd, cdAdd, αcrit shift)
      α_crítico)
              └──────────────┬────────────────┘
                             ▼
                    q = ½ ρ V² ; L=q·S·CL ; D=q·S·CD
                             ▼
                       AeroResult + FlowStatus
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   Shell telemetría    (Fase4+) Tunnel     (Fase6+) Manual
   COPY_ES.flowStatus   vectors/smoke      theory numbers
```

Shell actual (`src/app/App.tsx`): `aero = computeAero(...)`; render `aero.liftN/dragN/cl/cd/lOverD/status` + `COPY_ES.*` — **cero polar en JSX**.

---

## 2.9 / 2.10 / 2.11 — Tests (completos en repo)

- `tests/unit/aero-engine.test.ts` — baseline + stall + near_stall + flaps 30° vs 0°
- `tests/unit/aero-engine-polar.test.ts` — edges polar + flaps 15 fallback
- `tests/unit/flight-state.test.ts` — default/presets/clamps
- `tests/unit/flight-store.test.ts` — pause, presets, reset, flaps 0/15/30
- `tests/unit/units.test.ts` — KT y N

*(Contenidos íntegros en esos paths; no truncados.)*

Transparencia: el ítem 2.10 del auditor pedía pause en `flight-state.test.ts`; pause está en **`flight-store.test.ts`** (mismo dominio). Flaps 15° cubierto en polar helpers + store; flaps 0°/30° en aero-engine baseline/comparación.

---

## 2.12 — Baseline dentro de tolerancias (dump verbatim)

Comando: `pnpm exec vite-node tests/dump-baseline.mts`

```
=== BASELINE FORENSIC DUMP (α=4°, IAS=100KT, flaps=0°) ===
Lift_N	actual=2390.4361672239097	expected=2389	delta=0.0006011583189241131	tol=0.015 (rel)	PASS=true
Drag_N	actual=153.4160525233255	expected=154	delta=-0.0037918667316525693	tol=0.03 (rel)	PASS=true
CL	actual=0.67	expected=0.67	delta=0	tol=0.01 (abs)	PASS=true
CD	actual=0.043	expected=0.043	delta=0	tol=0.002 (abs)	PASS=true
L_over_D	actual=15.581395348837214	expected=15.5	delta=0.0052513128282073475	tol=0.02 (rel)	PASS=true
alpha_crit_deg	actual=15.5	expected=15.5	delta=0	tol=0.2 (abs)	PASS=true
status=stable	profile=NACA2412-mod	version=1.0.0
```

| Magnitud | Actual | Esperado | Delta | Tol | PASS |
|----------|--------|----------|-------|-----|------|
| Lift | 2390.44 N | 2389 N | +0.060% | ±1.5% | ✅ |
| Drag | 153.42 N | 154 N | −0.379% | ±3% | ✅ |
| CL | 0.67 | 0.67 | 0 | ±0.01 | ✅ |
| CD | 0.043 | 0.043 | 0 | ±0.002 | ✅ |
| L/D | 15.581 | 15.5 | +0.525% | ±2% | ✅ |
| α crítico | 15.5° | 15.5° | 0 | ±0.2° | ✅ |

---

## 2.13 — Disclaimer versionado + render

- **Dato:** `COPY_ES.disclaimer` en `src/data/copy/es.ts` (citado en §2.3).
- **Render:** `src/app/App.tsx` footer:

```tsx
<footer className="shell__footer">
  <p>{COPY_ES.disclaimer}</p>
</footer>
```

Texto: *"Modelo didáctico 2D. No representa el performance de una aeronave certificada ni sustituye un túnel de viento físico o un FTD."*

---

## Declaración de integridad del implementador

- Artefactos anteriores corresponden al workspace `C:\CAP` en la corrida documentada.
- No se omitieron archivos de dominio de Fases 1–2.
- No hay `eslint-disable` en `src/domain/{aero-engine,flight-state,units}`.
- Se solicita a Qwen: **liberación de Fase 3** o hallazgos concretos con path+regla.
