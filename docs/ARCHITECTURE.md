# 🏗️ ARCHITECTURE.md — Control Tower de Repuestos

> Última actualización: 2026-07-01

---

## Estructura de Carpetas

```
fffuentes.github.io/
├── index.html              ← HTML estático. 3 tabs, header, carga de CDNs y scripts
├── docs/                   ← Documentación del proyecto
│   ├── DEV_NOTES.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── TODO.md
│   └── CONTRIBUTING.md
├── css/
│   └── styles.css          ← Tema oscuro "Excel Premium", ~870 líneas. Sin frameworks CSS
├── js/
│   ├── app.js              ← Núcleo: tabs, gráficos, KPIs, Pareto, resize handlers (~2000 líneas)
│   ├── excelLoader.js      ← Fetch + parseo del Excel con SheetJS. 3 funciones de procesamiento
│   ├── chartFactory.js     ← Placeholder (vacío)
│   └── helpers.js          ← Placeholder (vacío)
├── charts/
│   └── chartConfig.js      ← Chart.js global defaults + wrapper constructor (auto .chart-series)
├── data/
│   └── Control_Rotacion_Repuestos_SKU.xlsx  ← Única fuente de datos
├── assets/                 ← Vacío (reservado para imágenes/iconos)
└── dev-tests/              ← Vacío (reservado para pruebas)
```

---

## Responsabilidad de cada archivo

| Archivo | Rol | Dependencias |
|---|---|---|
| `index.html` | Estructura DOM. Header, 3 tabs, paneles, scripts | `styles.css`, CDNs, `chartConfig.js`, `excelLoader.js`, `app.js` |
| `css/styles.css` | 100% del estilo visual. Variables CSS, grid, flex, responsive | Ninguna |
| `js/app.js` | Lógica de UI: tabs, fecha, botón Actualizar, creación de gráficos, KPIs, Pareto, tablas, resize/zoom | `Chart` (global), `cargarExcel()` (excelLoader), `dashboardData` (global) |
| `js/excelLoader.js` | `cargarExcel()` → fetch + XLSX.read + 3 procesadores | `XLSX` (CDN), `dashboardData` (global en app.js) |
| `charts/chartConfig.js` | `Chart.defaults` globales + monkey-patch del constructor `Chart` | `Chart` (CDN) |
| `data/*.xlsx` | Datos estáticos. 3 hojas: Resumen, Resumen MRP, Rotación_SKU | Ninguna (leído por excelLoader.js) |

---

## Dependencias entre módulos

```mermaid
flowchart TD
    HTML["index.html"] --> CSS["styles.css"]
    HTML --> FA["Font Awesome CDN"]
    HTML --> CHART["Chart.js CDN"]
    HTML --> CC["charts/chartConfig.js"]
    HTML --> XLSX["SheetJS CDN"]
    HTML --> EL["js/excelLoader.js"]
    HTML --> APP["js/app.js"]

    CC --> CHART
    CHART --> CC
    EL --> XLSX
    APP --> CHART
    APP --> EL
    EL --> APP
```

- `chartConfig.js` se carga antes que `app.js` → configura Chart.js antes de usarlo
- `excelLoader.js` se carga antes que `app.js` → `cargarExcel()` existe cuando se necesita
- `app.js` y `excelLoader.js` comparten `dashboardData` (objeto global)

---

## Flujo de ejecución

```mermaid
sequenceDiagram
    participant Browser
    participant HTML
    participant chartConfig
    participant excelLoader
    participant app

    Browser->>HTML: Cargar página
    HTML->>chartConfig: Ejecutar (configura Chart.defaults + wrapper)
    HTML->>excelLoader: Registrar funciones (cargarExcel, procesar*)
    HTML->>app: Ejecutar
    app->>app: DOMContentLoaded
    app->>app: iniciarTabs() + actualizarFecha()
    Note over app: NO carga Excel automáticamente
    Note over app: Dashboard muestra "--" en todos los KPIs

    Browser->>app: Usuario hace clic en "Actualizar"
    app->>excelLoader: await cargarExcel()
    excelLoader->>Excel: fetch(data/Control_Rotacion_Repuestos_SKU.xlsx)
    excelLoader->>excelLoader: XLSX.read() → workbook
    excelLoader->>excelLoader: procesarResumen() → dashboardData.resumen
    excelLoader->>excelLoader: procesarMRP() → dashboardData.mrp
    excelLoader->>excelLoader: procesarRotacionSKU() → dashboardData.rotacionSKU
    app->>app: crearGraficosResumen() → 4 gráficos Chart.js
    app->>app: crearGraficosMRP() → 4 gráficos Chart.js
    app->>app: cargarAnalisisSKU() → KPIs + Pareto + tablas
```

---

## Flujo de carga del Excel

```mermaid
flowchart LR
    A["Click 'Actualizar'"] --> B["cargarExcel()"]
    B --> C["fetch('data/...xlsx?v=timestamp')"]
    C --> D["XLSX.read(arrayBuffer)"]
    D --> E["dashboardData.workbook"]
    E --> F["procesarResumen()"]
    E --> G["procesarMRP()"]
    E --> H["procesarRotacionSKU()"]
    F --> I["dashboardData.resumen"]
    G --> J["dashboardData.mrp"]
    H --> K["dashboardData.rotacionSKU"]
```

### Hojas del Excel

| Hoja | Datos extraídos | Columnas clave |
|---|---|---|
| `Resumen` | KPIs globales | Rotación, clasificación, SKU total, inventario, antigüedad |
| `Resumen MRP` | KPIs filtrados a MRP | Igual que Resumen + consumo anual |
| `Rotación_SKU` | ~3400 filas detalle | SKU, descripción, inventario, consumo, fechas, clasificación, MRP |

Cada hoja se lee con `XLSX.utils.sheet_to_json(hoja, { header: 1 })` (formato array de arrays). Las posiciones de celda están hardcodeadas (ej. `datos[0][1]`).

---

## Flujo de renderizado de KPIs

```mermaid
flowchart TD
    A["dashboardData.resumen"] --> B["actualizarKPIsResumen()"]
    A2["dashboardData.mrp"] --> C["actualizarKPIsMRP()"]
    D["dashboardData.rotacionSKU"] --> E["cargarKPIsSKU()"]

    B --> B1["document.getElementById().innerText = valor"]
    C --> C1["document.getElementById().innerText = valor"]
    E --> E1["Cálculos: total, sinRotacion, valorSinRotacion, MRP, obsolescencia"]

    B --> B2["Asignar clase CSS dinámica al badge: success/warning/danger"]
    C --> C2["Asignar clase CSS dinámica al badge: success/warning/danger"]
```

Los KPIs se actualizan por `innerText` directo sobre elementos con ID. Los badges de clasificación (Alta/Media/Baja) reciben clase CSS dinámica.

---

## Flujo de renderizado de gráficas

```mermaid
flowchart TD
    A["crearGraficosResumen()"] --> A1["crearPieRotacionResumen() → doughnut"]
    A --> A2["crearInventarioResumen() → bar horizontal"]
    A --> A3["crearAntiguedadUsoResumen() → doughnut"]
    A --> A4["crearAntiguedadGTQResumen() → bar horizontal"]

    B["crearGraficosMRP()"] --> B1["crearPieRotacionMRP() → doughnut"]
    B --> B2["crearInventarioMRP() → bar horizontal"]
    B --> B3["crearAntiguedadUsoMRP() → doughnut"]
    B --> B4["crearAntiguedadGTQMRP() → bar horizontal"]

    C["cargarAnalisisSKU()"] --> C1["crearParetoInventario() → bar + line combo"]

    A1 --> CHART["new Chart(ctx, config) → chartConfig.js wrapper"]
    CHART --> SERIES["buildSeriesLegend() → .chart-series HTML"]
```

Cada gráfico se crea con `new Chart(ctx, config)`. El wrapper en `chartConfig.js` intercepta el constructor y añade automáticamente el bloque `.chart-series` debajo de cada gráfico.

---

## Flujo de renderizado de tablas

```mermaid
flowchart TD
    A["cargarAnalisisSKU()"] --> B["cargarTopInventario()"]
    A --> C["cargarTopSinRotacion()"]
    A --> D["cargarTopObsolescencia()"]
    A --> E["iniciarBuscadorSKU()"]

    B --> F["Filtrar dashboardData.rotacionSKU → sort por inventario → top 20"]
    C --> G["Filtrar claseValor='Sin rotación' → sort → top 20"]
    D --> H["Filtrar antiguedad='Mayor 5 años' → sort → top 20"]

    F --> I["Generar HTML <table class='tabla-sku'>"]
    G --> I
    H --> I
    I --> J["element.innerHTML = html"]

    E --> K["input.addEventListener('input') → refiltrar las 3 tablas"]
```

Las tablas se generan como strings HTML y se insertan vía `innerHTML`. El buscador refiltra las 3 tablas simultáneamente.
