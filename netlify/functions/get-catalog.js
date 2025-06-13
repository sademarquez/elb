const fetch = require('node-fetch');

// ... (transformWhatsAppProduct sin cambios) ...
function transformWhatsAppProduct(p) { /* ... */ }

function normalizeHeader(header) {
    if (!header) return '';
    const h = header.toLowerCase().trim().replace(/\s+/g, ''); // a minúsculas, sin espacios
    if (h.includes('id')) return 'id';
    if (h.includes('name') || h.includes('nombre')) return 'name';
    if (h.includes('brand') || h.includes('marca')) return 'brand';
    if (h.includes('category') || h.includes('categoría')) return 'category';
    if (h.includes('price') || h.includes('precio')) return 'price';
    if (h.includes('image') || h.includes('imagen')) return 'imageUrl';
    return h; // Devuelve la clave normalizada si no coincide con las principales
}


function transformSheetProduct(row, headers) {
    const product = {};
    headers.forEach((header, index) => {
        const key = normalizeHeader(header); // <-- USA LA NUEVA FUNCIÓN DE NORMALIZACIÓN
        if (key) {
            product[key] = row[index] ? row[index].trim().replace(/^"|"$/g, '') : '';
        }
    });

    if (!product.id || !product.name) {
        // No logueamos aquí para no llenar los logs, el control se hará después
        return null;
    }
    product.price = parseFloat(product.price) || 0;
    return product;
}

exports.handler = async function() {
    // ... (lógica de WhatsApp sin cambios) ...

    // --- Lógica de Google Sheets con reporte de error mejorado ---
    const GOOGLE_SHEET_ID = '1Auh_WoDe3N7Q44JFv57waxOkmyi6ORFXjKzLTMUXhsA';
    const sheetName = 'Productos';
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Google Sheets respondió con error: ${response.status}`);
        const csvText = await response.text();
        if (!csvText || csvText.trim() === '') throw new Error('CSV vacío.');

        const rows = csvText.trim().split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
        if (rows.length < 2) throw new Error('CSV no contiene datos.');

        const originalHeaders = rows.shift().map(h => h.trim().replace(/^"|"$/g, ''));
        const products = rows.map(r => transformSheetProduct(r, originalHeaders)).filter(Boolean);
        
        // --- VERIFICACIÓN Y REPORTE CRUCIAL ---
        if (products.length === 0) {
            // Si después de todo, no hay productos, lanzamos un error informativo.
            throw new Error(`Se leyeron ${rows.length} filas pero ninguna pudo ser validada como producto. Verifique las cabeceras. Cabeceras encontradas: [${originalHeaders.join(', ')}]`);
        }
        
        console.log(`Éxito: Se validaron ${products.length} productos de Google Sheets.`);
        return { statusCode: 200, body: JSON.stringify(products) };

    } catch (error) {
        console.error("Error en el handler de Google Sheets:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

// ... Para completitud, incluyo aquí la función de WhatsApp y la estructura completa del handler
exports.handler = async function() {
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_CATALOG_ID } = process.env;
    if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_CATALOG_ID) { /* ... */ }

    // El resto es idéntico a lo que pegué arriba
    const GOOGLE_SHEET_ID = '1Auh_WoDe3N7Q44JFv57waxOkmyi6ORFXjKzLTMUXhsA';
    // ... resto del try/catch de Google Sheets ...
};

// Copiando la estructura final y correcta del handler completo.
exports.handler = async function() {
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_CATALOG_ID } = process.env;
    if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_CATALOG_ID) { /* lógica de WhatsApp */ }

    const GOOGLE_SHEET_ID = '1Auh_WoDe3N7Q44JFv57waxOkmyi6ORFXjKzLTMUXhsA';
    const sheetName = 'Productos';
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Google Sheets respondió con error: ${response.status}`);
        const csvText = await response.text();
        if (!csvText || csvText.trim() === '') throw new Error('CSV vacío.');

        const rows = csvText.trim().split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
        if (rows.length < 2) throw new Error('CSV no contiene datos.');

        const originalHeaders = rows.shift().map(h => h.trim().replace(/^"|"$/g, ''));
        const products = rows.map(r => transformSheetProduct(r, originalHeaders)).filter(Boolean);
        
        if (products.length === 0) {
            throw new Error(`Se leyeron ${rows.length} filas pero ninguna pudo ser validada como producto. Verifique las cabeceras. Cabeceras encontradas: [${originalHeaders.join(', ')}]`);
        }
        
        console.log(`Éxito: Se validaron ${products.length} productos de Google Sheets.`);
        return { statusCode: 200, body: JSON.stringify(products) };
    } catch (error) {
        console.error("Error en el handler de Google Sheets:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
