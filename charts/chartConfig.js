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
        setTimeout(()=>{ try{ chart.__lastProgrammaticResize = Date.now(); chart.resize(); }catch(e){} }, 80);
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
        // Do not set canvas.style.height here — rely on CSS (.chart-inner) and Chart.js resizing.
        // Setting style.height in response to dynamic measurements caused resize loops when browser zoom changed.
        // Keep layout-controlled sizing (min-height on panel) and trigger chart.resize() on DPR/resize events instead.
        
        
      }catch(e){}
      // clean inline sizing left by earlier runs
      try{ if (canvas) { canvas.style.removeProperty('height'); canvas.style.removeProperty('width'); canvas.removeAttribute('height'); canvas.removeAttribute('width'); } }catch(e){}
      const instance = new OriginalChart(el, config);
      // single delayed resize to allow layout to settle; set a flag to avoid triggering the ResizeObserver loop
      setTimeout(()=>{ try{ instance.__lastProgrammaticResize = Date.now(); instance.resize(); }catch(e){} }, 80);

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

      // Attach ResizeObserver to the chart's panel to trigger resize only when panel actually changes
      try{
        var resizeContainer = c && c.closest ? (c.closest('.chart-panel') || c.closest('.chart-inner') || c.parentElement) : (c ? c.parentElement : null);
        if(window.ResizeObserver && resizeContainer){
          (function(inst, container){
            var timer = null;
            var ro = new ResizeObserver(function(entries){
              try{
                if(!container) return;
                if(container.clientHeight && container.clientHeight > 5000) return; // ignore runaway sizes
              }catch(e){}
              clearTimeout(timer);
              timer = setTimeout(function(){
                try{
                  // ignore observer events caused by our own programmatic resize within short window
                  if(inst && inst.__lastProgrammaticResize && (Date.now() - inst.__lastProgrammaticResize) < 300) return;
                  if(inst && typeof inst.resize === 'function'){
                    inst.__lastProgrammaticResize = Date.now();
                    inst.resize();
                  }
                }catch(e){}
              }, 120);
            });
            try{ ro.observe(container); }catch(e){}
            inst.__ro = ro;
            // patch destroy to disconnect observer
            try{
              var origDestroy = inst.destroy && inst.destroy.bind(inst);
              inst.destroy = function(){
                try{ if(inst.__ro){ inst.__ro.disconnect(); inst.__ro = null; } }catch(e){}
                if(origDestroy) origDestroy();
              };
            }catch(e){}
          })(instance, resizeContainer);
        }
      }catch(e){}

      return instance;
    }
    Object.keys(OriginalChart).forEach(k=>{ try{ ChartWrapper[k]=OriginalChart[k]; }catch(e){} });
    ChartWrapper.prototype = OriginalChart.prototype;
    window.Chart = ChartWrapper;
  }catch(e){ console.warn('Chart wrapper install failed', e); }
})();

