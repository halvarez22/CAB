# Addendum APO v1.1 — Cierre de condiciones Qwen

**Documento padre:** `docs/APO-PLAN.md` (v1.0)  
**Motivo:** Informe de auditoría forense Qwen (2026-09-30) — APROBACIÓN CONDICIONAL  
**Estado:** ✅ Aprobado (humano implícito vía avance + Qwen definitiva 2026-09-30)  
**Fecha:** 2026-09-29  

> Hallazgos H1–H6 cerrados. Qwen autorizó **Fase 1 (scaffold)** y **Fase 2 (motor + unit tests)**.

---

## H1 — Decisión de polar: **(A) cerrada**

**Decisión:** Calibrar `naca2412` para reproducir el baseline del prototipo Gemini (no inventar polar pedagógica paralela).

| Campo | Valor |
|-------|--------|
| Perfil | `NACA2412-mod` |
| Estrategia | Calibración sobre telemetría observada del share Gemini |
| Fuente documentada en JSON | `source: "calibración sobre prototipo Gemini share 0dd7f089300a · 2026-09"` |
| Versión inicial | `1.0.0` (semver en campo `version` del JSON) |

Cualquier recalibración posterior = bump de `version` + actualización de tests + nueva nota APO (no hotfix silencioso).

---

## H3 — Tolerancias numéricas (baseline de no-regresión)

Condición de referencia: **α = +4.0° · IAS = 100 KT · flaps = 0°**

| Magnitud | Valor objetivo | Tolerancia de test |
|----------|----------------|--------------------|
| Lift | 2389 N | ±1.5% |
| Drag | 154 N | ±3% |
| CL | 0.67 | ±0.01 |
| CD | 0.043 | ±0.002 |
| L/D | 15.5 | ±2% |
| α_crítico | 15.5° | ±0.2° |

Prohibido usar `~` en aserciones. Los valores viven en `tests/fixtures/baseline-cruise.json` (golden master) y se leen desde tests — no hardcode disperso (HRU).

---

## H2 — Stack cerrado

| Decisión | Elección | Justificación |
|----------|----------|----------------|
| UI | React 18+ + TypeScript + Vite | Ya propuesto; se confirma |
| Estado | **Zustand** | Un store trazable; ciclo de vida APO claro |
| Render túnel | **Canvas 2D** | Rendimiento para partículas de humo |
| Package manager | **pnpm** | Workspaces futuros (más perfiles) |
| Tests | Vitest + Testing Library | Unit/integration |
| E2E smoke | Playwright | Crucero → stall → reset |
| Lint anti-God | ESLint `max-lines` (archivo **800**) | Enforcement AAD |

---

## H4 — Especificación `naca2412.json`

Ruta: `src/data/airfoils/naca2412.json`

Metadatos **obligatorios**:

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
  "units_note": "polar adimensional; fuerzas en N vía aero-engine + units",
  "polar": [],
  "flaps_deltas": {}
}
```

- `polar` / `flaps_deltas`: se rellenan en **Fase 2** (motor), no en scaffold.
- Invalidación: cambio de archivo + bump `version` → CI re-ejecuta unit del motor; no hay cache runtime de polar en v1 (import estático).

Golden master visual/numérico: `tests/fixtures/` (screenshot refs + `baseline-cruise.json`) para no depender del share Gemini vivo.

---

## H5 — Glosario / regímenes versionados (U-First + HRU)

Módulo obligatorio: `src/data/regimes/es.ts` (o `.json` + tipos).

Debe exponer, como **dato** (no string en JSX):

| id | label | α típico | Nota UI |
|----|-------|----------|---------|
| `dive` | Picado | −6° | Régimen de referencia en slider |
| `cruise` | Crucero | +4° | Preset + baseline |
| `climb` | Ascenso | +12° | Régimen de referencia |
| `stall` | Pérdida | ≥ α_crítico | Copy + acción de recuperación |

También en `src/data/copy/es.ts`: labels de controles (IAS, flaps limpio/despegue/aterrizaje), estados `FlowStatus`, disclaimer didáctico.

UI solo importa keys/`t()` desde copy/regimes.

---

## H6 — Checklist Qwen

**Corrección al informe:** el archivo `docs/QWEN-AUDIT-CHECKLIST.md` **ya existe** (Fase 0 docs).  
Se refuerza en este addendum:

- La checklist es la **fuente de auditoría** por entrega/fase.
- Qwen puede ampliarla; no la inventa el implementador al final.
- Pre-código (Fase 0): ítems de este addendum deben figurar como cerrados antes de Fase 1.

---

## Mejoras Qwen adoptadas en v1.1 (no bloqueantes → ahora normativas)

| Mejora | Decisión v1.1 |
|--------|----------------|
| CI merge gate | GitHub Actions: `lint → unit → build → e2e` (añadir en Fase 1 scaffold) |
| Cobertura | ≥90% `aero-engine` + `flight-state`; ≥70% global (`vitest coverageThreshold`) |
| Anti-God-Object | ESLint `max-lines: 800` (error) |
| Golden master | `tests/fixtures/` con baseline numérico (+ screenshots cuando exista UI) |
| Plan de clase | Entregable **v1.1 de producto / doc**, **fuera del MVP de código** (no bloquea Fases 1–7) |

Scope v2+ permanece congelado: perfiles extra, IA MCP runtime, 3D — requieren **nuevo APO**.

---

## Criterio “smoke E2E” (SQA cerrado)

Smoke = un único flujo Playwright:

1. Carga app  
2. Preset Crucero (o estado inicial = baseline)  
3. Subir α a stall → assert `FlowStatus === stall` + UI de recuperación visible  
4. Reset → assert retorno a régimen crucero / baseline  

Sin ese flujo verde, no hay “listo” de fase UI.

---

## Gancho MCP (documentado, sin implementar en v1)

Archivo previsto (stub doc only en v1): `docs/MCP-HOOK.md`

Contrato futuro:
- Input al LLM = JSON `AeroResult` + `FlightParams` (nunca polar cruda inventada por el modelo)
- System prompt delimitado (instructor aerodinámica básica)
- Output schema: `titulo`, `explicacion`, `alerta_seguridad`, `siguiente_paso`
- Keys solo server-side

En v1: **solo documentación**; cero cliente IA.

---

## Impacto en fases

| Fase | Cambio vs APO v1.0 |
|------|---------------------|
| 0 | Este addendum + checklist + confirmaciones |
| 1 | Scaffold con pnpm, ESLint max-lines, CI skeleton, Vitest coverage config |
| 2 | Polar calibrada (A) + fixtures + tolerancias H3 |
| 3+ | Sin cambios de secuencia; regimes/copy desde datos |

Sigue prohibido saltar a UI antes de motor testeado (Fase 2).

---

## Decisión solicitada

### Humano (usuario)
- [ ] **Acepto Addendum v1.1** (cierra H1–H6 + mejoras adoptadas)
- [ ] Acepto con cambios: ________

### Qwen (auditor)
- [ ] **Aprobación definitiva** del APO v1.0 + Addendum v1.1 → liberar Fase 1
- [ ] Rechazo / nuevas condiciones: ________

Sin ambos checks en afirmativo → **no se inicia código de producto**.
