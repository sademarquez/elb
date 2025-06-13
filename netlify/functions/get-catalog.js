const fetch = require('node-fetch');

// Parsea un producto de la respuesta de la API de WhatsApp
function transformWhatsAppProduct(p) {
    if (!p.product_items || p.product_items.length === 0) return null;
    const item = p.product_items[0];
    return { id: p.id, name: item.product_name, price: parseFloat(item.price) / 100, imageUrl: (item.images && item.images[0]) ? item.images[0].url : null, category: 'WhatsApp' };
}

// Parsea un producto de la respuesta de Google Sheets (CSV)
function transformSheetProduct(row, headers) {
    const product = {};
    headers.forEach((h, i) => product[h] = row[i] || '');
    if (!product.id || !product.name) return null;
    product.price = parseFloat(product.price) || 0;
    return product;
}

// Función principal que se ejecuta en Netlify
exports.handler = async function() {
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_CATALOG_ID } = process.env;

    // --- Intento 1: WhatsApp API ---
    if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_CATALOG_ID) {
        try {
            const url = `https://graph.facebook.com/v19.0/${WHATSAPP_CATALOG_ID}/products?fields=product_items{product_name,price,images{url}}&limit=100&access_token=${WHATSAPP_ACCESS_TOKEN}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    const products = data.data.map(transformWhatsAppProduct).filter(Boolean);
                    return { statusCode: 200, body: JSON.stringify(products) };
                }
            }
        } catch (e) { console.error("WhatsApp API fetch failed:", e); }
    }

    // --- Intento 2: Google Sheets (si WhatsApp falla o no está configurado) ---
    try {
        const sheetId = '1litLRjHF5aBah8xcK5MivcdqmlcPa5oPnNZvBEMP6NA';
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Productos`;
        const response = await fetch(url);
        if (response.ok) {
            const csv = await response.text();
            const rows = csv.trim().split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(f => f.trim().replace(/^"|"$/g, '')));
            if (rows.length > 1) {
                const headers = rows.shift();
                const products = rows.map(r => transformSheetProduct(r, headers)).filter(Boolean);
                return { statusCode: 200, body: JSON.stringify(products) };
            }
        }
    } catch (e) { console.error("Google Sheets fetch failed:", e); }

    // --- Intento 3: Falla y devuelve error ---
    return { statusCode: 500, body: JSON.stringify({ error: "Todas las fuentes de datos fallaron." }) };
};