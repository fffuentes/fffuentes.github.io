/* helpers.js
   Utilidades comunes: formateo de moneda/fechas, safeGet, parseNumber
*/
(function(){

  function formatCurrencyGTQ(value){
    try{
      return value.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' });
    } catch(e){
      return 'Q ' + Number(value || 0).toLocaleString();
    }
  }

  function formatCurrencyMillion(value){
    const num = Number(value || 0);
    return 'Q ' + (num / 1000000).toFixed(2) + ' MM';
  }

  function formatDateTime(dt){
    const fecha = dt.toLocaleDateString('es-GT');
    const hora = dt.toLocaleTimeString('es-GT');
    return `${fecha}<br>${hora}`;
  }

  function parseNumber(v){
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function safeGet(obj, path, defaultVal){
    if(!path) return obj === undefined ? defaultVal : obj;
    const parts = path.split('.');
    let cur = obj;
    for(const p of parts){
      if(cur == null) return defaultVal;
      cur = cur[p];
    }
    return cur === undefined ? defaultVal : cur;
  }

  window.Helpers = {
    formatCurrencyGTQ,
    formatCurrencyMillion,
    formatDateTime,
    parseNumber,
    safeGet
  };

})();
