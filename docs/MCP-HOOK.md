# Gancho MCP (diferido — v1 sin runtime IA)

Contrato futuro para tutor / explicación asistida:

## Input (desde `aero-engine`, no inventado por el LLM)

```json
{
  "alphaDeg": 4,
  "iasKt": 100,
  "flapsDeg": 0,
  "cl": 0.67,
  "cd": 0.043,
  "liftN": 2389,
  "dragN": 154,
  "lOverD": 15.5,
  "status": "stable",
  "criticalAlphaDeg": 15.5
}
```

## System prompt

Rol delimitado: instructor de aerodinámica básica. Explica el payload; no inventa magnitudes.

## Output schema

`titulo`, `explicacion`, `alerta_seguridad`, `siguiente_paso`

## SSD

API keys solo server-side. Input de alumno sanitizado. Sin cliente IA en MVP v1.
