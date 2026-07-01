# 📝 TODO — Control Tower de Repuestos

---

## 🔴 Alta Prioridad

- [ ] **Actualizar panel de estado al cargar datos** — `#panelEstado` debe cambiar su mensaje cuando el Excel se carga exitosamente
- [ ] **Mensaje de error en panel de estado** — Si falla la carga del Excel, mostrar error en `#panelEstado` en vez de `alert()`
- [ ] **Responsive de tabs Resumen Global y MRP** — Actualmente solo Análisis SKU tiene adaptación móvil completa
- [ ] **Tooltips de Chart.js en móvil** — Verificar que no se corten en pantallas pequeñas

---

## 🟡 Media Prioridad

- [ ] **Refactorizar `app.js`** — ~2000 líneas. Separar en módulos: `charts.js`, `kpis.js`, `tables.js`, `tabs.js`
- [ ] **Migrar datos a API/JSON** — El Excel estático requiere despliegue manual. Una API permitiría actualizaciones en tiempo real
- [ ] **Selector de archivo Excel** — Permitir al usuario cargar su propio archivo en vez del estático
- [ ] **Indicador de carga** — Spinner o progress bar mientras se procesa el Excel
- [ ] **Cache de datos** — Evitar re-fetch del Excel si los datos no cambiaron (usar ETag o timestamp del archivo)
- [ ] **Accesibilidad (ARIA)** — Roles, keyboard navigation, screen reader support

---

## 🟢 Baja Prioridad

- [ ] **Exportar a PDF** — Botón para descargar el dashboard como PDF
- [ ] **Tema claro** — Alternativa al tema oscuro
- [ ] **Internacionalización (i18n)** — Soporte para inglés
- [ ] **Animaciones de transición** — Entre tabs, al cargar datos
- [ ] **Persistencia de estado** — Recordar último tab activo y datos en localStorage
- [ ] **Tests automatizados** — Unit tests para funciones de procesamiento de datos
- [ ] **PWA** — Service worker para funcionamiento offline
- [ ] **Favicon** — Ícono personalizado en la pestaña del navegador
