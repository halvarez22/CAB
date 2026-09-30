# Plan APO — Audio On (Feedback sonoro pedagógico)

**Documento padre:** `docs/APO-PLAN.md` (MVP v1.0 cerrado)  
**Tipo:** Addendum de feature v1.1 de producto / incremento post-MVP  
**Versión:** APO-AUDIO-1.0 (+ Addendum **1.1** obligatorio)  
**Fecha:** 2026-09-29  
**Estado:** ⚠️ Aprobación condicional Qwen — ver `docs/APO-AUDIO-1.1.md`  
**Alcance:** Feedback sonoro didáctico derivado de `FlowStatus` / eventos de vuelo — **sin alterar física del motor**

> **Gate APO:** no se escribe código de Audio On hasta aprobación expresa de este plan **y** del addendum `docs/APO-AUDIO-1.1.md` (cierre H-A1/H-A2/H-A3).

---

## 1. Diagnóstico técnico

### 1.1 Problema / oportunidad
El prototipo Gemini ofrecía un control **“Audio On”**. El MVP v1.0 lo omitió a propósito (fuera de Fases 1–5).  
Hoy la app comunica estado solo por **vista** (banner, curva, vectores, humo). En aula, un canal sonoro refuerza:

- Transición a `near_stall` / `stall`
- Confirmación de presets / reset
- Sensación de laboratorio “vivo” (U-First / efecto presencia)

### 1.2 Qué NO es este feature
- No es un motor de física acústica ni CFD sonoro.
- No modifica `computeAero`, polar, ni tolerancias baseline.
- No sustituye telemetría, curva ni disclaimer (FDP).

### 1.3 Ciclo de vida propuesto (trazabilidad APO)

```
FlightStore (audioOn, paused, view)
        +
AeroResult.status  (desde computeAero — inmutable para audio)
        │
        ▼
 audio-engine (puro)
   - decide: AmbientCue | OneShotCue | silence
   - inputs: status, prevStatus, audioOn, paused, view, event?
        │
        ▼
 audio-runtime (Web Audio / HTMLAudio)
   - play / crossfade / stop
   - NO conoce polar ni coeficientes
        │
        ▼
 UI toggle (COPY_ES.controls.audioOn / audioOff)
```

**Pregunta APO obligatoria en cada cambio:** ¿quién llama al runtime, con qué `FlowStatus`, y qué deja de sonar al pausar / ir a Manual?

### 1.4 Riesgos si se codea sin plan
| Riesgo | Impacto | Mitigación en este APO |
|--------|---------|------------------------|
| Audio recalcula stall con `if (alpha > 15.5)` | Rompe FDP | Solo `AeroResult.status` |
| RAF + audio loops sin cleanup | CPU/fuga | Runtime con `stopAll` al unmount / view=theory / paused |
| Assets hardcodeados en JSX | Rompe HRU | Manifiesto `src/data/audio/manifest.ts` |
| God-component en App | Rompe AAD | Módulo `src/domain/audio-engine` + `src/ui/audio` |
| Tests flaky por AudioContext | Rompe SQA | Engine puro unit-testeable; runtime mockeado |
| Autoplay bloqueado por browser | UX rota | Mute default OFF; primer gesto usuario activa |

---

## 2. Alcance

### 2.1 Dentro de alcance (AUDIO-MVP)

| ID | Entrega |
|----|---------|
| A1 | Flag `audioOn` en `FlightStore` (default **false**) |
| A2 | Toggle UI con `COPY_ES` (sin strings en JSX) |
| A3 | `audio-engine` puro: mapeo `FlowStatus` + eventos → cues |
| A4 | `audio-runtime`: reproducción Web Audio o `<audio>` + cleanup |
| A5 | Manifiesto de assets versionado (`src/data/audio/`) |
| A6 | Silencio automático si `paused === true` **o** `view === "theory"` |
| A7 | One-shots: entrada a `stall`, salida de `stall`→`stable`, preset stall (opcional acotado) |
| A8 | Ambient loop suave por status (stable / near_stall / stall) — volumen bajo |
| A9 | Unit tests del engine + integration toggle/mute |
| A10 | Evidencia forense en chat (no archivo `.md` obligatorio) para Qwen si audita |

### 2.2 Fuera de alcance (AUDIO-MVP)
- Narración TTS / voz del instructor
- Música de fondo no ligada a status
- Síntesis procedural compleja (ruido de viento CFD)
- Preferencia persistida en backend/cuenta (sí se permite `localStorage` opcional **solo si** se aprueba en addendum; default de este plan: **no persistir** en AUDIO-MVP)
- Cambio de polar, motor, curva, manual teórico (salvo copy del toggle)

### 2.3 Diferido (AUDIO-v2)
- Pack de sonidos por escuela / i18n de cues
- Intensidad modulada por IAS (si se hace: solo `iasKt` del store, **nunca** recalcular L/D)
- MCP/IA que “explique” el sonido

---

## 3. Decisiones cerradas (evitar branching architecture)

| Decisión | Elección APO-AUDIO-1.0 | Justificación |
|----------|------------------------|---------------|
| API de sonido | **Web Audio API** (buffers) con fallback silencioso si no hay AudioContext | Control de gain/crossfade; testeable con mock |
| Default | **`audioOn: false`** | Autoplay policies + aula (instructor activa) |
| Fuente de verdad de “pérdida” | **Solo `AeroResult.status`** | FDP regla 8 |
| Persistencia | **No** en AUDIO-MVP | Menos superficie SSD/UX sorpresa |
| Ubicación assets | `public/audio/*.ogg` (+ `.mp3` fallback opcional) + manifiesto TS | HRU / versionado |
| Relación con Canvas | Independiente; se silencia con Manual/Pause igual que desmontamos RAF | Consistencia U-First |

---

## 4. Arquitectura AAD (módulos)

```
src/domain/audio-engine/
  types.ts          # AmbientCueId | OneShotCueId | AudioDecision
  decide.ts         # puro: prev/next status + flags → decision
  index.ts

src/data/audio/
  manifest.ts       # ids → { src, loop, gain, descriptionKey }
  (sin bytes en TS)

public/audio/
  ambient-stable.ogg
  ambient-near-stall.ogg
  ambient-stall.ogg
  oneshot-enter-stall.ogg
  oneshot-recover.ogg

src/ui/audio/
  useFlightAudio.ts  # suscribe store + aero.status; llama runtime
  AudioToggle.tsx    # botón ON/OFF con COPY_ES

src/data/copy/es.ts  # audioOn, audioOff, audioBlockedHint
```

**Prohibido:**
- Calcular fuerzas o α crítico en `audio-engine`
- Importar `naca2412.json` desde audio
- Reproducir desde `App.tsx` (App solo monta `AudioToggle` + hook orquestador fino)

**App / orquestación:**  
`useFlightAudio({ status: aero.status })` junto al render; **no** alarga `App` hacia God-Object (hook &lt; ~80 líneas; lógica en engine).

---

## 5. Contrato de dominio (borrador tipado)

```ts
export type AmbientCueId = "ambient_stable" | "ambient_near_stall" | "ambient_stall" | "none";
export type OneShotCueId = "enter_stall" | "recover_stable" | "none";

export interface AudioDecision {
  ambient: AmbientCueId;
  oneShot: OneShotCueId;
  masterGain: number; // 0 si mute lógico
  reason: "user_off" | "paused" | "theory_view" | "status";
}

export function decideAudio(input: {
  audioOn: boolean;
  paused: boolean;
  view: AppView;
  status: FlowStatus;
  prevStatus: FlowStatus | null;
}): AudioDecision;
```

### Reglas de decisión (normativas)

1. Si `!audioOn` → ambient `none`, oneShot `none`, gain 0, reason `user_off`.  
2. Si `paused` → ambient `none`, gain 0, reason `paused` (oneShot cancelado).  
3. Si `view === "theory"` → igual que paused, reason `theory_view`.  
4. Si `status === "stall"` → ambient `ambient_stall`.  
5. Si `status === "near_stall"` → ambient `ambient_near_stall`.  
6. Si `status === "stable"` → ambient `ambient_stable`.  
7. OneShot `enter_stall` solo si `prevStatus !== "stall"` && `status === "stall"`.  
8. OneShot `recover_stable` solo si `prevStatus === "stall"` && `status === "stable"`.  
9. **Nunca** usar `alphaDeg`, `cl`, `criticalAlphaDeg` dentro del engine de audio.

---

## 6. HRU / FDP / U-First / SSD

### HRU
- Rutas de archivos y gains en `manifest.ts`, no en JSX.
- Copy del toggle en `COPY_ES`.
- Un mismo `decideAudio` alimenta cualquier runtime futuro.

### FDP
- El sonido de pérdida refleja **exactamente** el mismo `status` que StatusBar / curva / humo.
- Si el motor cambia umbral near-stall, el audio **sigue** sin tocarse.

### U-First
- Label: `Audio: ON` / `Audio: OFF` (español, copy versionado).
- Si el browser bloquea AudioContext: hint no técnico (`COPY_ES.controls.audioBlockedHint`) tras primer click fallido.
- No exigir comandos ni permisos confusos.

### SSD
- Sin tracking de audio a terceros.
- Assets locales en `public/audio` (sin CDN obligatoria en AUDIO-MVP).
- Sin PII.

### SQA
- Unit: tabla de transiciones status × flags → decision (matriz).  
- Integration: toggle ON → store `audioOn true`; pause → decision gain 0 (mock runtime).  
- No tests E2E de “oído”; mock de `AudioContext`.  
- Lint `max-lines` sigue en 800.

---

## 7. Plan de implementación por fases

| Fase | Trabajo | Criterio de salida | Tests |
|------|---------|--------------------|-------|
| 0 | Aprobación de este APO | OK humano (+ Qwen si aplica) | — |
| A-1 | `decideAudio` + types + unit matrix | 100% ramas de decisión cubiertas | unit |
| A-2 | `manifest` + assets placeholder (o silencio sintético corto generado) | IDs resuelven path | unit |
| A-3 | `audio-runtime` + mockable interface | play/stop/crossfade sin throw | unit mock |
| A-4 | Store `audioOn` + `AudioToggle` + copy | Toggle visible en controles | integration |
| A-5 | `useFlightAudio` cableado; silencio en pause/theory | Manual desmonta canvas **y** silencia | integration |
| A-6 | Evidencia forense en chat (grep: audio no importa polar) | Paquete para Qwen | — |

**Prohibido:** saltar a assets “bonitos” antes de A-1 (engine puro).

---

## 8. Criterios de aceptación

1. Con `audioOn=false` no hay reproducción (gain 0 / no start).  
2. Con `audioOn=true` y `status=stall`, ambient de stall (o cue equivalente del manifiesto).  
3. Transición a stall dispara one-shot `enter_stall` **una vez** por flanco.  
4. `paused` o vista Manual → silencio inmediato.  
5. Toggle usa solo `COPY_ES`.  
6. `rg` en `src/domain/audio-engine` y `src/ui/audio`: **0** matches de `0.67|15.5|1.225|computeAero|naca2412`.  
7. Suite existente (29+) sigue verde; nuevos tests audio verdes.  
8. `App.tsx` no crece a God-Object (hook/módulos).  
9. Disclaimer / motor / polar **sin cambios funcionales**.

---

## 9. Evidencia forense esperada (para Qwen)

Cuando se implemente, entregar **en chat** (sin `.md` obligatorio):

| # | Artefacto |
|---|-----------|
| AU.1 | `decide.ts` + tests matriz (completo) |
| AU.2 | `manifest.ts` completo |
| AU.3 | `useFlightAudio.ts` + `AudioToggle.tsx` completos |
| AU.4 | Diff de `flight-state` (`audioOn`) |
| AU.5 | `pnpm test` verbose + lint + build EXIT:0 |
| AU.6 | Grep forense audio ↛ polar |

---

## 10. Impacto en reglas inamovibles

| Regla | Cumplimiento en este plan |
|-------|---------------------------|
| APO | Plan antes de código; ciclo de vida trazado |
| HRU | Manifiesto + copy; cero magia en JSX |
| AAD | Engine / runtime / UI separados |
| U-First | Toggle claro; silencio en Manual/Pause; default off |
| SQA | Engine unit-first; mocks de AudioContext |
| SSD | Assets locales; sin telemetría externa |
| MCP | N/A (sin LLM) |
| FDP | Audio esclavo de `FlowStatus`, no de α hardcode |

---

## 11. Decisión solicitada (actualizado post-Qwen)

1. Revisar y aceptar **`docs/APO-AUDIO-1.1.md`**.  
2. Qwen emite **aprobación definitiva**.  
3. Solo entonces → fase **A-1** (`decideAudio` + matriz + test theory→tunnel).

Sin addendum aceptado + OK Qwen → **no se implementa Audio On**.
