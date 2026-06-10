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

    const options = (window.ChartConfig && typeof window.ChartConfig.buildOptions === 'function')
      ? window.ChartConfig.buildOptions(optionsOverride)
      : (optionsOverride || {});

    return new Chart(el, { type, data, options });
  }

  window.ChartFactory = {
    createChart
  };

})();
