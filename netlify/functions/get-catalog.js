const fetch = require('node-fetch');

// --- Función de Transformación para WhatsApp ---
function transformWhatsAppProduct(p) {
    if (!p.product_items || p.product_items.length === 0) return null;
    const item = p.product_items[0];
    return {
        id: p.id,
        name: item.product_name || 'Nombre no disponible',
        brand: 'Desde WhatsApp', // Opcional: se puede mejorar si el dato existe
        category: 'Desde WhatsApp', // Opcional: se puede mejorar si el dato existe
        price: parseFloat(item.price) / 100 || 0,
        imageUrl: (item.images && item.images[0]) ? item.images[0].url : 'images/placeholder.png'
    };
}

// --- Función de Transformación para Google Sheets ---
function transformSheetProduct(row, headers) {
    const product = {};
    headers.forEach((header, index) => {
        if (!header) return; // Ignora columnas con encabezado vacío
        const key = header.toLowerCase().trim().replace(/\s+/g, '');
        if (!key) return; // Ignora si la clave resultante es vacía
        product[key] = row[index] ? row[index].trim().replace(/^"|"$/g, '') : '';
    });

    if (!product.id || !product.name) return null; // Producto inválido sin id o nombre

    product.price = parseFloat(product.price) || 0;
    product.imageUrl = product.imageurl || 'images/placeholder.png'; // Asegura un valor por defecto
    delete product.imageurl; // Renombra a camelCase para consistencia

    return product;
}

// --- Handler Principal de Netlify ---
exports.handler = async function() {
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_CATALOG_ID } = process.env;

    // --- Intento 1: WhatsApp API (Prioridad #1) ---
    if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_CATALOG_ID) {
        try {
            console.log('Intentando obtener catálogo de WhatsApp...');
            const url = `https://graph.facebook.com/v19.0/${WHATSAPP_CATALOG_ID}/products?fields=product_items{product_name,price,images{url}}&limit=100&access_token=${WHATSAPP_ACCESS_TOKEN}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    const products = data.data.map(transformWhatsAppProduct).filter(Boolean);
                    console.log(`Éxito: Se obtuvieron ${products.length} productos de WhatsApp. Proceso finalizado.`);
                    return { statusCode: 200, body: JSON.stringify(products) };
                }
                 console.log('WhatsApp API OK, pero no devolvió productos.');
            } else {
                console.warn(`WhatsApp API respondió con error: ${response.status}. Pasando a Google Sheets.`);
            }
        } catch (e) {
            console.error("Fallo en la petición a WhatsApp API:", e.message, ". Pasando a Google Sheets.");
        }
    } else {
        console.log('Credenciales de WhatsApp no encontradas. Pasando directamente a Google Sheets.');
    }

    // --- Intento 2: Google Sheets (Backup Principal) ---
    // Usamos el nuevo ID que proporcionaste
    const GOOGLE_SHEET_ID = '1Auh_WoDe3N7Q44JFv57waxOkmyi6ORFXjKzLTMUXhsA';
    const sheetName = 'Productos';
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    try {
        console.log(`Intentando obtener catálogo de Google Sheets (ID: ${GOOGLE_SHEET_ID})...`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Google Sheets respondió con un error: ${response.status} ${response.statusText}`);
        }

        const csvText = await response.text();
        if (!csvText || csvText.trim() === '') {
            throw new Error('El archivo CSV de Google Sheets está vacío o no es accesible.');
        }

        const rows = csvText.trim().split('\n').map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
        if (rows.length < 2) {
            throw new Error('El CSV no contiene datos de productos (solo cabecera o está vacío).');
        }

        const headers = rows.shift().map(h => h.trim().replace(/^"|"$/g, ''));
        const products = rows.map(r => transformSheetProduct(r, headers)).filter(Boolean);
        
        console.log(`Éxito: Se obtuvieron y procesaron ${products.length} productos de Google Sheets.`);
        return {
            statusCode: 200,
            body: JSON.stringify(products),
        };

    } catch (error) {
        console.error("Error fatal al procesar Google Sheets:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Fallo en la fuente de datos secundaria (Google Sheets): ${error.message}` }),
        };
    }
};
