# Plan APO — Skin Glass Morphism (UI/UX modernización CAB)

**Documento padre:** `docs/APO-PLAN.md` + `docs/APO-CAB-1.0.md` (**cerrado** Qwen 2026-09-30)  
**Tipo:** Addendum de producto v1.3 — presentación visual (skin) sin tocar dominio  
**Versión:** APO-GLASS-1.0.1 (cierre hallazgos H-G1…H-G3)  
**Fecha:** 2026-09-30  
**Estado:** ✅ **CIERRE TOTAL** — G-A1…G-A4 aprobados por Qwen (2026-09-30). Skin listo para producción. GitHub/Vercel retenidos por mandato humano.  
**Reglas:** `.cursor/rules/00`–`05` (FDP / HRU / AAD / U-First / SQA)

> **GitHub/Vercel:** diferidos por mandato humano. Este APO **no** incluye despliegue.  
> **Código:** prohibido hasta aprobación definitiva tras este addendum.

> Objetivo: elevar la UI de AEROLAB a una presentación tipo **app / web moderna de prototipo de negocio digital**, con **glassmorphism**, **sin** alterar física, audio, datos ni contratos ya auditados.

---

## 1. Diagnóstico técnico

### 1.1 Situación actual
| Capa | Estado |
|------|--------|
| Dominio (motor, polar, flaps, audio) | **Cerrado** — MVP + Audio On + CAB C-A1…C-A6 |
| Presentación | Tema dark navy CAB en `src/app/styles.css`: paneles opacos (`--panel`), bordes sólidos, tipografía sistema |
| Orquestación | `App.tsx` ya separa shell / brand / túnel / controles / telemetría / theory |

### 1.2 Pedido del cliente
Misma app AEROLAB con aspecto “producto SaaS / lab digital premium”; glass = capas translúcidas + `backdrop-filter` + borde luminoso; paleta **solo** CAB (navy/sky/gold).

### 1.3 Ciclo de vida (impacto)

```
[NO TOCAR] data/ · aero-engine · audio-engine · audio-runtime · flight-state · polar
        ↓
App / CSS / wrappers UI presentacionales
        ↓
Skin glass; mismos números; mismos tests de dominio
```

---

## 2. Decisiones de diseño — CERRADAS (respuesta a Qwen §3)

| Tema | Decisión vinculante |
|------|---------------------|
| **Intensidad glass** | **Media** — blur **12–20px**; `--glass-bg` rgba ~**12–22%** (blanco sobre navy / navy translúcido) |
| **Fondo** | **Gradiente radial + 1–2 blobs soft CAB** (sin foto hangar) |
| **Tipografía** | **Display: Outfit**; **UI: Source Sans 3**; carga con `font-display: swap` (+ preconnect/preload — ver H-G3) |
| **Alcance pantallas** | **Túnel + Manual** (ambas) |
| **Motion** | **CSS only** + `@media (prefers-reduced-motion: reduce)` — sin librería |

---

## 3. Cierre forense de hallazgos Qwen (H-G1…H-G3)

### H-G1 — Fallback contraste / transparencia — **ACEPTADO E OBLIGATORIO**

Estrategia **doble** (ambos en G-A1 tokens + G-A2 paneles):

1. **`prefers-reduced-transparency: reduce`** → tokens glass colapsan a sólido CAB opaco:
```css
@media (prefers-reduced-transparency: reduce) {
  :root {
    --glass-bg: var(--cab-navy-deep);
    --glass-border: color-mix(in srgb, var(--cab-gold) 55%, var(--cab-border));
    --glass-blur: 0px;
    --glass-shadow: none;
  }
  .glass-panel {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--glass-bg);
  }
}
```

2. **`@supports not ((backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px)))`** → mismo colapso sólido (proyector / navegadores sin blur):
```css
@supports not ((backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px))) {
  .glass-panel {
    background: var(--cab-navy-deep);
    border: 1px solid color-mix(in srgb, var(--cab-gold) 55%, var(--cab-border));
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

3. **Texto crítico** (métricas, α, status, disclaimer): color opaco sobre panel; badges `--stable` / `--near` / `--stall` **siempre opacos** (nunca glass sobre el semáforo pedagógico).

**Criterio aula:** con transparency reduce o sin blur, contraste ≥ paneles actuales CAB opacos.

---

### H-G2 — Z-index / apilamiento canvas — **ACEPTADO E OBLIGATORIO**

Regla de capas documentada (implementar en CSS + estructura DOM):

| Capa | Clase / nodo | `z-index` | Notas |
|------|--------------|-----------|--------|
| Atmósfera (blobs/gradiente) | `.shell__atmosphere` | `0` | `position: fixed` o absolute en root; `pointer-events: none` |
| Shell contenido | `.shell` | `1` | flujo normal |
| Chrome glass (header, nav, side panels, telemetry, theory cards) | `.glass-panel` | `2` | **hermanos** del túnel en grid; **no** overlay absoluto sobre el canvas |
| Túnel didáctico | `.tunnel` / `.tunnel__stage` | `10` | fondo **opaco** propio (`background: var(--cab-navy)` o equivalente); **sin** `backdrop-filter` en el canvas ni en wrappers que lo cubran |

**Garantía estructural (FDP):**
- El `<canvas>` vive **solo** dentro de `.tunnel__stage`.
- Ningún `.glass-panel` usa `position: absolute/fixed` que cubra el rectángulo del túnel.
- Layout = CSS Grid/Flex: tunnel | side — paneles glass son celdas adyacentes, no capas encima del dibujo.
- Prohibido: `backdrop-filter` en `.tunnel`, `.tunnel canvas`, o padres que incluyan el canvas con translucidez.

---

### H-G3 — Tipografía / CLS — **ACEPTADO E OBLIGATORIO**

1. Fuentes: **Outfit** (display / títulos brand) + **Source Sans 3** (UI / cuerpo).  
2. En `index.html`:
   - `rel="preconnect"` a `https://fonts.googleapis.com` y `https://fonts.gstatic.com` (`crossorigin` en gstatic).
   - `rel="preload"` (o stylesheet con display=swap) del CSS de Google Fonts **o** self-host woff2 en `src/assets/fonts/` si se prefiere cero red en runtime (preferencia: Google Fonts con swap en MVP).
3. CSS: `font-display: swap` en `@font-face` / URL de Google (`display=swap` en la query).  
4. Fallbacks del stack inmediato (evitar CLS grave):  
   `font-family: "Outfit", "Segoe UI", system-ui, sans-serif` (display)  
   `font-family: "Source Sans 3", "Segoe UI", system-ui, sans-serif` (UI)  
5. Tamaños de título con `clamp()` ya existentes; no cambiar métricas de layout de controles en G-A1 (solo tokens + atmósfera).

---

## 4. Alcance

### 4.1 Dentro (GLASS-MVP)

| ID | Entrega |
|----|---------|
| G1 | Tokens `--glass-*` + atmósfera + **H-G1 fallbacks en la misma fase de tokens** |
| G2 | Fondo gradiente + blobs CAB |
| G3 | Glass en header, ViewNav, controles, telemetría, theory, footer — respetando **H-G2** |
| G4 | Tipografía Outfit + Source Sans 3 con **H-G3** |
| G5 | Motion CSS only + `prefers-reduced-motion` |
| G6 | Layout producto desktop + móvil |
| G7 | Accesibilidad H-G1 + contraste estados de flujo |
| G8 | Gates verdes; cero regresión dominio |
| G9 | Evidencia forense Qwen |

### 4.2 Fuera de alcance
Sin cambios a dominio/audio/polar/manual contenido; sin Tailwind/Framer; sin purple AI; sin GitHub/Vercel.

---

## 5. Arquitectura AAD

```
index.html                         # preconnect + preload fonts (H-G3)
src/app/styles.css                 # tokens glass + @supports + media + z-index (H-G1/H-G2)
src/app/App.tsx                    # .shell__atmosphere wrapper si hace falta
src/ui/tunnel/*                    # contenedor opaco z-index 10; sin glass sobre canvas
src/ui/**/*.tsx                    # className presentacional únicamente
```

**HRU:** hex/rgba glass solo vía tokens `:root`.  
**Prohibido:** `src/domain/**`, polar, audio, `cab-manual.ts` contenido.

---

## 6. Fases (post aprobación **definitiva**)

| Fase | Contenido | Gate |
|------|-----------|------|
| **G-A1** | Tokens glass + atmósfera + shell + **H-G1** (`@supports` + `prefers-reduced-transparency`) + escala z-index base **H-G2** | Visual moderno; lint; canvas no borroso |
| **G-A2** | Glass chrome (header/nav/paneles/telemetría) sin overlay canvas | Contraste stall/near; móvil |
| **G-A3** | Theory + tipografía **H-G3** + motions + reduced-motion | U-First; gates verdes |
| **G-A4** | Evidencia forense | OK Qwen |

---

## 7. Criterios de aceptación (ampliados)

1. Brand CAB hero; glass no tapa logo.  
2. Chrome glass; **canvas sin blur ni glass encima** (H-G2 verificable en DevTools).  
3. Estados de flujo inequívocos; badges opacos.  
4. Con `prefers-reduced-transparency: reduce` o sin `backdrop-filter` → paneles sólidos legibles (H-G1).  
5. Fonts con `display=swap` + preconnect; sin FOIT bloqueante (H-G3).  
6. Túnel + Manual mismo lenguaje.  
7. `prefers-reduced-motion` silencia animaciones no esenciales.  
8. `pnpm test` / `lint` / `build` EXIT:0; ≥75 tests dominio intactos.  
9. Grep: sin física en CSS/UI nueva.  
10. Sin dependencias JS nuevas.

---

## 8. Checklist Qwen

### Pre-código
- [x] Decisiones diseño §2 cerradas (Media / blobs / Outfit+Source Sans 3 / ambas pantallas / CSS only)  
- [x] H-G1 fallbacks definidos y **aceptados como obligatorios**  
- [x] H-G2 z-index + estructura DOM **aceptados como obligatorios**  
- [x] H-G3 font-display swap + preconnect **aceptados como obligatorios**  
- [x] Sin GitHub/Vercel en este ciclo  
- [x] **Aprobación definitiva Qwen** APO-GLASS-1.0.1 — 2026-09-30  
- [x] **OK humano** → liberar G-A1  
- [x] Sin código G-A* hasta ambos OK → G-A1…G-A3 ejecutadas y aprobadas  
### Post G-A4
- [x] Diff solo presentación  
- [x] Prueba forense H-G1/H-G2/H-G3  
- [x] Gates verbatim (75/75 · lint · build EXIT:0)  
- [x] **Firma Qwen visual / cierre definitivo GLASS** — 2026-09-30  

---

## 9. Decisión solicitada

### Humano (implementador / producto)
- [x] Confirmo las **5 decisiones** de §2  
- [x] Acepto implementar **H-G1, H-G2, H-G3** tal como están redactados  
- [x] G-A1…G-A3 liberadas y ejecutadas tras gates Qwen  

### Qwen
- [x] Aprobación definitiva APO-GLASS-1.0.1 → G-A1…G-A3  
- [x] Aprobación condicional previa (H-G1…H-G3) — hallazgos cerrados  
- [x] **Firma cierre definitivo G-A4 / addendum GLASS** — 2026-09-30  
- [ ] Rechazo  

---

## 10. Relación con despliegue

CAB funcional cerrado. GLASS es incremento de presentación.  
**No** inicializar Git ni Vercel hasta mandato humano explícito distinto.
