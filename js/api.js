const API_ENDPOINT = '/api/get-catalog'; // Tu Netlify/Google Function

export async function fetchConfig() {
    const response = await fetch('/config.json');
    if (!response.ok) throw new Error('No se pudo cargar la configuración.');
    return response.json();
}

export async function fetchCatalog() {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) throw new Error('No se pudo cargar el catálogo de productos.');
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
}
