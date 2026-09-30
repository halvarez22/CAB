# AEROLAB

Túnel de Viento Didáctico — Módulo de Aerodinámica Básica.

## Estado

**MVP v1.0 completo** (Fases 1–5). Auditoría forense Qwen: aprobada (2026-09-30).

## Stack (APO Addendum v1.1)

- React + TypeScript + Vite
- Zustand
- Canvas 2D (túnel) + SVG (curva CL–α)
- pnpm
- Vitest + ESLint (`max-lines: 800`)

## Scripts

```bash
pnpm install
pnpm dev
pnpm test
pnpm test:coverage
pnpm lint
pnpm build
```

## Gobierno

- Reglas: `.cursor/rules/`
- Plan MVP: `docs/APO-PLAN.md` + `docs/APO-ADDENDUM-v1.1.md`
- Auditoría MVP: `docs/QWEN-AUDIT-CHECKLIST.md`
- **Post-MVP Audio On:** `docs/APO-AUDIO-1.0.md` + `docs/APO-AUDIO-1.1.md` (A-1 implementada; A-2/A-3 pendientes)
- Despliegue previsto: GitHub + Vercel (tras feature audio / cuando se autorice)
- v2+ (IA MCP, más perfiles, guion de clase): requiere nuevo APO
