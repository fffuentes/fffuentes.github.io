# 📋 DEV NOTES — Control Tower de Repuestos

> Última actualización: 2026-07-01  
> Rama activa: `responsive-mobile`

---

## 🎯 Objetivo del Proyecto

Dashboard ejecutivo para monitoreo de **rotación y obsolescencia de inventario** de repuestos.
SPA vanilla (HTML/CSS/JS) servida estáticamente en GitHub Pages.
Diseñado para visualizar: concentración de valor (Pareto), inventario sin rotación, materiales obsoletos y materiales MRP.

---

## 🏗️ Tecnologías

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla ES6+) | — |
| Gráficos | Chart.js | CDN jsdelivr |
| Datos | SheetJS (xlsx) | CDN jsdelivr |
| Íconos | Font Awesome | 6.7.2 (CDN cdnjs) |
| Hosting | GitHub Pages | fffuentes.github.io |
| Fuente | Excel estático | `data/Control_Rotacion_Repuestos_SKU.xlsx` |

---

## 🧠 Filosofía del Proyecto

- **Sin frameworks**: Sin React, Vue, Angular, Bootstrap. HTML+CSS+JS vanilla.
- **Sin build step**: Sin Webpack, Vite, npm. Se edita y se despliega directamente.
- **Auto-contenido**: Un solo archivo Excel como fuente de datos. Sin backend, sin API.
- **Dashboard ejecutivo**: Prioriza KPIs y gráficos sobre tablas de detalle.
- **Tema oscuro**: Estilo corporativo "Excel Premium" con variables CSS.

---

## 🏛️ Arquitectura General

```
CDNs (Chart.js, SheetJS, Font Awesome)
         │
    index.html ────────────────────────────── styles.css
         │
    ┌────┴────┐
chartConfig.js  excelLoader.js
         │          │
         └────┬─────┘
            app.js
              │
    ┌────┬────┼────┬────┐
  Tabs  KPIs Charts Pareto Tablas
```

---

## 🔄 Cómo se cargan los datos

1. **NO** se cargan automáticamente al abrir la página
2. El usuario hace clic en **"Actualizar"**
3. `refrescarDashboard()` → `cargarExcel()` → `fetch()` del `.xlsx` con timestamp anti-caché
4. `XLSX.read()` → 3 funciones de procesamiento llenan `dashboardData`
5. Se crean/actualizan gráficos, KPIs y tablas

---

## 🖥️ Cómo está organizada la interfaz

### Header
- Título "CONTROL TOWER DE REPUESTOS" (izquierda)
- Panel de estado `#panelEstado` (centro) — "Dashboard preparado" sin datos
- Botón "Actualizar" + fecha última actualización (derecha)

### Tabs
1. **Resumen Global** — KPIs principales + 4 gráficos (2 doughnut, 2 bar)
2. **Resumen MRP** — KPIs filtrados a materiales MRP + 4 gráficos
3. **Análisis SKU** — 6 KPI cards + Pareto + Riesgos + Tablas Top 20

---

## 📊 Decisiones importantes de diseño

| Decisión | Razón |
|---|---|
| Canvas con `position:absolute` | Rompe el ciclo de resize/zoom. El canvas nunca expande su contenedor |
| `flex:1 1 0%` en `.chart-inner` | Permite que el contenedor se encoja correctamente con zoom out |
| `minmax(0,1fr)` en `.kpi-grid` | Evita overflow horizontal por min-content de las celdas |
| `visualViewport.resize` para zoom | `matchMedia('resolution')` no detecta zoom de página |
| Sin carga automática del Excel | Dashboard arranca instantáneo, datos bajo demanda |
| `.chart-series` sin swatch | Textos coloreados por categoría — más compacto y elegante |
| Grid 24%-38%-38% | KPI panel ocupa 2 filas, gráficos maximizados |

---

## ⚠️ Consideraciones para futuras modificaciones

- **No duplicar clases CSS** — causa bugs de cascada.
- **No usar PowerShell con regex en HTML** — corrompe encoding.
- **`position:absolute` en canvas es crítico** — eliminarlo reintroduce loops de zoom.
- **`minmax(0,1fr)` es esencial** — `1fr` solo causa overflow horizontal.
- **app.js es monolítico (~2000 líneas)** — considerar refactorizar en módulos.
- **El Excel tiene posiciones de celda hardcodeadas** — si cambia la estructura, actualizar `excelLoader.js`.

---

## 📂 Documentación

| Archivo | Contenido |
|---|---|
| `docs/DEV_NOTES.md` | Este archivo — contexto general |
| `docs/ARCHITECTURE.md` | Estructura, dependencias, flujos, diagramas |
| `docs/CHANGELOG.md` | Historial de funcionalidades |
| `docs/TODO.md` | Pendientes priorizados |
| `docs/CONTRIBUTING.md` | Reglas para modificaciones |
