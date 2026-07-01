# 📋 CHANGELOG — Control Tower de Repuestos

> Historial de cambios agrupados por funcionalidad. No se listan commits individuales.

---

## Dashboard Inicial
- Estructura HTML base con 3 tabs: Resumen Global, Resumen MRP, Análisis SKU
- Tema oscuro "Excel Premium" con CSS Grid
- Carga de datos desde Excel estático (`data/Control_Rotacion_Repuestos_SKU.xlsx`)
- Chart.js para gráficos (doughnut, bar, combo bar+line Pareto)
- SheetJS (xlsx) para parseo del Excel
- Font Awesome 6.7.2 para iconos

---

## Resumen Global
- 4 KPIs: Rotación Global, SKU Totales, Inventario Total, SKU Sin Rotación
- 4 gráficos: Doughnut SKU Rotación, Bar Inventario, Doughnut Antigüedad Uso, Bar Antigüedad GTQ
- Layout original: grid 28%-36%-36%, 2 filas asimétricas

---

## Resumen MRP
- KPIs específicos para materiales MRP (consumo anual, inventario MRP)
- Misma estructura de gráficos que Resumen Global
- Badges de clasificación dinámicos (verde/amarillo/rojo)

---

## Análisis SKU
- 6 KPI cards compactas en 1 fila (`repeat(6, minmax(0,1fr))`)
- Gráfico Pareto (barras + línea acumulada + línea objetivo 80%)
- Panel de Riesgos Detectados con 3 tarjetas
- Buscador SKU con filtrado en tiempo real
- Tablas Top 20: Inventario, Sin Rotación, Obsolescencia
- Layout 2 columnas en `.analisis-container`

---

## Layout Dashboard Ejecutivo
- Reorganización a 3 columnas uniformes (24%-38%-38%)
- KPI panel ocupa 2 filas en columna izquierda
- Doughnuts en columna central, barras en columna derecha
- `.chart-series` ultra-compacto (sin swatch, textos coloreados por categoría)

---

## KPI Cards
- Íconos Font Awesome con color por categoría (azul, púrpura, verde, rojo, amarillo)
- Subtítulos explicativos bajo cada valor
- Grid interno: ícono (52px) + texto (1fr)
- Badges de clasificación dinámicos vía JS

---

## Correcciones de Zoom y Resize
- **Problema**: Crecimiento exponencial de gráficas al hacer zoom
- **Causa**: CSS `height:340px !important` + canvas sin `position:absolute`
- **Solución**: canvas con `position:absolute`, `.chart-inner` con `flex:1 1 0%`, `requestAnimationFrame` en resize, `visualViewport.resize` para zoom bidireccional
- Grid `minmax(0,1fr)` para evitar overflow horizontal

---

## Legibilidad (a11y)
- Textos Chart.js en blanco puro (`#FFFFFF`)
- Leyendas semibold, ejes con jerarquía de peso
- Grid lines casi invisibles (8% opacidad)

---

## Eliminación de Carga Automática
- El Excel ya no se carga al abrir la página
- Dashboard muestra `--` en todos los KPIs
- El botón "Actualizar" carga los datos bajo demanda

---

## Panel de Estado
- Panel `#panelEstado` en el centro del header
- Muestra "Dashboard preparado" cuando no hay datos
- Ícono 📊 + título + descripción

---

## Responsive Móvil (<768px)
- Tablas apiladas en 1 columna
- Sin scroll interno en tablas
- Fuentes y padding reducidos
- `.analisis-container` → `1fr`

---

## GitHub Pages
- Desplegado en `https://fffuentes.github.io`
- Rama `main` = producción
