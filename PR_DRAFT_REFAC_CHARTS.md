# PR: Refactor charts - centralize config and factory (Draft)

Resumen

Refactor para centralizar configuración de Chart.js y eliminar duplicación en la creación de gráficos. No se aplican cambios funcionales en este PR: es un PR de preparación con el plan y los archivos esqueleto a implementar en sucesivos commits.

Cambios propuestos

1) charts/chartConfig.js (nuevo)
   - Exportar opciones globales, paleta de colores y utilidades comunes para Chart.js.

2) js/helpers.js (nuevo)
   - Funciones utilitarias: formatCurrency, formatDate, safeGet, parseNumber.

3) js/chartFactory.js (nuevo)
   - Función createChart(ctx, type, data, optsKey) que combina chartConfig con overrides.

4) js/app.js (modificar)
   - Reemplazar bloques repetidos que crean charts por llamadas a chartFactory.
   - Mantener API pública y tests de comportamiento.

5) README.md (actualizar)
   - Notas de migración y cómo usar chartFactory.

Checklist

- [ ] Añadir chartConfig.js con defaults
- [ ] Implementar chartFactory.js
- [ ] Extraer helpers.js
- [ ] Refactorizar app.js usando la fábrica
- [ ] Añadir tests y CI

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
