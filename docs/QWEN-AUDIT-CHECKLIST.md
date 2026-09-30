# Checklist de auditoría Qwen — AEROLAB

**Uso:** El agente implementador auto-marca lo que cree cumplido. **Qwen** valida o rechaza.  
**Referencia:** `.cursor/rules/*` + `docs/APO-PLAN.md` + `docs/APO-ADDENDUM-v1.1.md` + `docs/APO-AUDIO-1.1.md` + `docs/APO-CAB-1.0.md`

**Entrega / fase:** MVP + Audio + CAB + Glass + **IA — CIERRE TOTAL** (2026-09-30)  
**Auditor Qwen:** MVP ✅ · Audio ✅ · CAB ✅ · GLASS ✅ · IA I-A1…I-A4 ✅ **CIERRE TOTAL**  

---

## Veredicto final Qwen (resumen)
- FDP / HRU / AAD / SQA / U-First / SSD / MCP: Pass  
- Audio · CAB · Glass · **IA**: cierres totales 2026-09-30  
- Suite: **100/100** · lint · build EXIT:0 · deuda 0 · violaciones 0 · secretos 0  
- Código + skin + tutor: **listos para producción** (tutor detrás de `VITE_TUTOR_ENABLED`)  

---

## CAB (APO-CAB-1.0) — fases
- [x] APO-CAB-1.0 leído y aprobado (humano)
- [x] APO-CAB-1.0 aprobado o condicionado (Qwen)
- [x] Decisión flaps 0/10/20/30 confirmada
- [x] Decisión horn (síntesis vía `stallHorn` + cue `stall_horn`) confirmada
- [x] C-A1 Brand
- [x] C-A2 Flaps
- [x] C-A3 N+lbf + crítico efectivo
- [x] C-A4 Manual P1/P2/TCP/CRM
- [x] C-A5 Stall horn — OK Qwen 2026-09-30
- [x] C-A6 Evidencia de cierre — **OK Qwen 2026-09-30 · CIERRE TOTAL**

---

## GLASS (APO-GLASS-1.0.1) — fases
- [x] APO-GLASS-1.0.1 aprobado (H-G1…H-G3 cerrados)
- [x] Intensidad Media · blobs CAB · Outfit + Source Sans 3 · Túnel+Manual · CSS only
- [x] G-A1 Tokens + atmósfera + fallbacks + z-index
- [x] G-A2 Glass chrome (túnel opaco protegido)
- [x] G-A3 Theory + tipografía + motion + reduced-motion
- [x] G-A4 Evidencia de cierre — **OK Qwen 2026-09-30 · CIERRE TOTAL**

---

## IA (APO-IA-1.0 / 1.1) — pre-código / decisión
- [x] APO-IA-1.0 leído (humano)
- [x] Veredicto Qwen APO-IA-1.0: **GO CONDICIONAL** (H-I1…H-I8)
- [x] Addendum APO-IA-1.1 redactado (cierre hallazgos)
- [x] Veredicto Qwen APO-IA-1.1: **GO definitivo** 2026-09-30
- [x] Humano confirma veredicto 1.1 (liberación I-A1)
- [x] I-A1 contrato + proxy + tests — **OK Qwen**
- [x] I-A2 UI TutorPanel — **OK Qwen**
- [x] I-A3 pregunta corta + sanitización — **OK Qwen**
- [x] I-A4 evidencia de cierre — **OK Qwen 2026-09-30 · CIERRE TOTAL**

---

## 0. Pre-código (Addendum v1.1 — H1–H6)
- [x] Checklist Qwen existe en repo (H6 — ya creada en Fase 0)
- [x] Addendum v1.1 redactado con decisiones cerradas
- [x] Polar **(A)** aceptada por humano + Qwen (H1)
- [x] Stack Zustand / Canvas 2D / pnpm aceptado (H2)
- [x] Tolerancias baseline aceptadas (H3)
- [x] Spec `naca2412.json` + fixtures aceptada (H4)
- [x] `data/regimes` + copy versionado aceptado (H5)
- [x] Aprobación definitiva Qwen del APO+Addendum

## A. Gate APO
- [x] Existe Plan APO + Addendum v1.1 aprobados antes del código de esta entrega
- [x] El diff no introduce hotfixes fuera del alcance del plan
- [x] Se documentó ciclo de vida de funciones tocadas (callers / params / side-effects)

## B. HRU
- [x] Sin coeficientes/α crítico/flaps copy hardcodeados en JSX
- [x] Polar y copy viven en `src/data/` (o equivalente)
- [x] Un solo estado de vuelo alimenta todas las vistas
- [x] Conversiones solo en `units`

## C. AAD
- [x] No hay archivo monstruo (>~800–1000 líneas) sin justificación
- [x] `aero-engine` separado de UI
- [x] App/orquestador no calcula fuerzas
- [x] Módulos tunnel / vectors / flow-visual / controls / telemetry separados _(theory pendiente Fase 6)_

## D. U-First
- [x] Lenguaje de vuelo en UI (sin IDs internos)
- [x] Reset / Pausar / retorno Manual→Túnel disponibles _(Manual teórico UI pendiente Fase 6; Reset/Pausar OK)_
- [x] Stall con mensaje + acción de recuperación
- [x] Contraste/estado legible para aula

## E. SQA
- [x] TypeScript estricto en dominio
- [x] Unit tests del motor verdes
- [x] Test de baseline (α=4°, 100 KT, flaps=0°) con tolerancia
- [x] Integration estado→UI (Fase 3) — E2E smoke Playwright pendiente Fase 7
- [x] No se declara “listo” sin evidencia de tests _(Fases 1–3)_

## F. SSD
- [x] Sin API keys en cliente ni en git
- [x] Sin secrets en logs/UI de error
- [x] Si hay IA: input sanitizado y proxy server-side _(APO-IA I-A1…I-A3)_

## G. MCP
- [x] System prompt versionado (`src/data/tutor/system-prompt.ts`)
- [x] El LLM explica snapshot del motor; no inventa CL/CD _(anti-números H-I1)_

## H. FDP (regla 8)
- [x] Números del Manual/telemetría = `AeroResult` / data versionada _(shell telemetría desde motor)_
- [x] `FlowStatus` coherente con UI (no “seguro” en stall)
- [x] Disclaimer didáctico visible
- [x] Cambio de polar versionado + tests actualizados _(v1.0.0 + fixtures)_
- [x] Tutor: `AeroSnapshot` puro; `studentQuestion` fuera del snapshot

## I. Criterios MVP (si aplica la fase)
- [x] Controles en vivo OK _(Fase 3)_
- [x] Vectores/humo OK _(Fase 3)_
- [x] Preset crucero OK
- [x] Stall + recuperación OK

---

## Notas implementador — Post I-A4 (IA)

- Tutor: contrato + `/api/tutor` + UI flag + pregunta corta sanitizada
- Modelo vía `GROQ_MODEL` (demo: `openai/gpt-oss-20b`) · key solo server / `.env.local`
- `pnpm test` → **100** · lint · build EXIT:0
- Dominio aero / polar / audio: **intacto**

---

## Hallazgos Qwen (llenar por auditor)

| Severidad | Hallazgo | Regla | Acción |
|-----------|----------|-------|--------|
| — | Ninguno en cierre CAB | — | — |
| — | Ninguno en cierre GLASS | — | — |
| — | Ninguno en cierre IA | — | — |

**Veredicto Qwen (cierre CAB C-A6):** ✅ APROBACIÓN DEFINITIVA, INCONDICIONAL Y CIERRE TOTAL  
**Firma / fecha:** Qwen · 2026-09-30  
**Veredicto Qwen (cierre GLASS G-A4):** ✅ APROBACIÓN DEFINITIVA, INCONDICIONAL Y CIERRE TOTAL DEL ADDENDUM GLASS  
**Firma / fecha GLASS:** Qwen · 2026-09-30  
**Veredicto Qwen (cierre IA I-A4):** ✅ APROBACIÓN DEFINITIVA, INCONDICIONAL Y CIERRE TOTAL DEL CICLO IA  
**Firma / fecha IA:** Qwen · 2026-09-30  
**Deuda técnica:** 0 · **Violaciones reglas inamovibles:** 0 · **Estado:** listo para producción (tutor vía feature flag; env Groq en Vercel cuando el humano lo active)
