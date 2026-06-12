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
        try{ chart.resize(); }catch(e){}
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
          if(parentH && (!canvas.style.height || canvas.style.height === '')){
            canvas.style.height = parentH + 'px';
          }
        }
      }catch(e){}
      const instance = new OriginalChart(el, config);
      try{ instance.resize(); }catch(e){}
      setTimeout(()=>{ try{ instance.resize(); }catch(e){} }, 120);
      return instance;
    }
    Object.keys(OriginalChart).forEach(k=>{ try{ ChartWrapper[k]=OriginalChart[k]; }catch(e){} });
    ChartWrapper.prototype = OriginalChart.prototype;
    window.Chart = ChartWrapper;
  }catch(e){ console.warn('Chart wrapper install failed', e); }
})();
