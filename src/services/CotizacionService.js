import axios from 'axios';

const API_URL = '/api/cotizacion';

// Helper para obtener el token de autenticación
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    // Make token retrieval more robust by checking for common property names
    const token = user ? (user.token || user.jwt || user.accessToken) : null;
    if (token) {
        return { Authorization: 'Bearer ' + token };
    } else {
        return {};
    }
};

class CotizacionService {
    // Método para obtener todas las cotizaciones desde localStorage
    getAllCotizaciones() {
        const cotizacionesData = JSON.parse(localStorage.getItem('ttm_cotizaciones')) || [];
        return Promise.resolve({ data: cotizacionesData });
    }

    // Método para guardar una cotización en localStorage
    saveCotizacion(productos) {
        const cotizacionesPrevias = JSON.parse(localStorage.getItem('ttm_cotizaciones')) || [];
        const nuevaCotizacion = {
            id: Date.now(), // ID simple basado en el timestamp
            fecha: new Date().toISOString(),
            productos: productos.map(item => ({
                nombre: item.producto.nombre,
                cantidad: item.cantidad
            }))
        };
        const nuevasCotizaciones = [...cotizacionesPrevias, nuevaCotizacion];
        localStorage.setItem('ttm_cotizaciones', JSON.stringify(nuevasCotizaciones));
        return Promise.resolve({ data: nuevaCotizacion });
    }


    getCart() {
        return axios.get(API_URL, { headers: getAuthHeaders() });
    }

    addToCart(item) { // item: { productoId: ..., cantidad: ... }
        return axios.post(API_URL + '/items', item, { headers: getAuthHeaders() });
    }

    updateQuantity(itemId, quantity) {
        return axios.put(API_URL + `/items/${itemId}`, { cantidad: quantity }, { headers: getAuthHeaders() });
    }

    removeFromCart(productId) {
        return axios.delete(API_URL + `/items/${productId}`, { headers: getAuthHeaders() });
    }
    
    clearCart() {
        return axios.delete(API_URL, { headers: getAuthHeaders() });
    }

    checkout() {
        return axios.post(API_URL + '/checkout', {}, { headers: getAuthHeaders() });
    }
}

export default new CotizacionService();
