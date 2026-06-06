// =====================================================
// EXCEL LOADER
// =====================================================

async function cargarExcel() {

    try {

        const timestamp =
            new Date().getTime();

        const response =
            await fetch(
                `data/Control_Rotacion_Repuestos_SKU.xlsx?v=${timestamp}`,
                {
                    cache:"no-store"
                }
            );

        if(!response.ok){

            throw new Error(
                "No se pudo cargar Excel"
            );

        }

        const arrayBuffer =
            await response.arrayBuffer();

        const workbook =
            XLSX.read(
                arrayBuffer,
                {
                    type:"array"
                }
            );

        dashboardData.workbook =
            workbook;

        console.log(
            "Excel cargado correctamente"
        );

        procesarResumen();
        procesarMRP();
        procesarRotacionSKU();

        dashboardData.ultimaCarga = new Date();

    }
    catch(error){

        console.error(error);

        alert(
            "Error cargando Excel"
        );

    }

}


//Procesar Resumen ===================================================================================

function procesarResumen(){

    const hoja =
        dashboardData
        .workbook
        .Sheets["Resumen"];

    const datos =
        XLSX.utils
        .sheet_to_json(
            hoja,
            {
                header:1
            }
        );

    dashboardData.resumen = {

    rotacionGlobal:
        datos[0][1],

    clasificacion:
        datos[0][2],

    skuTotal:
        datos[2][2],

    skuRotacion: [

        datos[3][1],
        datos[4][1],
        datos[5][1],
        datos[6][1]

    ],

    inventarioRotacion: [

        datos[8][1],
        datos[9][1],
        datos[10][1],
        datos[11][1]

    ],

    antiguedadUso: [

        datos[13][1],
        datos[14][1],
        datos[15][1],
        datos[16][1]

    ],

    antiguedadGTQ: [

        datos[18][1],
        datos[19][1],
        datos[20][1],
        datos[21][1]

    ]

};


}

// Procesar MRP ===============================================================================================

function procesarMRP(){

    const hoja =
        dashboardData
        .workbook
        .Sheets["Resumen MRP"];

    const datos =
        XLSX.utils
        .sheet_to_json(
            hoja,
            {
                header:1
            }
        );

   dashboardData.mrp = {

    rotacionGlobal:
        datos[0][1],

    clasificacion:
        datos[0][2],

    consumoAnual:
        datos[1][1],

    inventario:
        datos[2][1],

    skuTotal:
        datos[3][2],

    skuRotacion: [

        datos[4][1],
        datos[5][1],
        datos[6][1],
        datos[7][1]

    ],

    inventarioRotacion: [

        datos[9][1],
        datos[10][1],
        datos[11][1],
        datos[12][1]

    ],

    antiguedadUso: [

        datos[14][1],
        datos[15][1],
        datos[16][1],
        datos[17][1]

    ],

    antiguedadGTQ: [

        datos[19][1],
        datos[20][1],
        datos[21][1],
        datos[22][1]

    ]

};


}
function procesarRotacionSKU(){

    const hoja =
        dashboardData
        .workbook
        .Sheets["Rotación_SKU"];

    const datos =
        XLSX.utils.sheet_to_json(
            hoja,
            {
                header:1
            }
        );

    dashboardData.rotacionSKU =
        datos
        .slice(1)
        .map(fila => ({

            sku:
                fila[0],

            descripcion:
                fila[1],

            inventario:
                Number(fila[2]) || 0,

            consumo:
                Number(fila[3]) || 0,

            fechaUltimoConsumo:
                fila[4],

            diasSinConsumo:
                Number(fila[5]) || 0,

            ultimoIngreso:
                fila[6],

            rotacion:
                Number(fila[7]) || 0,

            clasificacion:
                fila[8],

            claseValor:
                fila[9],

            antiguedad:
                fila[10],

            antiguedadDetalle:
                fila[11],

            mrp:
                fila[12]

        }));

}
