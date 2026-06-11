/* validator.js
   Validación básica del workbook para proteger procesadores frente a cambios de formato.
   Exporta Validator.validateWorkbook(workbook) -> { ok: boolean, errors: [] }
*/
(function(){

  function requireSheets(workbook, sheets){
    const missing = [];
    const names = workbook.SheetNames || [];
    sheets.forEach(s => { if(!names.includes(s)) missing.push(s); });
    return missing;
  }

  function validateResumenSheet(sheet){
    const range = sheet['!ref'];
    if(!range) return ['Sheet Resumen appears empty'];
    return [];
  }

  function validateRotacionSKUSheet(sheet){
    const range = sheet['!ref'];
    if(!range) return ['Sheet Rotación_SKU appears empty'];
    return [];
  }

  function validateWorkbook(workbook){
    const errors = [];
    if(!workbook) return { ok:false, errors:['Workbook is null'] };

    const required = ['Resumen','Resumen MRP','Rotación_SKU'];
    const missing = requireSheets(workbook, required);
    if(missing.length) errors.push('Missing sheets: ' + missing.join(', '));

    if(workbook.Sheets['Resumen']){
      errors.push(...validateResumenSheet(workbook.Sheets['Resumen']));
    }
    if(workbook.Sheets['Rotación_SKU']){
      errors.push(...validateRotacionSKUSheet(workbook.Sheets['Rotación_SKU']));
    }

    return { ok: errors.length === 0, errors };
  }

  window.Validator = { validateWorkbook };

})();
