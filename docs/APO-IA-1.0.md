# Plan APO — Tutor IA Didáctico (decisión Go / No-Go)

**Documento padre:** `docs/APO-PLAN.md` + `docs/MCP-HOOK.md` + ciclos cerrados (Audio / CAB / GLASS)  
**Tipo:** Addendum de producto v1.4 — **decisión de alcance** antes de código  
**Versión:** APO-IA-1.0  
**Fecha:** 2026-09-30  
**Estado:** ⚠️ GO CONDICIONAL Qwen → hallazgos cerrados en **`docs/APO-IA-1.1.md`** (pendiente GO definitivo)  
**Proveedor propuesto (humano):** **Groq** (API key server-side)  
**Reglas:** `.cursor/rules/00`–`05` (en especial **SSD**, **MCP**, **FDP**, **APO**)

> **Código:** prohibido hasta **doble OK** (humano + Qwen) con veredicto **GO** explícito.  
> **Si el veredicto es NO-GO:** este APO se archiva; no hay fases I-A*.  
> **Secrets:** la API key de Groq **nunca** va al cliente ni a git (`GROQ_API_KEY` solo env server-side / Vercel env).

---

## 0. Pregunta que Qwen debe responder

> ¿Debemos habilitar un **tutor de IA didáctico** en AEROLAB (vía Groq), bajo las 8 reglas inamovibles, o **mantener la app sin IA** en v1.x?

Respuestas admitidas (una sola):

| Veredicto | Significado |
|-----------|-------------|
| **GO** | Aprobar APO-IA-1.0 y liberar **solo I-A1** (spike + proxy + contrato) |
| **GO condicional** | Aprobar con hallazgos H-I* a cerrar antes de I-A1 |
| **NO-GO** | No implementar IA en este ciclo; archivar addendum |

---

## 1. Diagnóstico técnico

### 1.1 Situación actual
| Capa | Estado |
|------|--------|
| Motor / polar / flaps / audio / CAB / glass | **Cerrados y auditados** (75 tests) |
| Runtime IA | **Ausente** — solo gancho documentado en `docs/MCP-HOOK.md` |
| Hosting | Vite SPA en Vercel (cliente estático) → **no hay backend propio hoy** |
| Secrets | `.gitignore` ya excluye `.env` / `.env.*` |

### 1.2 Pedido del producto
Explorar **IA didáctica / apoyo al estudiante** (no “IA que calcule aerodinámica”), usando **API key de Groq**.

### 1.3 Implicación arquitectónica crítica (SSD)
Una SPA en Vercel **no puede** llamar a Groq desde el browser con la key: sería fuga SSD.

Opciones viables si **GO**:

| Opción | Descripción | Recomendación APO |
|--------|-------------|-------------------|
| **A** | Vercel Serverless / Edge Function `POST /api/tutor` | **Preferida** — mismo repo, key en env Vercel |
| **B** | Backend separado (Node/Python) | Solo si A no basta |
| **C** | Key en `VITE_*` / cliente | **Prohibido** |

### 1.4 Ciclo de vida propuesto (si GO)

```
FlightStore + computeAero → AeroSnapshot (JSON canónico)
        ↓
UI: botón "Explicar este régimen" (gesto alumno)
        ↓
POST /api/tutor  { snapshot, question?, locale: "es" }  [sanitizado]
        ↓
Server: system prompt delimitado + user = snapshot (+ pregunta acotada)
        ↓
Groq Chat Completions → JSON estructurado
        ↓
UI proyecta: titulo | explicacion | alerta_seguridad | siguiente_paso
        ↓
[NUNCA] el LLM escribe en FlightStore / polar / decideAudio
```

**FDP:** números en la explicación = solo los del snapshot (o “no consta en el modelo”).

---

## 2. Alcance de producto (si GO)

### 2.1 Dentro (IA-MVP didáctico)

| ID | Capacidad |
|----|-----------|
| I1 | Endpoint server-side Groq (`/api/tutor`) |
| I2 | Payload = snapshot `aero-engine` (+ flags view/status); schema tipado |
| I3 | System prompt: instructor CAB aerodinámica básica; **prohíbe inventar CL/CD/αcrit** |
| I4 | Output JSON: `titulo`, `explicacion`, `alerta_seguridad`, `siguiente_paso` |
| I5 | UI: panel “Tutor” (botón + tarjeta glass); disclaimer “explicación didáctica ≠ aeronave certificada” |
| I6 | Rate limit básico + timeout + manejo de error sin romper túnel |
| I7 | Sanitizar texto libre del alumno (longitud máx., strip HTML, sin concatenar en *system*) |
| I8 | Tests: contrato snapshot→request; mock Groq; **cero** key en bundle cliente |
| I9 | `.env.example` con `GROQ_API_KEY=` vacío + docs SSD |

### 2.2 Fuera de alcance (v1 IA)
- ❌ LLM que calcule o “corrija” polar / `computeAero`  
- ❌ Control automático de α/IAS/flaps por la IA  
- ❌ Chat libre sin snapshot  
- ❌ Memoria multi-sesión / accounts de alumno  
- ❌ Modelos distintos a Groq (salvo decisión explícita posterior)  
- ❌ Voice / visión / MCP tool-calling amplio  
- ❌ Sustituir Manual P1–CRM por texto generado  

### 2.3 Features didácticas candidatas (prioridad si GO)

| Prioridad | Feature | Fase sugerida |
|-----------|---------|---------------|
| P0 | **Explicar régimen actual** (stable / near_stall / stall) | I-A2 |
| P1 | Siguiente paso pedagógico alineado a controles reales | I-A2 |
| P2 | Pregunta corta del alumno acotada (≤200 chars) sobre el snapshot | I-A3 |
| P3 | Debrief de sesión (resumen local → una llamada) | I-A4 (opcional) |
| P4 | Modo “piloto vs sobrecargo” (tono copy, mismos números) | I-A4 (opcional) |

---

## 3. Decisión de proveedor: Groq

| Tema | Propuesta APO-IA-1.0 |
|------|----------------------|
| Proveedor | **Groq** |
| Secret | `GROQ_API_KEY` (server only) |
| Modelo | A definir en I-A1 spike (ej. Llama 3.x / Mixtral vía Groq) — **un** modelo fijado en config server |
| Temperatura | Baja (≈0.2–0.4) para consistencia pedagógica |
| Response format | JSON mode / schema si el modelo lo soporta; si no, parse + validación Zod/valibot |
| Fallback | Si Groq falla: mensaje U-First “Tutor no disponible; usa Manual CAB / telemetría” — **sin** inventar números |

### Riesgos Groq (para Qwen)
| Riesgo | Mitigación |
|--------|------------|
| Rate limits / free tier | Rate limit propio + UX de espera |
| Cambio de modelo/API | Abstract `TutorProvider` en server (AAD) |
| Alucinación numérica | Prompt + validación: rechazar respuesta si menciona α/CL no presentes en snapshot |
| Coste | Solo on-demand (botón), no streaming continuo por frame RAF |

---

## 4. Cumplimiento de reglas (auto-evaluación del plan)

| Regla | Cómo se cumple en el diseño |
|-------|-----------------------------|
| **APO** | Este doc + OK antes de código |
| **HRU** | Prompt/copy tutor en `data/` o config server; sin magia en JSX |
| **AAD** | Dominio nuevo `tutor-contract` (tipos) + `api/tutor` (server); UI solo proyecta |
| **U-First** | Lenguaje de vuelo; Reset/Manual siguen siendo salida clara |
| **SQA** | Tests contrato + mock; grep: no `GROQ`/`sk-` en `src/` cliente |
| **SSD** | Key solo server; sanitizar input; logs sin PII ni key |
| **MCP** | System delimitado; LLM explica JSON motor; salida estructurada; input alumno **no** en system |
| **FDP** | Snapshot = única fuente de magnitudes; UI números = motor (sin cambio) |

---

## 5. Fases de implementación (**solo si GO**)

| Fase | Contenido | Gate |
|------|-----------|------|
| **I-A1** | Spike: Vercel function + env Groq + contrato TS snapshot/response + test mock (sin UI completa) | Key ausente en client bundle; lint/test |
| **I-A2** | UI “Explicar régimen” + render tarjeta + disclaimer + errores | U-First; FDP (números = snapshot) |
| **I-A3** | Pregunta corta opcional + sanitización + rate limit | SSD; tests abuso longitud |
| **I-A4** | Evidencia forense + checklist Qwen (+ opc. debrief) | Grep secrets; gates verdes |

Orden: **I-A1 → I-A2 → …** Sin saltar. Sin código hasta GO.

---

## 6. Criterios de aceptación (si se implementa)

1. Llamada Groq **solo** desde server/edge.  
2. Bundle cliente: grep sin `GROQ_API_KEY` / secretos.  
3. Toda explicación parte de un `AeroSnapshot` tipado.  
4. Si el modelo inventa un número no presente → respuesta descartada o advertencia (política a fijar en I-A1).  
5. Fallback silencioso para el túnel si IA cae.  
6. Disclaimer didáctico visible en el panel tutor.  
7. `pnpm test` / `lint` / `build` EXIT:0; tests dominio aero **sin regresión**.  
8. Documentación: `.env.example` + nota Vercel env.

---

## 7. Argumentos Go vs No-Go (para el auditor)

### A favor de GO
- Valor pedagógico real (tutor contextual) sin tocar física.  
- Contrato ya esbozado en `MCP-HOOK.md`.  
- Groq: latencia baja, encaja con UX de aula.  
- Diferenciador frente al HTML monolítico del cliente.

### A favor de NO-GO (o diferir)
- SPA estática: introduce **primera** superficie server + secretos + coste ops.  
- Riesgo de alucinación en entorno de **formación aeronáutica** (reputacional).  
- Complejidad SSD/auditoría nueva (Qwen + humano).  
- El Manual CAB + telemetría + glass ya cubren el MVP institucional.

### Posición del implementador (no vinculante)
**Recomendación: GO condicional** — solo P0/P1 (explicar régimen + siguiente paso), proxy Vercel, validación anti-alucinación numérica, sin chat libre en v1.

---

## 8. Checklist Qwen (pre-código)

### Decisión
- [ ] Qwen: **GO** / **GO condicional** (listar H-I*) / **NO-GO**  
- [ ] Humano confirma el mismo veredicto  
- [ ] Si GO: confirmar opción proxy **A (Vercel Function)**  
- [ ] Si GO: confirmar modelo Groq concreto (o “elegir en I-A1 spike”)  
- [ ] Confirmar: **cero** key en cliente  

### Si NO-GO
- [ ] Archivar APO-IA-1.0 como “diferido”  
- [ ] Mantener solo `MCP-HOOK.md` como contrato futuro  

### Si GO — post I-A4
- [ ] Diff solo tutor + api  
- [ ] Grep secrets en `src/` / `dist/`  
- [ ] Tests mock Groq  
- [ ] Firma Qwen  

---

## 9. Decisión solicitada (copiar respuesta)

### Humano
- [ ] **Quiero GO** → Qwen evalúa y, si aprueba, liberar I-A1  
- [ ] **Prefiero NO-GO** por ahora (solo documentar)  
- [ ] **GO condicional** con límites: ________  

Proveedor: **Groq** · Secret: `GROQ_API_KEY` (server) · Proxy preferido: **Vercel Function**

### Qwen
- [ ] **GO** — liberar I-A1  
- [ ] **GO condicional** — hallazgos: ________  
- [ ] **NO-GO** — motivos: ________  

---

## 10. Relación con el estado del repo

MVP + Audio + CAB + Glass están **cerrados**.  
Este addendum es **opt-in**. No bloquea producción actual.  
Implementación IA **solo** tras veredicto GO (+ cierre de H-I* si aplica).
