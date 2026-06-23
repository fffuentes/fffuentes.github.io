# 📋 DEV NOTES — Control Tower de Repuestos

> Última actualización: 2026-06-23  
> Rama activa: `responsive-mobile`

---

## 🏗️ Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla ES6+) |
| Gráficos | Chart.js (CDN) |
| Datos | SheetJS/xlsx — carga de Excel estático |
| Íconos | Font Awesome 6.7.2 |
| Hosting | GitHub Pages (fffuentes.github.io) |

---

## 🌳 Ramas

| Rama | Propósito | Estado |
|---|---|---|
| `main` | Producción | ✅ Deployed |
| `Coorecciones-visuales` | Zoom, layout, KPI cards, chart-series | ✅ Merged |
| `responsive-mobile` | Adaptación móvil (<768px) | 🔧 Activa |
| `backup/feat/refactor-charts-*` | Backup histórico | 📦 Archivo |
| `pre-reset-20260611-*` | Backup pre-reset accesibilidad | 📦 Archivo |

---

## 📂 Estructura

```
fffuentes.github.io/
├── index.html              ← HTML estático (3 tabs)
├── css/styles.css          ← Tema oscuro (~870 líneas)
├── js/
│   ├── app.js              ← Lógica principal (~2000 líneas)
│   ├── excelLoader.js      ← Carga y parseo Excel
│   ├── chartFactory.js     ← Placeholder (vacío)
│   └── helpers.js          ← Placeholder (vacío)
├── charts/
│   └── chartConfig.js      ← Chart.js defaults + wrapper .chart-series
├── data/
│   └── Control_Rotacion_Repuestos_SKU.xlsx
└── README.md
```

---

## 🔧 Correcciones Clave

### Zoom Loop (arreglado)
- **Causa**: `canvas { height:340px !important }` + `maintainAspectRatio:false` + canvas sin `position:absolute`
- **Fix**: canvas con `position:absolute` + `.chart-inner` con `flex:1 1 0%` + `visualViewport.resize`
- **Commits**: `fecb8a0`, `23ab93d`, `1d35d02`, `3270436`

### Layout Dashboard (arreglado)
- Grid 3 columnas: KPI 24% | Donuts 38% | Barras 38%
- `.chart-series` compacto: sin swatch, textos coloreados por categoría
- KPI cards: grid ícono+texto con Font Awesome multicolor

### Análisis SKU (arreglado)
- `.kpi-grid`: `repeat(6, minmax(0,1fr))` ← el `minmax(0)` es **crítico**
- `.analisis-container`: `1fr 1fr` escritorio, `1fr` móvil
- Riesgos + Buscar unificados, Obsolescencia dentro del container

### Badges KPI (arreglado)
- Clasificación dinámica: Alta=verde, Media=amarillo, resto=rojo
- JS en `actualizarKPIsResumen()` y `actualizarKPIsMRP()`

---

## ⚠️ CSS Crítico — NO modificar sin revisar

```css
/* Estos bloques son sensibles — cambios pueden reintroducir bugs */
.chart-inner        { flex:1 1 0%; position:relative; min-height:260px; max-height:70vh }
.chart-inner canvas { position:absolute; width:100% !important; height:100% !important }
.kpi-card           { display:grid; grid-template-columns:52px 1fr } /* UN solo bloque */
.kpi-grid           { grid-template-columns:repeat(6, minmax(0,1fr)) } /* minmax(0) esencial */
```

---

## 📱 Responsive (<768px)

```css
.analisis-container { grid-template-columns: 1fr }
.panel-tabla        { max-height: none; overflow-y: visible }
.tabla-sku          { font-size: 0.75rem }
.tabla-sku td       { padding: 5px 8px }
```

---

## 📊 Datos del Excel

| Hoja | Contenido |
|---|---|
| Resumen | KPIs globales: rotación, SKU, inventario, antigüedad |
| Resumen MRP | KPIs filtrados a materiales MRP |
| Rotación_SKU | ~3400 filas: SKU, descripción, inventario, consumo, fechas, clasificación, MRP |

---

## 🧠 Lecciones Aprendidas

1. **`1fr` sin `minmax(0,1fr)`** → overflow horizontal por min-content de las celdas
2. **`height:100%` en canvas con padre sin height** → height=auto → loop infinito
3. **`position:absolute` en canvas** → rompe ciclo contenedor-canvas
4. **PowerShell + regex en HTML** → corrompe encoding y estructura. Usar `replace_string_in_file`
5. **`matchMedia('resolution')`** NO detecta zoom. Usar `window.visualViewport`
6. **CSS duplicado** (misma clase en 2 bloques) → bugs de cascada invisibles
7. **`childElementCount` en DevTools** → diagnóstico rápido de HTML corrupto

---

## 🚧 Pendiente

- [ ] Responsive en tabs Resumen Global y MRP
- [ ] Accesibilidad (ARIA, keyboard nav)
- [ ] Refactorizar app.js (~2000 líneas)
- [ ] Migrar a API/JSON para datos en tiempo real
