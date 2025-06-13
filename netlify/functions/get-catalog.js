const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// --- Funciones de Transformación (sin cambios) ---
function transformWhatsAppProduct(p) {
    if (!p.product_items || p.product_items.length === 0) return null;
    const item = p.product_items[0];
    return {
        id: p.id,
        name: item.product_name || 'Nombre no disponible',
        price: parseFloat(item.price) / 100 || 0,
        imageUrl: (item.images && item.images[0]) ? item.images[0].url : 'images/placeholder.png',
        category: 'Desde WhatsApp' // O se podría intentar inferir
    };
}

function transformSheetProduct(row, headers) {
    const product = {};
    headers.forEach((h, i) => product[h.toLowerCase()] = row[i] || '');
    if (!product.id || !product.name) return null;
    product.price = parseFloat(product.price) || 0;
    product.imageUrl = product.imageurl || 'images/placeholder.png';
    return product;
}

// --- Handler Principal de Netlify ---
exports.handler = async function(event, context) {
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_CATALOG_ID, GOOGLE_SHEET_ID } = process.env;

    // --- Intento 1: WhatsApp API ---
    if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_CATALOG_ID) {
        try {
            console.log('Intentando obtener catálogo de WhatsApp...');
            const url = `https://graph.facebook.com/v19.0/${WHATSAPP_CATALOG_ID}/products?fields=product_items{product_name,price,images{url}}&limit=100&access_token=${WHATSAPP_ACCESS_TOKEN}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    const products = data.data.map(transformWhatsAppProduct).filter(Boolean);
                    console.log(`Éxito: Se obtuvieron ${products.length} productos de WhatsApp.`);
                    return { statusCode: 200, body: JSON.stringify(products) };
                }
            } else {
                console.warn(`WhatsApp API respondió con status: ${response.status}`);
            }
        } catch (e) {
            console.error("Fallo en la petición a WhatsApp API:", e.message);
        }
    }

    // --- Intento 2: Google Sheets ---
    if (GOOGLE_SHEET_ID) {
        try {
            console.log('Intentando obtener catálogo de Google Sheets...');
            const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Productos`;
            const response = await fetch(url);
            if (response.ok) {
                const csv = await response.text();
                // Regex mejorado para manejar comas dentro de campos entre comillas
                const rows = csv.trim().split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(f => f.trim().replace(/^"|"$/g, '')));
                if (rows.length > 1) {
                    const headers = rows.shift();
                    const products = rows.map(r => transformSheetProduct(r, headers)).filter(Boolean);
                    console.log(`Éxito: Se obtuvieron ${products.length} productos de Google Sheets.`);
                    return { statusCode: 200, body: JSON.stringify(products) };
                }
            } else {
                 console.warn(`Google Sheets respondió con status: ${response.status}`);
            }
        } catch (e) {
            console.error("Fallo en la petición a Google Sheets:", e.message);
        }
    }

    // --- Intento 3: Fallback Estático (products.json) ---
    try {
        console.log('Intentando obtener catálogo del archivo JSON de fallback...');
        // Asume que products.json está en la raíz del proyecto.
        // Netlify incluye los archivos de la raíz en el contexto de la función.
        const filePath = path.resolve(__dirname, '../../products.json');
        if (fs.existsSync(filePath)) {
            const jsonData = fs.readFileSync(filePath, 'utf-8');
            const products = JSON.parse(jsonData);
            if (products && products.length > 0) {
                console.log(`Éxito: Se obtuvieron ${products.length} productos del archivo JSON local.`);
                return { statusCode: 200, body: JSON.stringify(products) };
            }
        } else {
             console.warn(`El archivo de fallback no se encontró en: ${filePath}`);
        }
    } catch (e) {
        console.error("Fallo al leer el archivo JSON de fallback:", e.message);
    }
    
    // --- Fallo Total ---
    console.error("Todas las fuentes de datos fallaron.");
    return {
        statusCode: 500,
        body: JSON.stringify({ error: "No se pudo cargar el catálogo de ninguna fuente disponible." })
    };
};
