# Addendum APO-AUDIO-1.1 — Cierre de condiciones Qwen

**Documento padre:** `docs/APO-AUDIO-1.0.md`  
**Motivo:** Informe de auditoría forense Qwen (2026-09-30) — APROBACIÓN CONDICIONAL  
**Estado:** ✅ **CERRADO** — Aprobación definitiva Qwen A-6 (2026-09-30). Ciclo Audio On fusionado con baseline MVP.  
**Versión:** APO-AUDIO-1.0 (+ Addendum **1.1**)  

> A-1…A-6 cerradas. Feature Audio On no requiere más cambios. Siguiente foco: GitHub + Vercel.

---

## H-A1 — `AudioContext` / autoplay (cerrado)

### Decisión normativa

1. El `audio-runtime` expone:
   - `ensureContextResumed(): Promise<"running" | "suspended" | "unavailable">`
   - Invocable **solo** desde el **handler de click** del toggle `AudioToggle` (gesto de usuario).
2. **Prohibido** llamar `ctx.resume()` / `ensureContextResumed()` en:
   - `useEffect` de montaje
   - respuesta a cambios de `FlowStatus`
   - navegación de vistas
   - presets / sliders
3. Flujo del toggle ON:
   ```
   click → ensureContextResumed()
        → si "running": setAudioOn(true) + decideAudio(...)
        → si "suspended" | "unavailable": setAudioOn(false); setAudioBlocked(true)
           → UI muestra COPY_ES.controls.audioBlockedHint
   ```
4. Toggle OFF: `setAudioOn(false)` + `runtime.stopAll()` (sin requerir resume).
5. Estado UI opcional en store o estado local del hook: `audioBlocked: boolean` (no es física; es UX).

### Criterio de aceptación H-A1
- Grep / review: cero `resume(` fuera del path del click del toggle.
- Test: mock de contexto `suspended` tras click → hint visible y `audioOn` permanece false.

---

## H-A2 — Semántica de `prevStatus` vs vista `theory` (cerrado)

### Decisión normativa

**One-shots solo tienen sentido dentro de la vista túnel.**

1. Al entrar a `view === "theory"`:
   - El hook de audio ejecuta silencio (`decideAudio` con theory → gain 0).
   - **`prevStatus` se resetea a `null`** y **no se actualiza** mientras `view === "theory"`.
2. Al volver de `theory` → `tunnel`:
   - La **primera** llamada a `decideAudio` debe forzar `oneShot: "none"` (transición ignorada), aunque `status` sea `stall`.
   - Tras esa decisión, `prevStatus` se establece al `status` actual para flancos futuros **dentro** del túnel.
3. Implementación recomendada (contratos):

```ts
decideAudio(input: {
  audioOn: boolean;
  paused: boolean;
  view: AppView;
  status: FlowStatus;
  prevStatus: FlowStatus | null;
  /** true solo en el primer tick tras theory→tunnel */
  ignoreOneShot: boolean;
}): AudioDecision;
```

- Si `ignoreOneShot === true` → `oneShot` siempre `"none"` (aunque haya flanco stall).
- El hook pone `ignoreOneShot=true` una vez al reentrar al túnel, luego `false`.

### Criterio de aceptación H-A2 (test A-1 obligatorio)
Matriz unitaria incluye:

> *“Volver desde theory con status=stall y prevStatus null / ignoreOneShot → oneShot none; ambient stall solo si audioOn y no paused.”*

Sin este test verde → no se libera A-3.

---

## H-A3 — Crossfade ambient (cerrado)

### Decisión normativa

**Estrategia:** corte secuencial sin solapamiento de dos ambient cues.

1. Al cambiar `ambient` de A → B (B ≠ A, B ≠ none):
   - Fade-out lineal del cue A: **`FADE_OUT_MS = 150`**
   - Al terminar (o en el instante programado), stop A
   - Fade-in lineal del cue B: **`FADE_IN_MS = 300`**
2. Al pasar a `ambient: "none"`: solo fade-out **150 ms** + stop.
3. **Prohibido:**
   - Dos ambient cues con gain > 0 a la vez
   - Crossfade dependiente de `requestAnimationFrame`
   - Tiempos de fade hardcodeados en el runtime
4. Constantes en dominio:

```ts
// src/domain/audio-engine/constants.ts
export const FADE_OUT_MS = 150;
export const FADE_IN_MS = 300;
export const AMBIENT_GAIN_DB = -18;
export const ONESHOT_GAIN_DB = -6;
```

5. Runtime aplica fades con **`AudioParam.linearRampToValueAtTime`** (o equivalente mockeable), leyendo esos ms/dB del engine/constants — no inventar números en UI.

### Criterio de aceptación H-A3
- Test de runtime (mock): secuencia stop A → start B sin overlapping gains > 0.
- Constantes importadas desde `audio-engine/constants.ts`.

---

## Mejoras recomendadas — adopción

| # | Mejora Qwen | Decisión 1.1 |
|---|-------------|--------------|
| 1 | Volumen master como dato de dominio | **Adoptada** → `AMBIENT_GAIN_DB`, `ONESHOT_GAIN_DB` en `constants.ts` |
| 2 | `descriptionKey` → COPY_ES | **Adoptada** → `COPY_ES.audioDescriptions.*` referenciadas por `manifest.ts` |
| 3 | Test “no one-shot al volver de theory” | **Adoptada** → obligatoria en fase A-1 (ver H-A2) |
| 4 | `MockAudioContext` en helpers | **Adoptada** → `tests/helpers/audio-mock.ts` antes/durante A-3 |

### Copy adicional (HRU / U-First)

Añadir a `src/data/copy/es.ts` (en implementación, no ahora):

```ts
controls: {
  // ...
  audioOn: "Audio: ON",
  audioOff: "Audio: OFF",
  audioBlockedHint:
    "El navegador bloqueó el sonido. Vuelve a pulsar Audio tras interactuar con la página.",
},
audioDescriptions: {
  ambient_stable: "Ambiente de flujo estable",
  ambient_near_stall: "Ambiente cerca de la pérdida",
  ambient_stall: "Ambiente de pérdida",
  enter_stall: "Aviso de entrada en pérdida",
  recover_stable: "Aviso de recuperación a vuelo estable",
},
```

---

## Impacto en fases (actualiza APO-AUDIO-1.0 §7)

| Fase | Cambio vs 1.0 |
|------|----------------|
| A-1 | `decideAudio` + `ignoreOneShot` + **test theory→tunnel** + `constants.ts` |
| A-2 | `manifest` con `descriptionKey` → COPY_ES.audioDescriptions |
| A-3 | Runtime con `ensureContextResumed` solo en click; crossfade 150/300; `audio-mock.ts` |
| A-4 | Toggle + `audioBlocked` hint |
| A-5 | Hook respeta prevStatus null en theory + ignoreOneShot al volver |
| A-6 | Evidencia + grep AU.6 |

Sigue prohibido tocar assets “premium” antes de A-1.

---

## Matriz de decisión ampliada (normativa A-1)

Casos mínimos obligatorios en unit tests:

| audioOn | paused | view | status | prev | ignoreOneShot | ambient | oneShot | reason |
|---------|--------|------|--------|------|---------------|---------|---------|--------|
| false | * | * | * | * | * | none | none | user_off |
| true | true | tunnel | stall | stable | false | none | none | paused |
| true | false | theory | stall | null | false | none | none | theory_view |
| true | false | tunnel | stall | stable | false | ambient_stall | enter_stall | status |
| true | false | tunnel | stall | null | **true** | ambient_stall | **none** | status |
| true | false | tunnel | stable | stall | false | ambient_stable | recover_stable | status |
| true | false | tunnel | near_stall | stable | false | ambient_near_stall | none | status |

---

## Evidencia forense adicional (AU.*)

Además de AU.1–AU.6 del plan 1.0:

| # | Artefacto |
|---|-----------|
| AU.7 | `constants.ts` completo (fades + gains dB) |
| AU.8 | Test “theory→tunnel no one-shot” (verbatim pass) |
| AU.9 | Grep: `resume` solo en path del toggle / `ensureContextResumed` |
| AU.10 | `tests/helpers/audio-mock.ts` completo |

---

## Decisión solicitada

### Humano
- [ ] **Acepto APO-AUDIO-1.1** (cierra H-A1/H-A2/H-A3 + mejoras 1–4)
- [ ] Acepto con cambios: ________

### Qwen
- [ ] **Aprobación definitiva** APO-AUDIO-1.0 + 1.1 → liberar **solo A-1**
- [ ] Rechazo / nuevas condiciones: ________

Sin ambos en afirmativo (o al menos humano + Qwen según proceso del proyecto) → **no se inicia código de Audio On**.
