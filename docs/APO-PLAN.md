# Plan APO — AEROLAB Túnel de Viento Didáctico

**Estado:** ✅ MVP v1.0 COMPLETADO — Auditoría Qwen cerrada (Fases 1–5, 2026-09-30)  
**Versión:** 1.0 (+ Addendum **v1.1**)  
**Fecha:** 2026-09-29  
**Auditoría externa:** Qwen — aprobación definitiva e incondicional del MVP  
**Reglas:** `.cursor/rules/00`–`05` (incluye **FDP regla 8**)

> Fases 1–5 cumplidas. Cualquier v2+ requiere nuevo APO / addendum (per auditor).

---

## 1. Diagnóstico técnico

### 1.1 Problema / oportunidad
Existe un prototipo compartido en Gemini Canvas (AEROLAB) que demuestra:
- Perfil NACA 2412 modificado
- Controles α, IAS, flaps
- Vectores L/D/R, humo, curva CL–α, telemetría, estado de flujo
- Vistas Túnel / Manual teórico

Ese prototipo **no** es aún un repo gobernado por reglas HRU/AAD/SQA/FDP. El objetivo es **reconstruirlo como producto educativo versionado** en este workspace, auditable por Qwen.

### 1.2 Ciclo de vida objetivo (trazabilidad)
```
UI Controls / Presets
        ↓
  FlightState (α, IAS, flaps, paused, view)
        ↓
  aero-engine + airfoil data  →  AeroResult + FlowStatus
        ↓
   ┌────┴────┬──────────┬────────────┐
Tunnel/Humo  Vectors   CL–α chart   Telemetry / Manual / (IA opcional)
```

Todo cambio futuro debe poder responder: *quién llama al motor, con qué params, qué vistas se invalidan*.

### 1.3 Riesgos si se codea sin plan
- Hardcoding de polar/crítico en JSX → ruptura FDP
- God-component Canvas → imposible de auditar
- UI “bonita” con estado inconsistente (seguro + stall)
- Sin tests de regresión del punto crucero documentado

---

## 2. Alcance

### 2.1 Dentro de alcance (MVP v1)
| ID | Entrega |
|----|---------|
| M1 | Scaffold TypeScript + Vite/React (o stack aprobado) + ESLint + Vitest |
| M2 | `data/airfoils/naca2412` + `aero-engine` puro + tests unitarios |
| M3 | `flight-state` (α, IAS, flaps, pause, reset, presets) |
| M4 | UI Túnel: perfil, humo, vectores, toggles |
| M5 | Curva CL–α + telemetría + FlowStatus visual |
| M6 | Manual teórico estático versionado (misma fuente de números) |
| M7 | Smoke E2E mínimo + disclaimer didáctico |
| M8 | Docs: este APO + checklist Qwen actualizado post-implementación |

### 2.2 Fuera de alcance (v1)
- Backend / auth / multi-usuario
- Tutor LLM en producción (solo **gancho MCP** documentado)
- CFD real, 3D, estabilidad longitudinal, aeronave completa
- App nativa móvil
- Paridad pixel-perfect con el share de Gemini (paridad **funcional + pedagógica**)

### 2.3 Diferido (v2+)
- Proxy IA + MCP completo
- Más perfiles NACA seleccionables
- Modo instructor con guion de clase 30–45 min embebido
- i18n EN

---

## 3. Stack propuesto

| Capa | Propuesta | Nota |
|------|-----------|------|
| UI | React 18+ + TypeScript + Vite | Componentes por dominio UI |
| Estilos | CSS modules o CSS variables propias | Evitar themes genéricos “AI slop”; look cockpit/educativo |
| Estado | Store ligero (Zustand o Context+reducer) | Un solo `FlightState` |
| Canvas | Canvas 2D o SVG | `flow-visual` + `vector-layer` separados |
| Tests | Vitest (+ Testing Library) | Motor primero |
| E2E | Playwright (smoke) | Carga / crucero / stall / reset |
| Package manager | pnpm o npm | Definir en scaffold |

*Si el usuario prefiere otro stack (Next, Vue, etc.), se actualiza este APO antes de codear.*

---

## 4. Módulos y archivos previstos (AAD)

```
src/domain/flight-state/
src/domain/aero-engine/
src/domain/units/
src/data/airfoils/naca2412.json
src/data/copy/es.ts
src/ui/tunnel/
src/ui/vectors/
src/ui/controls/
src/ui/charts/
src/ui/telemetry/
src/ui/theory/
src/app/
tests/unit/aero-engine.test.ts
tests/integration/flight-loop.test.ts
tests/e2e/smoke.spec.ts
```

**Regla:** ningún archivo de orquestación calcula fuerzas; ningún archivo de UI posee polar hardcodeada.

---

## 5. Modelo didáctico (FDP)

### 5.1 Punto de referencia de no-regresión (baseline Gemini observado)
Condición: `α = +4.0°`, `IAS = 100 KT`, `flaps = 0°`

Valores de referencia *orientativos del prototipo* (a calibrar en datos versionados + tolerancia de test):

| Magnitud | Referencia prototipo |
|----------|----------------------|
| Lift | ~2389 N |
| Drag | ~154 N |
| CL / CD | ~0.67 / 0.043 |
| L/D | ~15.5 |
| α crítico | ~15.5–15.6° |

**Decisión APO (cerrada en Addendum v1.1):** **(A) calibración documentada** al baseline Gemini. Tolerancias, metadatos JSON y fixtures: ver `docs/APO-ADDENDUM-v1.1.md` (H1, H3, H4). La opción (B) queda descartada para v1.

### 5.2 FlowStatus
- `stable` — por debajo de margen near-stall
- `near_stall` — acercándose al crítico
- `stall` — α ≥ crítico (o post-pico CL)

UI y copy deben mapear 1:1 a este enum (FDP).

### 5.3 Disclaimer obligatorio
Manual + footer: modelo didáctico 2D; no representa performance de aeronave certificada.

---

## 6. Plan de implementación por fases

| Fase | Trabajo | Criterio de salida | Tests |
|------|---------|--------------------|-------|
| 0 | Aprobación de este APO + confirmación de stack | OK usuario | — |
| 1 | Scaffold + rules ya aplicadas | `dev` / `test` corren vacíos | smoke CI local |
| 2 | `units` + `aero-engine` + polar + unit tests | Baseline α=4° dentro de tolerancia | unit |
| 3 | `flight-state` + controles headless | presets/reset | unit/integration |
| 4 | UI Túnel + vectores + humo | demo visual estable | manual + integration |
| 5 | Curva + telemetría + status | coherencia visual-física | integration |
| 6 | Manual teórico + disclaimer | números = motor | integration copy |
| 7 | E2E smoke + checklist Qwen | “listo para auditoría” | e2e |

**Prohibido:** saltar a UI completa antes de fase 2 (motor testeado).

---

## 7. Riesgos de regresión y mitigación

| Riesgo | Mitigación |
|--------|------------|
| UI desincronizada del motor | Un solo store; vistas solo leen `AeroResult` |
| Stall mal etiquetado | Enum `FlowStatus` + tests de frontera |
| Archivo monstruo Canvas | Split tunnel/vectors/flow desde el día 1 |
| Keys IA en cliente | SSD: sin IA en v1; gancho documentado |
| “Fix rápido” de polar | APO + bump de versión de data + tests |

---

## 8. Criterios de aceptación (MVP)

1. Controles α, IAS, flaps actualizan telemetría y curva en vivo.
2. Vectores L/D/R y humo conmutables; pause/reset funcionan.
3. α ≥ crítico ⇒ estado pérdida visible + acción de recuperación.
4. Preset “Crucero” restaura condición de referencia.
5. Manual teórico no muestra números distintos al motor.
6. Suite unit del motor verde; smoke E2E verde.
7. Checklist Qwen auto-completada por el agente implementador (pendiente revisión humana/Qwen).
8. Ningún secreto en repo; disclaimer visible.

---

## 9. Plan de clase (producto pedagógico — paralelo a build)

Sesión 30–45 min (contenido a versionar en Manual v1):
1. Crucero limpio — leer L/D  
2. Subir α — seguir punto en curva  
3. Cruzar crítico — observar stall  
4. Reset + flaps aterrizaje a baja IAS — discutir trade-off  
5. Cierre: qué es modelo didáctico vs avión real  

*(Detalle de guion se puede ampliar post-aprobación sin bloquear fases 1–2.)*

---

## 10. Handoff a Qwen

Tras cada fase ≥2, el implementador marca ítems en `docs/QWEN-AUDIT-CHECKLIST.md`.  
Qwen debe verificar especialmente:
- Cumplimiento APO (¿hubo plan antes del diff?)
- HRU/FDP (¿hay magia en UI?)
- AAD (¿god files?)
- SQA (¿tests del motor y baseline?)
- SSD (¿secrets?)

---

## 11. Decisión solicitada (actualizado post-Qwen)

1. Revisar y aceptar **`docs/APO-ADDENDUM-v1.1.md`** (cierra H1–H6).  
2. Qwen emite **aprobación definitiva**.  
3. Solo entonces → Fase 1 (scaffold).

Sin addendum aceptado + OK Qwen → **no se implementa código de producto**.
