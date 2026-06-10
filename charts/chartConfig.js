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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "white" }
      },
      tooltip: {
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

  // Exponer en el scope global para uso inmediato sin sistema de módulos
  window.ChartConfig = {
    palette,
    defaults,
    buildOptions
  };

})();
