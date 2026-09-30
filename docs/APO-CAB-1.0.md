# Plan APO — Paridad CAB (cliente HTML → AEROLAB modular)

**Documento padre:** `docs/APO-PLAN.md` (MVP v1.0 cerrado) + `docs/APO-AUDIO-1.1.md` (Audio On cerrado)  
**Tipo:** Addendum de producto v1.2 — paridad funcional con entrega cliente  
**Versión:** APO-CAB-1.0  
**Fecha:** 2026-09-29  
**Estado:** ✅ **CIERRE TOTAL** — C-A1…C-A6 aprobados por Qwen (2026-09-30). Código listo para producción. GitHub/Vercel retenidos por mandato humano.  
**Fuente de paridad:** `C:\CAP\nueva version\aerolab_simulador_did_ctico_de_aerodin_mica.html`  
**Reglas:** `.cursor/rules/00`–`05` (incluye **FDP regla 8**)

> Condiciones forenses vinculantes: flaps solo 0/10/20/30 (purgar 15°); horn solo vía pipeline Audio On; manual en data/; crítico UI = `aero.criticalAlphaDeg`.

> Objetivo: que AEROLAB modular ofrezca **al menos las mismas funcionalidades pedagógicas/UI** que la última versión HTML del cliente (marca CAB), **sin** degradar arquitectura, tests ni aislamiento audio↔física.

---

## 1. Diagnóstico técnico

### 1.1 Situación
| Línea | Qué es |
|-------|--------|
| **CAP (nuestro)** | React+TS+Vite+Zustand; polar JSON; motor testeado; `near_stall`; presets; Audio On A-1…A-6 cerrado |
| **Cliente “nueva version”** | HTML monolítico CAB; branding institucional; flaps 0/10/20/30; lbs; manual P1/P2/TCP/CRM; horn stall sintético |

### 1.2 Delta de producto (gap → CAP)

| ID | Capacidad cliente | CAP hoy | Acción APO |
|----|-------------------|---------|------------|
| G1 | Logo + marca Colegio Aeronáutico del Bajío (CAB) | Título genérico AEROLAB | **Incluir logo SVG + copy institucional** |
| G2 | Subtítulo “Pilotos y Sobrecargos” / laboratorio | Copy genérico | Actualizar `COPY_ES` |
| G3 | Manual DOC-CAB-AERO-01: P1, P2, TCP, CRM (+ windshear) | Manual corto + números motor | Ampliar theory copy **versionado**; conservar números del motor |
| G4 | Flaps **0 / 10 / 20 / 30** + descripciones | Flaps **0 / 15 / 30** | Ampliar dominio `FlapsDeg` + polar `flaps_deltas` |
| G5 | Telemetría **N + lbs** | Solo N en UI (`liftLbf`/`dragLbf` ya existen en `AeroResult`) | Mostrar lbs vía `units` / copy |
| G6 | α crítico **efectivo con flaps** visible en curva | Crítico base del JSON en chart; motor ya calcula `criticalAlphaDeg` | Chart/telemetría usan **mismo** `aero.criticalAlphaDeg` (FDP) |
| G7 | Alarma stall tipo horn (oscilador) | Ambient + one-shots (buffers silenciosos) | Añadir cue **stall_horn** (síntesis o manifiesto) sin romper H-A1 |
| G8 | Badge “Régimen / PÉRDIDA” + alerta CAB | StatusBar + banner stall | Copy/badge alineados CAB (U-First) |
| G9 | Skin navy/gold CAB (opcional visual) | Tema dark propio | Tokens CSS CAB **sin** reescribir física |

### 1.3 Lo que CAP ya supera al cliente (no regresar)
- `near_stall` intermedio  
- Presets instructor (Crucero / Ascenso / Demostrar pérdida)  
- Polar versionada + tests + CI  
- Audio On gobernado (decide / runtime / mute theory-pause)  
- AAD modular  

**Prohibido:** reemplazar el motor por las fórmulas hardcodeadas del HTML (`CL = 0.28 + 0.108·α`, etc.).

### 1.4 Ciclo de vida (trazabilidad APO)

```
COPY_ES / brand / manual CAB     ← datos (HRU)
flaps_deltas (10/20/30)          ← data/airfoils (FDP)
        ↓
FlightStore (flapsDeg ampliado)
        ↓
computeAero → AeroResult (N, lbf, criticalAlphaDeg, status)
        ↓
┌──────────┬───────────┬────────────┬──────────────┐
Header CAB Tunnel/UI  Telemetry+lbs Theory P1–CRM  Audio(+horn)
```

---

## 2. Alcance

### 2.1 Dentro de alcance (CAB-MVP)

| ID | Entrega |
|----|---------|
| C1 | Asset logo CAB (`src/assets/brand/cab-logo.svg` o equivalente) + componente `CabBrand` en header |
| C2 | Copy institucional CAB en `COPY_ES` (títulos, badge, tabs “Túnel Virtual” / “Manual CAB” opc. alias) |
| C3 | Manual teórico ampliado: secciones P1, P2, TCP, CRM desde `data/` (no JSX hardcode largo) |
| C4 | `FlapsDeg = 0 \| 10 \| 20 \| 30` + deltas en `naca2412.json` + tests motor |
| C5 | UI flaps con descriptionKey → `COPY_ES.flapDescriptions` |
| C6 | Telemetría: N + lbs (`newtonsToPoundsForce` / campos `liftLbf`/`dragLbf`) |
| C7 | Curva CL–α: marcador de α crítico = `aero.criticalAlphaDeg` (efectivo con flaps) |
| C8 | Stall horn pedagógico: integración vía `audio-engine`/`audio-runtime` (one-shot o loop corto en stall) + copy “Alarma” |
| C9 | Tests: store flaps, telemetría lbs, theory sections, no-regresión baseline crucero flaps=0 |
| C10 | Evidencia forense chat + checklist Qwen |

### 2.2 Fuera de alcance
- Portar el HTML monolítico ni Tailwind CDN  
- Pixel-perfect CRT / animaciones no pedagógicas  
- Cambiar polar base (puntos CL/CD) salvo **deltas de flaps** nuevos  
- Reabrir Audio On A-1…A-3 (solo extensión de cues)  
- GitHub/Vercel (fase posterior, tras OK de este APO)  
- IA/MCP  

### 2.3 Decisiones cerradas (evitar branching)

| Tema | Decisión APO-CAB-1.0 |
|------|----------------------|
| Flaps | **Adoptar 0 / 10 / 20 / 30** (paridad cliente). Retirar 15° del contrato. Preset “despegue” conceptual → **10°**. |
| Polar flaps | Nuevos `flaps_deltas` calibrados **sin** romper fixture crucero flaps=0. Valores iniciales propuestos (ajustables en addendum si Qwen exige): ver §5. |
| Logo | SVG vectorial del cliente (recreación del emblema) versionado en repo; **no** hotlink externo. |
| lbs | Solo presentación UI; conversión en `units` (ya `N_TO_LBF`). |
| Horn | Preferencia: síntesis Web Audio en runtime **o** cue manifiesto; debe pasar por `decideAudio` / status `stall`, silenciarse en pause/theory/user_off (mismas reglas Audio On). |
| near_stall | **Se conserva** (no bajar a binario cliente). |
| Presets | **Se conservan**; actualizar labels flaps si aplica. |

---

## 3. Arquitectura AAD (módulos a tocar)

```
src/assets/brand/cab-logo.svg          # NUEVO
src/ui/brand/CabBrand.tsx              # NUEVO — logo + títulos
src/data/copy/es.ts                    # brand + flapDescriptions + theory P1–CRM
src/data/theory/cab-manual.ts          # NUEVO — secciones versionadas (opcional si cabe en copy)
src/data/airfoils/naca2412.json        # flaps_deltas 10/20/30; bump version minor
src/domain/types.ts                    # FlapsDeg
src/domain/flight-state/params.ts      # isFlapsDeg
src/ui/controls/InstructorPresets.tsx  # botones flaps
src/ui/telemetry/TelemetryStrip.tsx    # N + lbs
src/ui/charts/LiftCurveChart.tsx       # critical desde aero
src/ui/theory/TheoryManual.tsx         # render secciones CAB
src/domain/audio-engine/*              # cue stall_horn (extensión menor)
src/domain/audio-runtime/*             # play horn (sin magic FADE)
src/data/audio/manifest.ts             # si cue file/synth id
src/app/App.tsx / styles.css           # header brand + tokens CAB
tests/**                               # regresión + nuevos casos
```

**App** solo orquesta; sin God-Object.

---

## 4. Impacto en física (FDP) — flaps

### 4.1 Contrato
- Crucero flaps=0: **mismas** tolerancias baseline existentes (cero regresión).  
- Con flaps ≠ 0: CL/CD/αcrit vía `flaps_deltas` en JSON (HRU), no fórmulas del HTML cliente.

### 4.2 Propuesta inicial de deltas (datos — no JSX)

```json
"flaps_deltas": {
  "0":  { "clAdd": 0,    "cdAdd": 0,     "criticalAlphaShiftDeg": 0 },
  "10": { "clAdd": 0.22, "cdAdd": 0.015, "criticalAlphaShiftDeg": -0.6 },
  "20": { "clAdd": 0.40, "cdAdd": 0.035, "criticalAlphaShiftDeg": -1.2 },
  "30": { "clAdd": 0.55, "cdAdd": 0.055, "criticalAlphaShiftDeg": -1.5 }
}
```

> Los valores 10°/20° son **propuestos** para abrir implementación; Qwen/humano pueden exigir recalibración. El de 30° reutiliza el delta ya validado en MVP.

### 4.3 Migración 15° → 10°/20°
- Actualizar tests que usen `flapsDeg: 15`.  
- Copy: “10° (Despegue)”, “20° (Aproximación)”, “30° (Aterrizaje)”.

---

## 5. Audio — extensión horn (sin romper A-6)

| Regla | Cumplimiento |
|-------|----------------|
| H-A1 | Horn solo tras Audio ON + gesture; no `resume` fuera del toggle |
| H-A2 | Sin one-shot falso al volver de Manual |
| H-A3 | Constantes de fade siguen en `constants.ts` |
| FDP | Horn gatillado por `status === "stall"` (o one-shot `enter_stall` enriquecido), **nunca** por α hardcode |

**Opción preferida APO:** ampliar `enter_stall` / ambient stall con síntesis horn en runtime **o** nuevo `OneShotCueId: "stall_horn"` periódico mientras `stall` — detalle de implementación en fase C-A3 tras OK.

---

## 6. Fases de implementación (post-aprobación)

| Fase | Contenido | Gate |
|------|-----------|------|
| **C-A1** | Brand: SVG logo + `CabBrand` + COPY institucional + tokens CSS mínimos | Visual header CAB; lint/build |
| **C-A2** | Flaps 0/10/20/30 + polar deltas + tests motor + UI + descriptions | Baseline flaps=0 verde; SQA flaps |
| **C-A3** | Telemetría lbs + crítico efectivo en curva | FDP UI = motor |
| **C-A4** | Manual P1/P2/TCP/CRM desde data + TheoryManual | U-First / HRU |
| **C-A5** | Stall horn + copy alarma (extensión audio) | Grep física en audio = 0; H-A1 |
| **C-A6** | Evidencia forense + checklist Qwen + cierre | Aprobación Qwen |

Orden obligatorio: **C-A1 → C-A2 → …** (logo primero, como pidió el usuario; flaps es el cambio de dominio más sensible).

---

## 7. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Regresión crucero al tocar flaps_deltas | Tests baseline flaps=0 inmutables; no tocar polar base |
| God-file TheoryManual | Contenido en `data/theory` o `COPY_ES.theory.sections` |
| Logo como magia en JSX | Asset + componente brand; copy en `COPY_ES.brand` |
| Horn incumple autoplay | Reusar path Audio On aprobado |
| Scope creep visual CRT | Explicitamente fuera; solo tokens color/header |

---

## 8. Criterios de aceptación (puerta de cierre CAB)

1. Header muestra **logo CAB** + nombre institucional legible (brand test: sin nav, se reconoce CAB).  
2. Flaps seleccionables **0 / 10 / 20 / 30** con copy pedagógico.  
3. Telemetría Lift/Drag en **N y lbs**.  
4. Manual incluye **cuatro** módulos P1, P2, TCP, CRM; números de ops siguen del motor.  
5. α crítico mostrado = `aero.criticalAlphaDeg` (cambia con flaps).  
6. Con Audio ON y stall: feedback sonoro tipo alarma (horn o cue equivalente).  
7. `pnpm test` / `lint` / `build` EXIT:0; baseline crucero sin regresión.  
8. Grep: sin `15.5` / polar mágica en UI; audio sin `computeAero`/`naca2412`.

---

## 9. Checklist Qwen (pre-código + post)

### Pre-código
- [x] Humano aprueba APO-CAB-1.0 (o lista cambios)  
- [x] Qwen aprueba o condiciona (esp. §4.2 deltas flaps y §5 horn)  
- [x] Sin código de C-A* hasta doble OK (o humano + mandato explícito)

### Post C-A6
- [x] Artefactos brand + theory data  
- [x] Diff polar + FlapsDeg  
- [x] Tests verbatim (75/75)  
- [x] Grep forense audio/UI + flaps 15° ausente en contrato  
- [x] **Veredicto definitivo Qwen de cierre CAB** — 2026-09-30  

---

## 10. Decisión solicitada

### Humano
- [x] **Acepto APO-CAB-1.0** → liberar **solo C-A1** (logo + brand) primero  
- [x] Secuencia C-A1…C-A5 tras cada gate Qwen  
- [x] Flaps **0/10/20/30** (15° purgado del contrato)

### Qwen
- [x] Aprobación definitiva fases C-A1…C-A5  
- [x] **Aprobación definitiva cierre C-A6 / APO-CAB-1.0** — 2026-09-30  
- [ ] Aprobación condicional (listar H-*)  
- [ ] Rechazo  

---

## 11. Nota de despliegue

GitHub + Vercel **autorizados por Qwen** tras C-A6, pero **retenidos por mandato humano** (2026-09-30). Hoy `c:\CAP` aún **no** tiene `.git`. Siguiente incremento propuesto: `docs/APO-GLASS-1.0.md`.
