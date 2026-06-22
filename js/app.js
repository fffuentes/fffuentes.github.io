/* =====================================================
   CONTROL TOWER DE REPUESTOS
   app.js
===================================================== */

// =====================================================
// VARIABLES GLOBALES
// =====================================================

let charts = {};

let dashboardData = {};

// =====================================================
// RESIZE HANDLER — evita loops, responde a zoom in/out
// =====================================================

let resizeTimeout = null;
const RESIZE_DEBOUNCE = 100; // ms entre el último evento y el resize

function resizeAllCharts() {
    try {
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    } catch (e) {
        // silently ignore resize errors
    }
}

// "Leading + trailing" debounce:
//   - Primer evento → ejecuta inmediatamente
//   - Eventos subsiguientes → reinician el timer
//   - Al terminar la ráfaga → ejecuta una última vez
let lastResizeTime = 0;
function handleResize() {
    var now = Date.now();
    // Leading edge: ejecutar inmediatamente si han pasado >200ms desde el último
    if (now - lastResizeTime > 200) {
        resizeAllCharts();
    }
    lastResizeTime = now;

    // Trailing edge: asegurar un resize final tras la ráfaga
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
        resizeAllCharts();
    }, RESIZE_DEBOUNCE);
}

// window.resize — se dispara con zoom en la mayoría de navegadores
window.addEventListener('resize', handleResize);

// visualViewport.resize — detecta zoom (escala) y cambios de viewport móvil
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
}


// =====================================================
// INICIO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        iniciarTabs();

        actualizarFecha();

        inicializarDashboard();

    }
);


// =====================================================
// TABS
// =====================================================

function iniciarTabs() {

    const tabs =
        document.querySelectorAll(".tab");

    const contents =
        document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                tabs.forEach(
                    t => t.classList.remove("active")
                );

                contents.forEach(
                    c => c.classList.remove("active")
                );

                tab.classList.add("active");

                const destino =
                    tab.dataset.tab;

                document
                    .getElementById(destino)
                    .classList.add("active");

                // Trigger resize for canvases in the activated tab (fix hidden-tab rendering)
                setTimeout(() => {
                    try {
                        const container = document.getElementById(destino);
                        if (container) {
                            container.querySelectorAll('canvas').forEach(c => {
                                try {
                                    if (window.Chart && typeof Chart.getChart === 'function') {
                                        const inst = Chart.getChart(c);
                                        if (inst && typeof inst.resize === 'function') inst.resize();
                                    }
                                } catch (e) {}
                            });
                        }
                    } catch (e) {}
                    try { window.dispatchEvent(new Event('resize')); } catch (e) {}
                }, 80);

            }
        );

    });

}


// =====================================================
// FECHA
// =====================================================

function actualizarFecha() {

    const now =
        new Date();

    const fecha =
        now.toLocaleDateString(
            "es-GT"
        );

    const hora =
        now.toLocaleTimeString(
            "es-GT"
        );

    document
        .getElementById(
            "lastUpdate"
        )
        .innerHTML =
        `${fecha}<br>${hora}`;

}


// =====================================================
// BOTÓN ACTUALIZAR
// =====================================================

document
    .getElementById(
        "btnActualizar"
    )
    .addEventListener(
        "click",
        async () => {

            console.log(
                "Actualizando dashboard..."
            );

            actualizarFecha();

            await refrescarDashboard();

        }
    );


// =====================================================
// DASHBOARD
// =====================================================

async function inicializarDashboard(){

    console.log(
        "Inicializando dashboard..."
    );

    await cargarExcel();

    crearGraficosResumen();

    crearGraficosMRP();

    cargarAnalisisSKU();

    // Asegurar que los charts ocupen bien sus contenedores
    setTimeout(resizeAllCharts, 100);
    setTimeout(resizeAllCharts, 400);

}


async function refrescarDashboard(){

    await cargarExcel();

    Object.values(charts)
        .forEach(chart => {

            if(chart){

                chart.destroy();

            }

        });

    charts = {};

    crearGraficosResumen();

    crearGraficosMRP();

    cargarAnalisisSKU();

    // Asegurar que los charts ocupen bien sus contenedores
    setTimeout(resizeAllCharts, 100);
    setTimeout(resizeAllCharts, 400);

}


// =====================================================
// GRÁFICOS DEMO
// =====================================================

function crearGraficosDemo() {

    crearPieRotacion();

    crearInventario();

    crearAntiguedadUso();

    crearAntiguedadGTQ();

}


// =====================================================
// PIE ROTACIÓN
// =====================================================

function crearPieRotacion() {

    const ctx =
        document.getElementById(
            "chartSkuRotacion"
        );

    charts.rotacion =
        new Chart(
            ctx,
            {

                type:"doughnut",

                data:{

                    labels:[
                        "Alta",
                        "Media",
                        "Muy Baja",
                        "Sin Rotación"
                    ],

                    datasets:[{

                        data:[
                            587,
                            313,
                            1333,
                            1219
                        ],

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

}


// =====================================================
// INVENTARIO
// =====================================================

function crearInventario() {

    const ctx =
        document.getElementById(
            "chartInventario"
        );

    charts.inventario =
        new Chart(
            ctx,
            {

                type:"bar",

                data:{

                    labels:[

                        "Alta",
                        "Media",
                        "Muy Baja",
                        "Sin Rotación"

                    ],

                    datasets:[{

                        label:"GTQ",

                        data:[

                            1621614,
                            1466389,
                            528910,
                            11834831

                        ],

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    indexAxis:"y",

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

}


// =====================================================
// ANTIGÜEDAD USO
// =====================================================

function crearAntiguedadUso() {

    const ctx =
        document.getElementById(
            "chartAntiguedadUso"
        );

    charts.antiguedadUso =
        new Chart(
            ctx,
            {

                type:"doughnut",

                data:{

                    labels:[

                        "<1 año",
                        "1-3 años",
                        "3-5 años",
                        ">5 años"

                    ],

                    datasets:[{

                        data:[

                            646,
                            203,
                            73,
                            297

                        ],

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

}


// =====================================================
// ANTIGÜEDAD GTQ
// =====================================================

function crearAntiguedadGTQ() {

    const ctx =
        document.getElementById(
            "chartAntiguedadGTQ"
        );

    charts.antiguedadGTQ =
        new Chart(
            ctx,
            {

                type:"bar",

                data:{

                    labels:[

                        "<1 año",
                        "1-3 años",
                        "3-5 años",
                        ">5 años"

                    ],

                    datasets:[{

                        label:"GTQ",

                        data:[

                            6081078,
                            2292808,
                            1250000,
                            2170000

                        ],

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    indexAxis:"y",

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

}

function crearGraficosResumen(){

    crearPieRotacionResumen();

    crearInventarioResumen();

    crearAntiguedadUsoResumen();

    crearAntiguedadGTQResumen();

    actualizarKPIsResumen();

}
function actualizarKPIsResumen(){

    document.getElementById(
        "rotacionGlobal"
    ).innerText =
        dashboardData
        .resumen
        .rotacionGlobal
        .toFixed(2);

    document.getElementById(
        "clasificacionGlobal"
    ).innerText =
        dashboardData
        .resumen
        .clasificacion;

    document.getElementById(
        "skuTotal"
    ).innerText =
        dashboardData
        .resumen
        .skuTotal;

    const inventarioTotal =

    dashboardData
    .resumen
    .inventarioRotacion
    .reduce(
        (a,b)=>a+b,
        0
    );

document.getElementById(
    "inventarioTotal"
).innerText =

    "Q " +

    (
        inventarioTotal /
        1000000
    ).toFixed(2)

    + " MM";

document.getElementById(
    "sinRotacion"
).innerText =

    dashboardData
    .resumen
    .skuRotacion[3]
    .toLocaleString();

}
function crearPieRotacionResumen(){

    const ctx =
        document.getElementById(
            "chartSkuRotacion"
        );

    charts.rotacion =
        new Chart(
            ctx,
            {

                type:"doughnut",

                data:{

                    labels:[

                        "Alta",
                        "Media",
                        "Muy Baja",
                        "Sin Rotación"

                    ],

                    datasets:[{

                        data:
                            dashboardData
                            .resumen
                            .skuRotacion,

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

}
function crearInventarioResumen(){

    const ctx =
        document.getElementById(
            "chartInventario"
        );

    charts.inventario =
        new Chart(
            ctx,
            {

                type:"bar",

                data:{

                    labels:[

                        "Alta",
                        "Media",
                        "Muy Baja",
                        "Sin Rotación"

                    ],

                    datasets:[{

                        data:
                            dashboardData
                            .resumen
                            .inventarioRotacion,

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    indexAxis:"y",

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

}
function crearAntiguedadUsoResumen(){

    const ctx =
        document.getElementById(
            "chartAntiguedadUso"
        );

    charts.antiguedadUso =
        new Chart(
            ctx,
            {

                type:"doughnut",

                data:{

                    labels:[

                        "<1 año",
                        "1-3 años",
                        "3-5 años",
                        ">5 años"

                    ],

                    datasets:[{

                        data:
                            dashboardData
                            .resumen
                            .antiguedadUso,

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

}
function crearAntiguedadGTQResumen(){

    const ctx =
        document.getElementById(
            "chartAntiguedadGTQ"
        );

    charts.antiguedadGTQ =
        new Chart(
            ctx,
            {

                type:"bar",

                data:{

                    labels:[

                        "<1 año",
                        "1-3 años",
                        "3-5 años",
                        ">5 años"

                    ],

                    datasets:[{

                        data:
                            dashboardData
                            .resumen
                            .antiguedadGTQ,

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    indexAxis:"y",

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

}
function crearGraficosMRP(){

    actualizarKPIsMRP();

    crearPieRotacionMRP();

    crearInventarioMRP();

    crearAntiguedadUsoMRP();

    crearAntiguedadGTQMRP();

}
function actualizarKPIsMRP(){

    document
        .getElementById(
            "mrpRotacionGlobal"
        )
        .innerText =
        dashboardData
        .mrp
        .rotacionGlobal
        .toFixed(2);

    document
        .getElementById(
            "mrpClasificacion"
        )
        .innerText =
        dashboardData
        .mrp
        .clasificacion;

    document
        .getElementById(
            "mrpSkuTotal"
        )
        .innerText =
        dashboardData
        .mrp
        .skuTotal;

    document
        .getElementById(
            "mrpConsumo"
        )
        .innerText =
        dashboardData
        .mrp
        .consumoAnual
        .toLocaleString(
            "es-GT",
            {
                style:"currency",
                currency:"GTQ"
            }
        );

    document
        .getElementById(
            "mrpInventario"
        )
        .innerText =
        dashboardData
        .mrp
        .inventario
        .toLocaleString(
            "es-GT",
            {
                style:"currency",
                currency:"GTQ"
            }
        );

}
function crearPieRotacionMRP(){

    const ctx =
        document.getElementById(
            "chartMRPRotacion"
        );

    charts.mrpRotacion =
        new Chart(
            ctx,
            {

                type:"doughnut",

                data:{

                    labels:[

                        "Alta",
                        "Media",
                        "Muy Baja",
                        "Sin Rotación"

                    ],

                    datasets:[{

                        data:
                            dashboardData
                            .mrp
                            .skuRotacion,

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

}
function crearInventarioMRP(){

    const ctx =
        document.getElementById(
            "chartMRPInventario"
        );

    charts.mrpInventario =
        new Chart(
            ctx,
            {

                type:"bar",

                data:{

                    labels:[

                        "Alta",
                        "Media",
                        "Muy Baja",
                        "Sin Rotación"

                    ],

                    datasets:[{

                        data:
                            dashboardData
                            .mrp
                            .inventarioRotacion,

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    indexAxis:"y",

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

}
function crearAntiguedadUsoMRP(){

    const ctx =
        document.getElementById(
            "chartMRPAntiguedadUso"
        );

    // Ensure panel has a minimum height so chart can size correctly
    try{
        const panel = ctx && ctx.closest ? ctx.closest('.chart-panel') : null;
        if(panel && (!panel.style.minHeight || panel.style.minHeight === '')){
            panel.style.minHeight = '220px';
        }
    }catch(e){}

    charts.mrpAntiguedadUso =
        new Chart(
            ctx,
            {

                type:"doughnut",

                data:{

                    labels:[

                        "<1 a�o",
                        "1-3 a�os",
                        "3-5 a�os",
                        ">5 a�os"

                    ],

                    datasets:[{

                        data:
                            dashboardData
                            .mrp
                            .antiguedadUso,

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

    // Force resize immediately and after a short delay to handle hidden/tabbed containers
    try{ const inst = (window.Chart && typeof Chart.getChart === 'function') ? Chart.getChart(ctx) : null; if(inst && typeof inst.resize === 'function') inst.resize(); }catch(e){}
    setTimeout(()=>{ try{ const inst = (window.Chart && typeof Chart.getChart === 'function') ? Chart.getChart(ctx) : null; if(inst && typeof inst.resize === 'function') inst.resize(); }catch(e){} }, 120);

}
function crearAntiguedadGTQMRP(){

    const ctx =
        document.getElementById(
            "chartMRPAntiguedadGTQ"
        );

    // Ensure panel has a minimum height so chart can size correctly
    try{
        const panel = ctx && ctx.closest ? ctx.closest('.chart-panel') : null;
        if(panel && (!panel.style.minHeight || panel.style.minHeight === '')){
            panel.style.minHeight = '220px';
        }
    }catch(e){}

    charts.mrpAntiguedadGTQ =
        new Chart(
            ctx,
            {

                type:"bar",

                data:{

                    labels:[

                        "<1 a�o",
                        "1-3 a�os",
                        "3-5 a�os",
                        ">5 a�os"

                    ],

                    datasets:[{

                        data:
                            dashboardData
                            .mrp
                            .antiguedadGTQ,

                        backgroundColor:[

                            "#4da3ff",
                            "#ef4444",
                            "#84cc16",
                            "#8b5cf6"

                        ]

                    }]

                },

                options:{

                    indexAxis:"y",

                    responsive:true,

                    maintainAspectRatio:false

                }

            }
        );

    // Force resize immediately and after a short delay to handle hidden/tabbed containers
    try{ const inst = (window.Chart && typeof Chart.getChart === 'function') ? Chart.getChart(ctx) : null; if(inst && typeof inst.resize === 'function') inst.resize(); }catch(e){}
    setTimeout(()=>{ try{ const inst = (window.Chart && typeof Chart.getChart === 'function') ? Chart.getChart(ctx) : null; if(inst && typeof inst.resize === 'function') inst.resize(); }catch(e){} }, 120);

}
function cargarAnalisisSKU(){

    cargarKPIsSKU();

    crearParetoInventario();

    cargarRiesgos();

    cargarTopInventario();

    cargarTopSinRotacion();

    cargarTopObsolescencia();

    iniciarBuscadorSKU();

}
function cargarTopInventario(
    filtro = ""
){

    const top =
    dashboardData.rotacionSKU
    .filter(item => item && item.sku)
    .filter(item =>

        (item.sku || "")
    .toString()
    .includes(filtro)

        ||

        item.descripcion
            .toLowerCase()
            .includes(filtro)

    )
        .sort(
            (a,b) =>
                b.inventario - a.inventario
        )
        .slice(0,20);

    let html = `
        <table class="tabla-sku">
            <tr>
                <th>SKU</th>
                <th>Descripción</th>
                <th>Inventario</th>
            </tr>
    `;

    top.forEach(item => {

        html += `
            <tr>
                <td>${item.sku}</td>
                <td>${item.descripcion}</td>
                <td>Q ${item.inventario.toLocaleString()}</td>
            </tr>
        `;

    });

    html += "</table>";

    document.getElementById(
        "topInventario"
    ).innerHTML = html;

}
function cargarTopSinRotacion(
    filtro = ""
){

    const top =
    dashboardData.rotacionSKU
    .filter(item => item && item.sku)
        .filter(item =>

            item.claseValor ===
                "Sin rotación"

            &&

            (

                (item.sku || "")
                    .toString()
                    .includes(filtro)

                ||

                item.descripcion
                    .toLowerCase()
                    .includes(filtro)

            )

        )
        .sort(
            (a,b) =>
                b.inventario - a.inventario
        )
        .slice(0,20);

    let html = `
        <table class="tabla-sku">
            <tr>
                <th>SKU</th>
                <th>Descripción</th>
                <th>Inventario</th>
            </tr>
    `;

    top.forEach(item => {

        html += `
            <tr>
                <td>${item.sku}</td>
                <td>${item.descripcion}</td>
                <td>Q ${item.inventario.toLocaleString()}</td>
            </tr>
        `;

    });

    html += "</table>";

    document.getElementById(
        "topSinRotacion"
    ).innerHTML = html;

}
function iniciarBuscadorSKU(){

    const txtBuscar =
        document.getElementById(
            "txtBuscarSKU"
        );

    txtBuscar.addEventListener(
        "input",
        () => {

            const texto =
                txtBuscar.value
                .toLowerCase();

            cargarTopInventario(
                texto
            );

            cargarTopSinRotacion(
                texto
            );

            cargarTopObsolescencia(
                texto
            );

        }
    );

}
function cargarKPIsSKU(){

    const skuTotal =
        dashboardData.rotacionSKU.length;

    const sinRotacion =
        dashboardData.rotacionSKU
        .filter(
            x =>
                x.claseValor ===
                "Sin rotación"
        )
        .length;

    const valorSinRotacion =
        dashboardData.rotacionSKU
        .filter(
            x =>
                x.claseValor ===
                "Sin rotación"
        )
        .reduce(
            (a,b) =>
                a + b.inventario,
            0
        );

    const inventarioTotal =
        dashboardData.rotacionSKU
        .reduce(
            (a,b) =>
                a + b.inventario,
            0
        );

    const mrp =
        dashboardData.rotacionSKU
        .filter(
            x =>
                x.mrp ===
                "MRP"
        )
        .length;

    document.getElementById(
        "kpiSkuTotal"
    ).textContent =
        skuTotal.toLocaleString();

    document.getElementById(
        "kpiSinRotacion"
    ).textContent =
        sinRotacion.toLocaleString();

    document.getElementById(
        "kpiValorSinRotacion"
    ).textContent =
        "Q " +
        (
            valorSinRotacion /
            1000000
        ).toFixed(2) +
        " MM";

    document.getElementById(
        "kpiInventarioTotal"
    ).textContent =
        "Q " +
        (
            inventarioTotal /
            1000000
        ).toFixed(2) +
        " MM";

    document.getElementById(
        "kpiMRP"
    ).textContent =
        mrp.toLocaleString();

const obsoletos =
    dashboardData.rotacionSKU
    .filter(
        x =>
            x.antiguedad ===
            "Mayor 5 años"
    );

const valorObsoletos =
    obsoletos.reduce(
        (a,b)=>
            a+b.inventario,
        0
    );

document.getElementById(
    "kpiObsolescencia"
).innerHTML =

    `${obsoletos.length}
    <br>
    <small>
        Q ${(valorObsoletos/1000000).toFixed(2)} MM
    </small>`;

}

let chartPareto = null;

function crearParetoInventario(){

    const datos =
        [...dashboardData.rotacionSKU]

        .filter(
            x => x.inventario > 0
        )

        .sort(
            (a,b) =>
                b.inventario - a.inventario
        )

        .slice(0,50);

    const total =
        dashboardData.rotacionSKU
        .reduce(
            (a,b) =>
                a + b.inventario,
            0
        );

    let acumulado = 0;

    const labels = [];
    const inventario = [];
    const porcentaje = [];

    datos.forEach(item=>{

        acumulado +=
            item.inventario;

        labels.push(
            item.sku
        );

        inventario.push(
            item.inventario
        );

        porcentaje.push(

            (
                acumulado /
                total
            ) * 100

        );

    });

    const ctx =
        document.getElementById(
            "graficoPareto"
        );

    if(chartPareto){

        chartPareto.destroy();

    }

    chartPareto =
        new Chart(
            ctx,
            {

                data:{

                    labels,

                    datasets:[

                        {

                            type:"bar",

                            label:
                                "Inventario",

                            data:
                                inventario,

                            backgroundColor:
                                "#173c73"

                        },

                        {

                            type:"line",

                            label:
                                "% acumulado",

                            data:
                                porcentaje,

                            borderColor:
                                "#8b5cf6",

                            backgroundColor:
                                "#8b5cf6",

                            tension:0.3,

                            yAxisID:"y1"

                        },

                        {

                            type:"line",

                            label:
                                "Objetivo 80%",

                            data:
                                labels.map(
                                    ()=>80
                                ),

                            borderColor:
                                "#ffcc00",

                            borderDash:
                                [8,8],

                            pointRadius:
                                0,

                            yAxisID:"y1"

                        }

                    ]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    plugins:{

                        legend:{

                            labels:{

                                color:"white"

                            }

                        }

                    },

                    scales:{

                        x:{

                            ticks:{

                                color:"white"

                            }

                        },

                        y:{

                            position:"left",

                            ticks:{

                                color:"white"

                            }

                        },

                        y1:{

                            position:"right",

                            min:0,

                            max:100,

                            grid:{

                                drawOnChartArea:false

                            },

                            ticks:{

                                color:"white",

                                callback:
                                    value =>
                                    value + "%"

                            }

                        }

                    }

                }

            }

        );

}

function cargarRiesgos(){

    const totalInventario =
        dashboardData.rotacionSKU
        .reduce(
            (a,b)=>a+b.inventario,
            0
        );

    const sinRotacion =
        dashboardData.rotacionSKU
        .filter(
            x =>
                x.claseValor ===
                "Sin rotación"
        );

    const valorSinRotacion =
        sinRotacion.reduce(
            (a,b)=>a+b.inventario,
            0
        );

    const porcentaje =
        (
            valorSinRotacion /
            totalInventario
        ) * 100;

    let clase =
        "riesgo-bajo";

    let nivel =
        "BAJO";

    if(porcentaje > 70){

        clase =
            "riesgo-alto";

        nivel =
            "ALTO";

    }
    else if(porcentaje > 40){

        clase =
            "riesgo-medio";

        nivel =
            "MEDIO";

    }

    document
        .getElementById(
            "panelRiesgos"
        )
        .innerHTML =

        `
            <div class="riesgo-card ${clase}">

                <div class="riesgo-titulo">
                    Inventario Sin Rotación
                </div>

                <div class="riesgo-valor">
                    Q ${(valorSinRotacion/1000000).toFixed(2)} MM
                </div>

                <div>
                    ${porcentaje.toFixed(1)}%
                    del inventario total
                </div>

                <div>
                    Riesgo ${nivel}
                </div>

            </div>

            <div class="riesgo-card riesgo-medio">

                <div class="riesgo-titulo">
                    SKU Sin Rotación
                </div>

                <div class="riesgo-valor">
                    ${sinRotacion.length}
                </div>

                <div>
                    SKU inmovilizados
                </div>

            </div>

            <div class="riesgo-card riesgo-bajo">

                <div class="riesgo-titulo">
                    SKU MRP
                </div>

                <div class="riesgo-valor">
                    ${dashboardData.mrp.skuTotal}
                </div>

                <div>
                    Materiales controlados
                </div>

            </div>
        `;
}

function cargarTopObsolescencia(
    filtro = ""
){

    const datos =

    dashboardData.rotacionSKU

    .filter(item =>

        item.antiguedad ===
            "Mayor 5 años"

        &&

        (

            item.sku
                .toString()
                .includes(filtro)

            ||

            item.descripcion
                .toLowerCase()
                .includes(filtro)

        )

    )

        .sort(
            (a,b)=>
                b.inventario -
                a.inventario
        )

        .slice(0,20);

    let html =

        `
        <table class="tabla-sku">

            <thead>

                <tr>

                    <th>SKU</th>

                    <th>Descripción</th>

                    <th>Inventario</th>

                    <th>Antigüedad</th>

                </tr>

            </thead>

            <tbody>
        `;

    datos.forEach(item=>{

        html +=

        `
        <tr>

            <td>
                ${item.sku}
            </td>

            <td>
                ${item.descripcion}
            </td>

            <td>

                Q
                ${item.inventario
                    .toLocaleString(
                        "es-GT"
                    )}

            </td>
            <td>

                ${item.antiguedad}

            </td>

        </tr>
        `;

    });

    html +=

        `
            </tbody>
        </table>
        `;

    document
        .getElementById(
            "tablaObsolescencia"
        )
        .innerHTML = html;

}


// Ensure canvases are wrapped by .chart-inner to apply sizing helpers
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.chart-panel').forEach(function(panel){
    var canvas = panel.querySelector('canvas');
    if(canvas && !panel.querySelector('.chart-inner')){
      var wrapper = document.createElement('div');
      wrapper.className = 'chart-inner';
      canvas.parentNode.insertBefore(wrapper, canvas);
      wrapper.appendChild(canvas);
    }
  });
});



// Enhance chart-series: wrap items into .series-list and append .series-total with computed total
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.chart-series').forEach(function(series){
      try{
        if(series.querySelector('.series-list')) return; // already transformed
        var items = Array.from(series.querySelectorAll('.series-item'));
        if(items.length===0) return;
        var list = document.createElement('div');
        list.className = 'series-list';
        items.forEach(function(it){ list.appendChild(it); });
        // compute numeric total (prefer value inside parentheses)
        var total = 0;
        items.forEach(function(it){
          try{
            var vText = (it.querySelector('.series-value') && it.querySelector('.series-value').textContent) || '';
            var m = vText.match(/\(([^)]+)\)/); // number inside ()
            var num = 0;
            if(m && m[1]){
              num = parseInt(m[1].replace(/,/g,'')) || 0;
            } else {
              // fallback: extract digits
              var n = (vText || '').replace(/[^0-9.-]+/g,'');
              num = parseFloat(n) || 0;
            }
            total += num;
          }catch(e){}
        });
        var totalBox = document.createElement('div');
        totalBox.className = 'series-total';
        var lbl = document.createElement('div'); lbl.className='total-label'; lbl.textContent='Total';
        var val = document.createElement('div'); val.className='total-value'; val.textContent = total.toLocaleString();
        totalBox.appendChild(lbl); totalBox.appendChild(val);
        // clear and append
        series.innerHTML = '';
        series.appendChild(list);
        series.appendChild(totalBox);
      }catch(e){}
    });
  });
})();
