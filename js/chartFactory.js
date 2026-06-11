/* chartFactory.js
   Small factory that wraps Chart.js constructor using ChartConfig.defaults
*/
(function(){
  function getElement(el){
    if(typeof el === 'string') return document.getElementById(el);
    return el;
  }

  function createChart(elOrId, type, data, optionsOverride){
    const el = getElement(elOrId);
    if(!el){
      console.error('ChartFactory: element not found', elOrId);
      return null;
    }

    // build options from ChartConfig (merge defaults)
    const options = (window.ChartConfig && typeof window.ChartConfig.buildOptions === 'function')
      ? window.ChartConfig.buildOptions(optionsOverride)
      : (optionsOverride || {});

    // Apply sensible per-type aspectRatio if not explicitly provided
    if(typeof options.maintainAspectRatio === 'undefined'){
      options.maintainAspectRatio = true;
    }
    if(typeof options.aspectRatio === 'undefined'){
      const lowerType = (type || '').toString().toLowerCase();
      if(lowerType === 'doughnut' || lowerType === 'pie'){
        options.aspectRatio = 1; // square for circular charts
      } else {
        options.aspectRatio = 1.6; // wider for bar/line/mixed charts
      }
    }

    // ensure parent is positioned so Chart.js can size canvas reliably
    if(el.parentElement && getComputedStyle(el.parentElement).position === 'static'){
      el.parentElement.style.position = 'relative';
    }

    const chart = new Chart(el, { type, data, options });
    // Ensure Chart.js recalculates pixel size after DOM/CSS settle
    requestAnimationFrame(()=>{
      try{ chart.resize(); }catch(e){ /* safe fallback */ }
    });
    return chart;
  }

  window.ChartFactory = {
    createChart
  };
})();
