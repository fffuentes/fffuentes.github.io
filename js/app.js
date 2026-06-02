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

async function inicializarDashboard() {

    console.log(
        "Inicializando dashboard..."
    );

    await cargarExcel();

    crearGraficosDemo();

}


async function refrescarDashboard() {

    console.log(
        "Refrescando..."
    );

    // Aquí leeremos Excel

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
