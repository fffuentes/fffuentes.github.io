// =====================================================
// CHART CONFIG — defaults + series-legend builder
// =====================================================

// --- Chart.js global defaults ---
if (window.Chart) {
  try {
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    // Per-type aspect ratios
    if (Chart.defaults.doughnut) Chart.defaults.doughnut.aspectRatio = 1;
    if (Chart.defaults.pie)      Chart.defaults.pie.aspectRatio = 1;
    if (Chart.defaults.bar)      Chart.defaults.bar.aspectRatio = 1.6;
    if (Chart.defaults.line)     Chart.defaults.line.aspectRatio = 1.6;

    // Layout padding so legends/ticks are not clipped
    Chart.defaults.layout = Chart.defaults.layout || {};
    Chart.defaults.layout.padding = Object.assign(
      { top: 8, right: 8, bottom: 8, left: 8 },
      Chart.defaults.layout.padding || {}
    );

    // Default legend position
    Chart.defaults.plugins = Chart.defaults.plugins || {};
    Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
    Chart.defaults.plugins.legend.position =
      Chart.defaults.plugins.legend.position || 'bottom';

    // --- High-contrast text for dark dashboard theme ---
    // Global text color (ticks, labels, tooltips, title)
    Chart.defaults.color = '#FFFFFF';

    // Legend labels: white + semibold
    Chart.defaults.plugins.legend.labels.color = '#FFFFFF';
    Chart.defaults.plugins.legend.labels.font =
      Chart.defaults.plugins.legend.labels.font || {};
    Chart.defaults.plugins.legend.labels.font.weight = '600';

    // Axis ticks: white semibold (categories) / medium (numeric)
    Chart.defaults.scales = Chart.defaults.scales || {};
    if (!Chart.defaults.scales.x) Chart.defaults.scales.x = {};
    if (!Chart.defaults.scales.x.ticks) Chart.defaults.scales.x.ticks = {};
    Chart.defaults.scales.x.ticks.font =
      Chart.defaults.scales.x.ticks.font || {};
    Chart.defaults.scales.x.ticks.font.weight = '500';
    if (!Chart.defaults.scales.y) Chart.defaults.scales.y = {};
    if (!Chart.defaults.scales.y.ticks) Chart.defaults.scales.y.ticks = {};
    Chart.defaults.scales.y.ticks.font =
      Chart.defaults.scales.y.ticks.font || {};
    Chart.defaults.scales.y.ticks.font.weight = '600';

    // Grid lines: subtle, not competing with data
    Chart.defaults.scales.x.grid =
      Chart.defaults.scales.x.grid || {};
    Chart.defaults.scales.x.grid.color = 'rgba(255,255,255,0.08)';
    Chart.defaults.scales.y.grid =
      Chart.defaults.scales.y.grid || {};
    Chart.defaults.scales.y.grid.color = 'rgba(255,255,255,0.08)';
  } catch (e) {
    console.warn('chartConfig defaults failed', e);
  }
}


// --- Chart constructor wrapper: auto-generates .chart-series legend ---
(function () {
  if (!window.Chart) return;

  var OriginalChart = window.Chart;

  function ChartWrapper(el, config) {
    // Clean any leftover inline sizing from previous chart instances
    var canvas =
      (el && el.canvas) ? el.canvas :
      (typeof el === 'string' ? document.getElementById(el) : el);
    if (canvas) {
      try {
        canvas.style.removeProperty('height');
        canvas.style.removeProperty('width');
        canvas.removeAttribute('height');
        canvas.removeAttribute('width');
      } catch (e) {}
    }

    var instance = new OriginalChart(el, config);

    // Build .chart-series legend below the chart
    buildSeriesLegend(instance, el, config);

    return instance;
  }

  // --- Build compact series summary below the canvas ---
  function buildSeriesLegend(instance, el, config) {
    try {
      var c = (instance && instance.canvas)
        ? instance.canvas
        : (typeof el === 'string' ? document.getElementById(el) : el);
      var data = (config && config.data)
        ? config.data
        : (instance && instance.data) ? instance.data : null;
      var parent = c && c.closest
        ? (c.closest('.chart-inner') || c.parentElement)
        : (c ? c.parentElement : null);

      if (!parent || !data || !Array.isArray(data.labels) || !data.labels.length) return;

      var series = parent.querySelector('.chart-series');
      if (!series) {
        series = document.createElement('div');
        series.className = 'chart-series';
        parent.appendChild(series);
      } else {
        series.innerHTML = '';
      }

      // Move series after chart container in the panel
      try {
        var containerParent = parent && parent.parentElement ? parent.parentElement : null;
        if (containerParent) {
          if (parent.nextSibling) {
            containerParent.insertBefore(series, parent.nextSibling);
          } else {
            containerParent.appendChild(series);
          }
        } else if (parent && parent.lastChild !== series) {
          parent.appendChild(series);
        }
      } catch (e) {}

      var labels = data.labels;
      var ds = (data.datasets && data.datasets[0]) ? data.datasets[0] : null;
      var values = ds ? (ds.data || []) : [];
      var colors = ds ? (ds.backgroundColor || []) : [];
      var type = (config && config.type) || (instance && instance.config && instance.config.type) || '';

      var total = 0;
      if (type === 'doughnut' || type === 'pie') {
        total = values.reduce(function (a, b) { return a + (+b || 0); }, 0);
      }

      labels.forEach(function (label, i) {
        try {
          var val = values[i] || 0;
          var color = colors[i] || 'transparent';

          var item = document.createElement('div');
          item.className = 'series-item';

          var sw = document.createElement('span');
          sw.className = 'series-swatch';
          sw.style.background = color;

          var lab = document.createElement('span');
          lab.className = 'series-label';
          lab.textContent = label;

          var valEl = document.createElement('span');
          valEl.className = 'series-value';
          if (type === 'doughnut' || type === 'pie') {
            var pct = total ? ((val / total) * 100).toFixed(1) + '%' : '0%';
            valEl.textContent = pct + ' (' + (val || 0).toLocaleString() + ')';
          } else {
            valEl.textContent = (val || 0).toLocaleString();
          }

          item.appendChild(sw);
          item.appendChild(lab);
          item.appendChild(valEl);
          series.appendChild(item);
        } catch (e) {}
      });
    } catch (e) { /* non-critical */ }
  }

  // Copy static properties and prototype from original Chart
  Object.keys(OriginalChart).forEach(function (k) {
    try { ChartWrapper[k] = OriginalChart[k]; } catch (e) {}
  });
  ChartWrapper.prototype = OriginalChart.prototype;
  window.Chart = ChartWrapper;
})();

