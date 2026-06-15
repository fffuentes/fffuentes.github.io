// Chart sizing defaults to avoid oval donuts, clipped legends and tooltip misplacement
if(window.Chart){
  try{
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false; // allow charts to fill container
    Chart.defaults.aspectRatio = 1.6; // sensible default for bar/line
    // per-type overrides
    if(Chart.defaults.doughnut) Chart.defaults.doughnut.aspectRatio = 1;
    if(Chart.defaults.pie) Chart.defaults.pie.aspectRatio = 1;
    if(Chart.defaults.bar) Chart.defaults.bar.aspectRatio = 1.6;
    if(Chart.defaults.line) Chart.defaults.line.aspectRatio = 1.6;

    // default layout padding so legends/ticks are not clipped
    Chart.defaults.layout = Chart.defaults.layout || {};
    Chart.defaults.layout.padding = Object.assign({ top:8, right:8, bottom:8, left:8 }, Chart.defaults.layout.padding || {});

    // default legend position when not provided
    Chart.defaults.plugins = Chart.defaults.plugins || {};
    Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
    Chart.defaults.plugins.legend.position = Chart.defaults.plugins.legend.position || 'bottom';

    // small plugin to ensure charts recalc pixel size after init
    const __forceResizePlugin = {
      id: 'forceResizeAfterInit',
      afterInit: function(chart){
        // delayed resize only to avoid immediate layout thrash
        setTimeout(()=>{ try{ chart.resize(); }catch(e){} }, 80);
      }
    };
    try{ Chart.register(__forceResizePlugin); }catch(e){/* Chart may auto-register in older versions */}
  }catch(e){ console.warn('chartConfig sizing defaults failed', e); }
}



// === Chart constructor wrapper to force canvas sizing ===
(function(){
  if(!window.Chart) return;
  try{
    const OriginalChart = window.Chart;
    function ChartWrapper(el, config){
      try{
        var canvas = (el && el.canvas) ? el.canvas : (typeof el === 'string' ? document.getElementById(el) : el);
        if(canvas && canvas.parentElement){
          var parentH = canvas.parentElement.clientHeight || canvas.parentElement.getBoundingClientRect().height;
          try{
            var current = canvas.clientHeight || (canvas.style && parseInt(canvas.style.height)||0);
            if(parentH && Math.abs(current - parentH) > 4){
              canvas.style.height = parentH + 'px';
            }
          }catch(e){}
        }
      }catch(e){}
      const instance = new OriginalChart(el, config);
      // single delayed resize to allow layout to settle; avoid immediate double-resize which can trigger layout loops
      setTimeout(()=>{ try{ instance.resize(); }catch(e){} }, 80);

      // Build a compact series summary above the canvas using chart data
      try{
        const c = (instance && instance.canvas) ? instance.canvas : ((typeof el === 'string') ? document.getElementById(el) : el);
        const data = (config && config.data) ? config.data : (instance && instance.data) ? instance.data : null;
        const parent = c && c.closest ? (c.closest('.chart-inner') || c.parentElement) : (c ? c.parentElement : null);
        if(parent && data && Array.isArray(data.labels) && data.labels.length){
          let series = parent.querySelector('.chart-series');
          if(!series){
            series = document.createElement('div');
            series.className = 'chart-series';
            // create empty, will ensure correct placement below
            parent.appendChild(series);
          } else {
            series.innerHTML = '';
          }
          // Ensure series is placed after the chart container (so it appears below the chart)
          try {
            const container = parent;
            const containerParent = container && container.parentElement ? container.parentElement : null;
            if (containerParent) {
              // move series to after the container
              if (container.nextSibling) containerParent.insertBefore(series, container.nextSibling);
              else containerParent.appendChild(series);
            } else if (container) {
              if (container.lastChild !== series) container.appendChild(series);
            } else {
              if (!document.body.contains(series)) document.body.appendChild(series);
            }
          } catch(e) {}
          
          
          const labels = data.labels;
          const ds = (data.datasets && data.datasets[0]) ? data.datasets[0] : null;
          const values = ds ? (ds.data || []) : [];
          const colors = ds ? (ds.backgroundColor || []) : [];
          const type = (config && config.type) || (instance && instance.config && instance.config.type) || '';
          let total = 0;
          if(type === 'doughnut' || type === 'pie'){
            total = values.reduce((a,b)=>a+(+b||0),0);
          }
          labels.forEach(function(label, i){
            try{
              const val = values[i] || 0;
              const color = colors[i] || (ds && ds.borderColor && ds.borderColor[i]) || 'transparent';
              const item = document.createElement('div');
              item.className = 'series-item';

              const sw = document.createElement('span');
              sw.className = 'series-swatch';
              sw.style.background = color;

              const lab = document.createElement('span');
              lab.className = 'series-label';
              lab.textContent = label;

              const valEl = document.createElement('span');
              valEl.className = 'series-value';
              if(type === 'doughnut' || type === 'pie'){
                const pct = total ? ((val/total)*100).toFixed(1) + '%' : '0%';
                valEl.textContent = `${pct} (${(val||0).toLocaleString()})`;
              } else {
                valEl.textContent = (val||0).toLocaleString();
              }

              item.appendChild(sw);
              item.appendChild(lab);
              item.appendChild(valEl);

              series.appendChild(item);
            }catch(e){}
          });
        }
      }catch(e){/* non-critical */}

      return instance;
    }
    Object.keys(OriginalChart).forEach(k=>{ try{ ChartWrapper[k]=OriginalChart[k]; }catch(e){} });
    ChartWrapper.prototype = OriginalChart.prototype;
    window.Chart = ChartWrapper;
  }catch(e){ console.warn('Chart wrapper install failed', e); }
})();
