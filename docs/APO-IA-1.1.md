# Addendum APO — Tutor IA Didáctico v1.1 (cierre hallazgos H-I1…H-I8)

**Documento padre:** `docs/APO-IA-1.0.md`  
**Tipo:** Addendum de cierre forense — **sin código** hasta aprobación definitiva Qwen + OK humano  
**Versión:** APO-IA-1.1  
**Fecha:** 2026-09-30  
**Estado:** ✅ **CIERRE TOTAL** — I-A1…I-A4 aprobados por Qwen (2026-09-30). Módulo tutor listo para producción (feature flag). Despliegue de env IA retenido por mandato humano.  
**Proveedor:** Groq · Secret: `GROQ_API_KEY` (server-only) · Proxy: Vercel Function  
**Reglas:** SSD · MCP · FDP · HRU · AAD · U-First · SQA · APO

> Hereda el veredicto **GO CONDICIONAL** de Qwen sobre APO-IA-1.0.  
> Este documento **cierra** H-I1…H-I8 con especificaciones vinculantes.  
> **Código I-A\* prohibido** hasta que Qwen emita **GO definitivo** sobre este addendum.

---

## 0. Decisiones heredadas (APO-IA-1.0) — reafirmadas

| Tema | Decisión vinculante |
|------|---------------------|
| Alcance v1 | Solo **P0/P1**: explicar régimen + siguiente paso pedagógico |
| Chat libre | **Fuera** de v1 |
| Proxy | **Vercel Serverless/Edge** `POST /api/tutor` |
| Key en cliente | **Prohibido** |
| LLM → store/polar/audio | **Prohibido** |
| Fuente de magnitudes | Solo `AeroSnapshot` tipado (motor) |
| Fallback UX | “Tutor no disponible; usa Manual CAB / telemetría” (copy versionado) |

---

## 1. Cierre forense H-I1…H-I8

### H-I1 — Anti-alucinación numérica — **CERRADO (A + C)**

**Política pedagógica (C):** el system prompt ordena preferir lenguaje **cualitativo** (“CL elevado”, “cerca del crítico”, “régimen de pérdida”) y **no inventar** magnitudes. Si necesita citar un número, **debe** ser exactamente uno presente en el snapshot.

**Validación server-side (A) — obligatoria tras cada respuesta LLM:**

1. Extraer números de `explicacion` + `alerta_seguridad` + `siguiente_paso` + `titulo` con regex de literales numéricos (enteros/decimales, opcional signo; ignorar puntuación de lista).
2. Construir el **conjunto permitido** a partir del snapshot (valores canónicos ± tolerancia):

| Campo snapshot | Tolerancia de mención |
|----------------|------------------------|
| `alphaDeg` | ± **0.5** ° |
| `criticalAlphaDeg` | ± **0.5** ° |
| `cl` | ± **0.05** |
| `cd` | ± **0.01** |
| `lOverD` | ± **0.5** |
| `liftN`, `dragN`, `liftLbf`, `dragLbf` | ± **5** % relativo o ± **50** N / ± **10** lbf (el más permisivo) |
| `iasKt` | ± **1** KT |
| `flapsDeg` | exacto (0/10/20/30) |

3. Números “inocuos” permitidos sin match: enteros de enumeración 1–4 en “pasos”, años en disclaimer si aparecieran, y el dígito de sección P1/P2 si el copy los cita — lista explícita en `tutor-contract/number-policy.ts`.
4. Si algún número **no** cae en el conjunto permitido ni en la lista inocua → **rechazar** respuesta completa → cliente recibe error tipado `unverifiable_numbers` + copy de fallback (Manual CAB).
5. Implementación: función pura `assertTutorNumbersMatchSnapshot(text, snapshot)` en `src/domain/tutor-contract/` — **testeable sin Groq**.

---

### H-I2 — Validación Zod **siempre** — **CERRADO**

- Tras la respuesta de Groq (JSON mode o texto): **siempre** `TutorResponseSchema.parse(...)` (Zod).
- JSON mode = optimización de forma; **nunca** sustituye Zod.
- Schema tipado en `src/domain/tutor-contract/response-schema.ts` (compartible server/tests).
- Campos requeridos: `titulo`, `explicacion`, `alerta_seguridad`, `siguiente_paso` (strings no vacíos tras trim; longitudes ≤ `TUTOR_MAX_RESPONSE_LENGTH` por campo o suma — ver H-I4).
- Fallo Zod → `invalid_schema` + fallback U-First (sin reintentos silenciosos que inventen texto).

---

### H-I3 — System prompt versionado — **CERRADO**

- Archivo: `src/data/tutor/system-prompt.ts` exportando `TUTOR_SYSTEM_PROMPT` (string const) + `TUTOR_PROMPT_VERSION` (semver string, ej. `"1.0.0"`).
- La Vercel Function **importa** ese módulo; **prohibido** hardcodear el prompt en `api/tutor`.
- Contenido mínimo obligatorio:
  - Rol: instructor de aerodinámica básica del **Colegio Aeronáutico del Bajío**.
  - Explica **solo** el JSON `AeroSnapshot` adjunto.
  - **Prohibido** inventar CL, CD, α, α crítico, fuerzas o IAS.
  - Si no consta: decir “no consta en el modelo”.
  - Preferir explicación cualitativa; números solo si están en el snapshot.
  - Salida **únicamente** JSON con las 4 claves del schema.
  - No dar consejos de operación de aeronaves reales; contexto didáctico.
- Input del alumno (si I-A3): va en mensaje **user**, **nunca** concatenado al system.

---

### H-I4 — Constantes concretas — **CERRADO**

Archivo: `src/domain/tutor-contract/constants.ts`

```ts
export const TUTOR_TIMEOUT_MS = 10_000;
export const TUTOR_RATE_LIMIT_PER_MINUTE = 5; // por IP (o sesión anónima si se introduce)
export const TUTOR_MAX_INPUT_LENGTH = 200;    // pregunta alumno (I-A3); P0/P1 pueden omitir pregunta
export const TUTOR_MAX_RESPONSE_LENGTH = 1500; // suma de campos de texto de salida
export const TUTOR_TEMPERATURE = 0.3;
```

- Usadas por server (timeout fetch Groq, rate limit, truncado) y por UI (contador/disable si aplica).
- Rate limit: respuesta HTTP `429` + copy U-First; **no** cola infinita.

---

### H-I5 — Política de logs — **CERRADO**

| Entorno | SÍ loguear | NO loguear |
|---------|------------|------------|
| **production** | `ts`, `snapshotHash` (sha256 corto del JSON canónico), `outcome` (`ok` \| `error` \| `timeout` \| `rate_limited` \| `unverifiable_numbers` \| `invalid_schema`), `latencyMs`, `modelId`, `promptVersion` | pregunta alumno, body LLM completo, snapshot completo, API key, IPs crudas en claro si se puede hashear, PII |
| **development** | lo anterior + motivo de error Zod/anti-número (sin volcar PII) | API key |

- Logs vía `console` estructurado JSON en la function (mínimo) o logger sin sinks externos en v1.
- Prohibido persistir conversaciones en DB en v1.

---

### H-I6 — Streaming — **CERRADO (v1 = no streaming)**

- **v1:** request/response **completo**. Esperar body Groq → Zod → anti-números → JSON al cliente.
- **v2+ (fuera de alcance):** streaming opcional con validación al final del stream.
- Motivo: simplifica H-I1/H-I2 y cancelación/errores en aula.

---

### H-I7 — Disclaimer en COPY_ES — **CERRADO**

Añadir en `src/data/copy/es.ts` (estructura):

```ts
tutor: {
  title: "...",
  explainCta: "Explicar este régimen",
  loading: "...",
  unavailable: "Tutor no disponible; usa Manual CAB / telemetría.",
  unverifiable: "No pude verificar esa explicación; consulta el Manual CAB.",
  rateLimited: "...",
  disclaimer:
    "Explicación didáctica asistida por IA. No sustituye al Manual CAB ni a procedimientos de aeronave certificada. Los números provienen del modelo del túnel.",
}
```

- UI **solo** lee `COPY_ES.tutor.*` (HRU / U-First).

---

### H-I8 — Accesibilidad panel tutor — **CERRADO**

Requisitos UI (fase I-A2, vinculantes desde ya):

| Requisito | Especificación |
|-----------|----------------|
| CTA | Botón nativo focusable; activable teclado (Enter/Espacio) |
| Región de respuesta | Contenedor con `role="status"` o `aria-live="polite"` |
| Carga | Texto/estado `aria-busy="true"` anunciable |
| Error / fallback | Mismo live region; no solo color |
| Focus | Al abrir panel (si dialog): focus al título o primer control; Escape cierra si es dialog |
| Glass | Reutilizar `.glass-panel`; no reducir contraste del texto tutor (`--text-primary`) |

---

## 2. Mejoras recomendadas — aceptación

| # | Mejora Qwen | Decisión APO-IA-1.1 |
|---|-------------|---------------------|
| 1 | Modelo Groq concreto | **Aceptada:** default `llama-3.3-70b-versatile` (const `TUTOR_GROQ_MODEL`). Criterios: español OK, JSON usable, latencia aula, coste razonable. Cambio de modelo = bump config + test mock, no hardcode UI. |
| 2 | Hash snapshot | **Aceptada parcial:** siempre se envía snapshot completo al LLM (FDP); en **logs** solo `snapshotHash`. Cache server v2 fuera de alcance. |
| 3 | Tests mock Groq | **Aceptada:** mocks de respuestas válidas / Zod-invalid / números inventados → fallback. Cero red en CI. |
| 4 | Doc de costes | **Aceptada (doc):** sección §4 abajo — estimación orden de magnitud; rate limit H-I4 como tope de gasto. |
| 5 | Feature flag | **Aceptada:** `VITE_TUTOR_ENABLED` (`"true"` \| ausente/false) controla **visibilidad UI** del CTA. La function puede existir pero UI oculta el tutor si flag off. Key sigue solo server. |

---

## 3. Arquitectura AAD (si GO definitivo)

```
src/domain/tutor-contract/
  types.ts              # AeroSnapshot (vista tutor), TutorResponse, TutorErrorCode
  constants.ts          # H-I4 + TUTOR_GROQ_MODEL + TUTOR_TEMPERATURE
  response-schema.ts    # Zod (H-I2)
  number-policy.ts      # H-I1 assertTutorNumbersMatchSnapshot
  index.ts

src/data/tutor/
  system-prompt.ts      # H-I3

src/data/copy/es.ts     # COPY_ES.tutor (H-I7)

api/tutor.ts            # Vercel Function (o api/tutor/index.ts) — solo orquesta

src/ui/tutor/           # I-A2: TutorPanel + CTA (a11y H-I8)

tests/unit/tutor-*.ts   # mock Groq + H-I1 + Zod
```

**App** solo orquesta; motor aero **intacto**.

---

## 4. Estimación de coste (orden de magnitud)

| Concepto | Orden |
|----------|--------|
| Input | ~system 400–800 tokens + snapshot ~150–250 tokens |
| Output | ≤ ~400 tokens (cap por `TUTOR_MAX_RESPONSE_LENGTH`) |
| Uso aula | ≤ 5 req/min/IP × sesión práctica |
| Control | Rate limit H-I4 + flag UI + botón on-demand (no por frame) |

> Cifras exactas $/1M tokens varían en Groq; el rate limit es el freno operativo v1. Revisar pricing al spike I-A1 y anotar en evidencia.

---

## 5. Fases (sin cambio de orden; gates endurecidos)

| Fase | Contenido | Gate adicional 1.1 |
|------|-----------|---------------------|
| **I-A1** | Contract + constants + Zod + number-policy + system-prompt data + Vercel function + mock tests + `.env.example` | H-I1…H-I6 en server; **sin UI** completa |
| **I-A2** | TutorPanel + CTA + COPY + a11y + flag `VITE_TUTOR_ENABLED` | H-I7, H-I8; FDP UI |
| **I-A3** | Pregunta corta opcional ≤200 + sanitización | SSD input |
| **I-A4** | Evidencia forense + grep secrets + checklist | Firma Qwen |

---

## 6. Criterios de aceptación ampliados (puerta I-A*)

Además de APO-IA-1.0 §6:

1. `assertTutorNumbersMatchSnapshot` con tests de falso positivo/negativo documentados.  
2. Toda respuesta pasa Zod **antes** de llegar al cliente.  
3. Prompt solo desde `src/data/tutor/system-prompt.ts`.  
4. Constantes H-I4 en dominio, no literales mágicos en la function.  
5. Logs production cumplen tabla H-I5.  
6. Sin streaming en v1.  
7. Disclaimer solo vía `COPY_ES.tutor.disclaimer`.  
8. Panel cumple H-I8 (verificable en auditoría UI).  
9. Grep: sin `GROQ_API_KEY` / `gsk_` en `src/` cliente ni `dist/` assets JS.  
10. Modelo default = `llama-3.3-70b-versatile` salvo override env server `GROQ_MODEL` documentado.

---

## 7. Checklist Qwen / humano

### Cierre hallazgos
- [x] H-I1 A+C + función pura testeable  
- [x] H-I2 Zod siempre  
- [x] H-I3 prompt en `data/tutor`  
- [x] H-I4 constantes numéricas  
- [x] H-I5 política logs  
- [x] H-I6 no streaming v1  
- [x] H-I7 COPY_ES.tutor  
- [x] H-I8 a11y panel  
- [x] Mejoras 1, 2-parcial, 3, 4, 5 aceptadas  

### Decisión
- [ ] **Qwen: GO definitivo** APO-IA-1.1 → liberar **solo I-A1**  
- [ ] Qwen: GO condicional adicional (nuevos H-*)  
- [ ] Qwen: NO-GO  
- [ ] Humano confirma el veredicto Qwen  

---

## 8. Nota

Producción actual (MVP+Audio+CAB+Glass) **no se bloquea**.  
IA sigue **opt-in**. Sin GO definitivo sobre **1.1**, no hay I-A1.
