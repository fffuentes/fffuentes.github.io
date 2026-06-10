/* testUtils.js
   Manual tests to simulate malformed/missing Excel for Validator
   This script injects test buttons into .header-right and wires tests.
*/
(function(){
  function showResult(title, result){
    const ok = result && result.ok;
    const msg = (result && result.errors && result.errors.length)? result.errors.join('\n') : (ok? 'No errors':'Unknown error');
    alert(title + '\n' + (ok? 'OK' : 'FAIL') + '\n' + msg);
    console.log(title, result);
  }

  function runNullTest(){
    const validation = (window.Validator && typeof Validator.validateWorkbook === 'function')
      ? Validator.validateWorkbook(null)
      : { ok:false, errors:['Validator not available'] };
    showResult('Validator Null Test', validation);
  }

  function runMissingSheetsTest(){
    const fake = { SheetNames: ['Resumen'], Sheets: { 'Resumen': { '!ref': 'A1:A10' } } };
    const validation = (window.Validator && typeof Validator.validateWorkbook === 'function')
      ? Validator.validateWorkbook(fake)
      : { ok:false, errors:['Validator not available'] };
    showResult('Validator Missing Sheets Test', validation);
  }

  function injectButtons(){
    const container = document.querySelector('.header-right');
    if(!container) return;
    const b1 = document.createElement('button');
    b1.id = 'btnTestNull';
    b1.className = 'tab';
    b1.textContent = 'Test Excel Null';
    b1.style.marginLeft = '8px';
    const b2 = document.createElement('button');
    b2.id = 'btnTestMissing';
    b2.className = 'tab';
    b2.textContent = 'Test Missing Sheets';
    b2.style.marginLeft = '8px';
    container.appendChild(b1);
    container.appendChild(b2);
    b1.addEventListener('click', runNullTest);
    b2.addEventListener('click', runMissingSheetsTest);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    injectButtons();
  });

  window.TestUtils = { runNullTest, runMissingSheetsTest };
})();
