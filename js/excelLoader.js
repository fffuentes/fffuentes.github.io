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

    console.log(
        "Resumen",
        datos
    );

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

    console.log(
        "MRP",
        datos
    );

}
