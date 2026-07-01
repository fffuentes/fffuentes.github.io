# 🤝 CONTRIBUTING.md — Guía para modificaciones

> Reglas y convenciones para mantener la estabilidad del proyecto.

---

## Reglas Generales

1. **No romper el responsive.** Todo cambio debe verificarse en ≥3 tamaños: 1920px, 768px, 375px.
2. **No modificar Chart.js sin justificación.** Cualquier cambio en `charts/chartConfig.js` o en opciones de gráficos requiere explicación del riesgo.
3. **No duplicar clases CSS.** Si una clase ya existe en `styles.css`, reutilizarla. Los duplicados causan bugs de cascada difíciles de detectar.
4. **Mantener separación HTML/CSS/JS.** No usar estilos inline excepto para colores de íconos KPI.
5. **No usar PowerShell con regex en HTML.** Usar `replace_string_in_file` para ediciones. PowerShell corrompe encoding y estructura.

---

## Antes de modificar CSS

- Verificar que no exista otra regla con el mismo selector (riesgo de cascada)
- Usar `#analisis .clase` para cambios scoped al tab de análisis
- Probar en tema oscuro (el único tema existente)
- Verificar que `.chart-inner` y `.chart-inner canvas` no se modifiquen sin entender el sistema de zoom

---

## Antes de modificar JS

- `app.js` es monolítico (~2000 líneas). Preferir añadir al final del archivo.
- No duplicar funciones. Si existe `resizeAllCharts()`, no crear otra.
- Las funciones que modifican el DOM deben verificar que el elemento existe.
- El objeto global `dashboardData` es compartido entre `app.js` y `excelLoader.js`.

---

## Antes de modificar HTML

- Los 3 tabs (`#resumen`, `#mrp`, `#analisis`) comparten clases CSS. Cambios en estructura HTML deben ser compatibles con los 3.
- No eliminar IDs usados por JS (`rotacionGlobal`, `chartSkuRotacion`, `panelRiesgos`, etc.)
- Los placeholders `--` en KPIs son intencionales (estado inicial sin datos).

---

## Riesgos conocidos

| Acción | Riesgo |
|---|---|
| Cambiar `grid-template-columns` en `.kpi-grid` sin `minmax(0,1fr)` | Overflow horizontal |
| Eliminar `position:absolute` en `.chart-inner canvas` | Loop de resize/zoom |
| Cambiar `flex:1 1 0%` en `.chart-inner` | Contenedores no se encogen con zoom out |
| Crear segunda regla `.kpi-card` | Conflicto de cascada |
| Usar `matchMedia('resolution')` para zoom | No funciona — usar `visualViewport` |

---

## Convenciones

- **Commits**: conventional commits en español (`feat:`, `fix:`, `docs:`, `chore:`)
- **Ramas**: `main` (producción), feature branches para desarrollo
- **CSS**: variables CSS en `:root` para colores
- **JS**: `function nombre()` sin arrow functions para compatibilidad
- **HTML**: indentación con 4 espacios, comentarios `<!-- -->` para secciones

---

## Flujo de trabajo recomendado

1. Crear rama desde `main`
2. Implementar cambios
3. Probar en escritorio (1920px) y móvil (375px)
4. Verificar zoom (Ctrl+/-) no rompe gráficas
5. Verificar botón "Actualizar" sigue funcionando
6. Commit + push + merge a main
