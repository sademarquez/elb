const fetch = require('node-fetch');

// Función para transformar una fila del CSV de Google Sheets en un objeto de producto estándar
function transformSheetProduct(row, headers) {
    const product = {};
    // Asigna cada valor de la fila a la propiedad correspondiente del header
    headers.forEach((header, index) => {
        // Normalizamos los nombres de los headers a minúsculas y sin espacios para usarlos como claves
        const key = header.toLowerCase().trim().replace(/\s+/g, '');
        product[key] = row[index] ? row[index].trim().replace(/^"|"$/g, '') : '';
    });

    // Validaciones y transformaciones de datos
    if (!product.id || !product.name) {
        return null; // Si no hay ID o nombre, el producto no es válido.
    }

    product.price = parseFloat(product.price) || 0;
    // Aseguramos que imageUrl tenga un valor por defecto si está vacío
    product.imageurl = product.imageurl || 'images/placeholder.png'; 
    // Renombramos 'imageurl' a 'imageUrl' para ser consistentes con el frontend
    product.imageUrl = product.imageurl; 
    delete product.imageurl;

    return product;
}

// Handler principal de la función Netlify
exports.handler = async function() {
    // ID del Google Sheet público. Este es tu link original.
    const GOOGLE_SHEET_ID = '1litLRjHF5aBah8xcK5MivcdqmlcPa5oPnNZvBEMP6NA';
    const sheetName = 'Productos';
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    try {
        console.log(`Intentando obtener catálogo de Google Sheets: ${GOOGLE_SHEET_ID}`);
        
        const response = await fetch(url);

        if (!response.ok) {
            // Si la respuesta no es 2xx, lanzamos un error claro
            throw new Error(`Google Sheets respondió con un error: ${response.status} ${response.statusText}`);
        }

        const csvText = await response.text();

        if (!csvText || csvText.trim() === '') {
            throw new Error('El archivo CSV de Google Sheets está vacío.');
        }

        // Regex para separar por comas, pero ignorar las comas dentro de comillas dobles
        const rows = csvText.trim().split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));

        if (rows.length < 2) {
            throw new Error('El CSV no contiene datos suficientes (solo cabecera o está vacío).');
        }

        const headers = rows.shift().map(h => h.trim().replace(/^"|"$/g, '')); // Extrae y limpia los headers
        const products = rows.map(r => transformSheetProduct(r, headers)).filter(Boolean); // Procesa cada fila y filtra nulos

        if (products.length === 0) {
            console.warn('El CSV fue procesado, pero no se encontraron productos válidos.');
        } else {
            console.log(`Éxito: Se obtuvieron y procesaron ${products.length} productos de Google Sheets.`);
        }

        // Devuelve los productos con un código de éxito
        return {
            statusCode: 200,
            body: JSON.stringify(products),
        };

    } catch (error) {
        console.error("Error fatal al obtener/procesar el catálogo de Google Sheets:", error.message);
        
        // Devuelve un error 500 con un mensaje claro
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `No se pudo cargar el catálogo. Causa: ${error.message}` }),
        };
    }
};
