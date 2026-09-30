# Plan APO — Tutor IA 1.2 (Prompt visible · Piloto experto)

**Padre:** `docs/APO-IA-1.1.md` (cerrado)  
**Versión:** APO-IA-1.2  
**Fecha:** 2026-09-30  
**Estado:** ✅ Implementado · gates verdes (pendiente sello Qwen)  
**Objetivo:** Campo de **prompt visible** para consultas del alumno; la IA responde como **piloto experto** sobre conceptos del túnel/Manual CAB. Sin inventar magnitudes (FDP). Key solo server (SSD).

## Decisiones
| Tema | Decisión |
|------|----------|
| Visibilidad | Tutor **ON por defecto**; solo se oculta si `VITE_TUTOR_ENABLED=false` |
| UX | Prompt obligatorio + CTA “Consultar al piloto” |
| Ubicación | Tras StatusBar (Túnel y Manual) — visible sin buscar |
| Persona | Piloto experto en aerodinámica básica (didáctico, no aeronave certificada) |
| Snapshot | Sigue enviándose como contexto; números solo del motor |

## Fuera de alcance
Chat multi-turno, cambiar física, key en cliente.

## Evidencia implementador
- `TUTOR_PROMPT_VERSION = "1.2.0"` · persona piloto experto
- `isTutorUiEnabled`: ON salvo `"false"`
- `TutorDock` tras StatusBar · pregunta obligatoria · copy CTA
- Tests flag + payload `studentQuestion` + CTA vacío + rate limit
- Criterio: `pnpm test` · `pnpm lint` · `pnpm build` EXIT:0
