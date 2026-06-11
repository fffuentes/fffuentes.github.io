/* Centralized Chart.js configuration
   charts/chartConfig.js
   Exporta window.ChartConfig con paleta y funciones para construir opciones.
*/
(function(){
  const palette = {
    primary: "#4da3ff",
    danger: "#ef4444",
    success: "#84cc16",
    purple: "#8b5cf6",
    dark: "#173c73",
    gold: "#ffcc00"
  };

  const defaults = {
    responsive: true,
    // Prefer preserving aspect ratio by default; per-chart overrides handled by factory.
    maintainAspectRatio: true,
    aspectRatio: 1.6, // sensible default for bar/line/mixed charts
    interaction: { mode: 'nearest', intersect: true },
    plugins: {
      legend: { labels: { color: "white" } },
      tooltip: {
        position: 'nearest',
        titleColor: "white",
        bodyColor: "white",
        backgroundColor: "rgba(0,0,0,0.8)"
      }
    },
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.05)" }
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.05)" }
      }
    },
    elements: {
      line: { tension: 0.3 }
    }
  };

  function isObject(item){
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  function mergeDeep(target, source){
    for(const key in source){
      if(isObject(source[key])){
        if(!target[key]) target[key] = {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  function buildOptions(overrides){
    const base = JSON.parse(JSON.stringify(defaults));
    if(overrides && typeof overrides === 'object'){
      return mergeDeep(base, overrides);
    }
    return base;
  }

  // If Chart.js is present, set global defaults per-type and register a small plugin to force resize after init
  if(window.Chart){
    try{
      Chart.defaults.responsive = true;
      Chart.defaults.maintainAspectRatio = true;
      Chart.defaults.aspectRatio = 1.6;
      // per-type aspect ratios
      if(Chart.defaults.doughnut) Chart.defaults.doughnut.aspectRatio = 1;
      if(Chart.defaults.pie) Chart.defaults.pie.aspectRatio = 1;
      if(Chart.defaults.bar) Chart.defaults.bar.aspectRatio = 1.6;
      if(Chart.defaults.line) Chart.defaults.line.aspectRatio = 1.6;

      // plugin to ensure charts recalc pixel size after initialization
      const forceResizePlugin = {
        id: 'forceResizeAfterInit',
        afterInit: function(chart){
          requestAnimationFrame(()=>{
            try{ chart.resize(); }catch(e){/* ignore */}
          });
        }
      };

      Chart.register(forceResizePlugin);
    }catch(e){ console.warn('ChartConfig: could not set global Chart defaults', e); }
  }

  // Exponer en el scope global para uso inmediato sin sistema de módulos
  window.ChartConfig = {
    palette,
    defaults,
    buildOptions
  };

})();
