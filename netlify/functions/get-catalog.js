const fetch = require('node-fetch');

// ... (transformWhatsAppProduct no cambia)
function transformWhatsAppProduct(p) { /* ... */ }

// --- Función de Transformación para Google Sheets (FORTALECIDA) ---
function transformSheetProduct(row, headers) {
    const product = {};
    headers.forEach((header, index) => {
        if (!header) return;
        const key = header.toLowerCase().trim().replace(/\s+/g, '');
        if (!key) return;
        product[key] = row[index] ? row[index].trim().replace(/^"|"$/g, '') : '';
    });

    // --- VERIFICACIÓN Y LOGGING ---
    // Si no tiene un ID o un nombre, lo consideramos inválido y lo reportamos.
    if (!product.id || !product.name) {
        console.warn('Fila descartada por falta de id o nombre:', JSON.stringify(product));
        return null; 
    }

    product.price = parseFloat(product.price) || 0;
    
    // Si la URL de la imagen no existe en la hoja, usa el campo 'imageurl' o un placeholder.
    product.imageUrl = product.imageurl || product.imageurl || 'images/placeholder.png'; 
    if(product.imageurl) delete product.imageurl; 

    return product;
}

// --- Handler Principal de Netlify (CON LOGS MEJORADOS) ---
exports.handler = async function() {
    // ... (Lógica de WhatsApp no cambia)
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_CATALOG_ID } = process.env;
    if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_CATALOG_ID) { /* ... */ }

    // --- Lógica de Google Sheets (FORTALECIDA) ---
    const GOOGLE_SHEET_ID = '1Auh_WoDe3N7Q44JFv57waxOkmyi6ORFXjKzLTMUXhsA';
    const sheetName = 'Productos';
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    try {
        console.log(`Intentando obtener catálogo de Google Sheets (ID: ${GOOGLE_SHEET_ID})...`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Google Sheets respondió con error: ${response.status} ${response.statusText}`);
        }

        const csvText = await response.text();
        if (!csvText || csvText.trim() === '') {
            throw new Error('El archivo CSV de Google Sheets está vacío.');
        }

        const rows = csvText.trim().split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
        if (rows.length < 2) {
            throw new Error('El CSV no contiene filas de datos.');
        }

        const headers = rows.shift().map(h => h.trim().replace(/^"|"$/g, ''));
        console.log('Cabeceras encontradas en el Sheet:', headers); // Log para ver las cabeceras

        const products = rows.map(r => transformSheetProduct(r, headers)).filter(Boolean);
        
        if (products.length === 0) {
             // Este log es crucial si el array de productos está vacío.
            console.warn('Se procesaron las filas, pero ningún producto fue validado. Revisa los logs de "Fila descartada".');
        } else {
            console.log(`Éxito: Se validaron ${products.length} productos de Google Sheets.`);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(products),
        };

    } catch (error) {
        console.error("Error fatal al procesar Google Sheets:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Fallo en Google Sheets: ${error.message}` }),
        };
    }
};
