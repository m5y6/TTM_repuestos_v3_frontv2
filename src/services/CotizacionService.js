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

class CartService {
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

export default new CartService();
