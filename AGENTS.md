# AEROLAB — Guía para agentes

Proyecto educativo: **Túnel de Viento Didáctico** (aerodinámica básica).

## Lectura obligatoria
1. `.cursor/rules/00-aerolab-inamovibles.mdc` — 8 reglas (incluye **FDP**)
2. `.cursor/rules/05-aerolab-apo-gate.mdc` — no codear sin aprobación
3. `docs/APO-PLAN.md` + `docs/APO-ADDENDUM-v1.1.md` — plan MVP
4. `docs/QWEN-AUDIT-CHECKLIST.md` — handoff auditoría Qwen
5. `docs/APO-AUDIO-1.0.md` + `docs/APO-AUDIO-1.1.md` — Audio On (**cerrado**)
6. `docs/APO-CAB-1.0.md` + `docs/APO-GLASS-1.0.md` — CAB + Glass (**cerrados**)
7. `docs/APO-IA-1.0.md` + `docs/APO-IA-1.1.md` — Tutor IA Groq (**cerrado** Qwen 2026-09-30)

## Flujo
`APO (plan + OK usuario) → implementar por dominios → tests → checklist Qwen → revisión Qwen`

## No hacer
- Hotfixes de física/UI sin APO
- Hardcodear polar o α crítico en componentes
- Meter API keys en frontend
- Declarar “listo” sin tests del motor
