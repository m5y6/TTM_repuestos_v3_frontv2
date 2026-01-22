import api from './api';

class CotizacionService {
    /**
     * Guarda una lista de productos que componen una cotización (carrito).
     * @param {Array} productos - Array de objetos, ej: [{ "productoId": 1, "cantidad": 2, "precio": 1000 }, ...]
     * @returns {Promise}
     */
    saveCotizacion(productos) {
        return api.post('/api/cotizaciones', productos);
    }

    /**
     * Lista todas las cotizaciones guardadas (histórico).
     * @returns {Promise}
     */
    getAllCotizaciones() {
        return api.get('/api/cotizaciones');
    }

    /**
     * Filtra las cotizaciones por un rango de fechas.
     * @param {string} inicio - Fecha de inicio en formato ISO (ej: 2023-01-01T00:00:00)
     * @param {string} fin - Fecha de fin en formato ISO
     * @returns {Promise}
     */
    getCotizacionesPorRango(inicio, fin) {
        return api.get('/api/cotizaciones/rango', { params: { inicio, fin } });
    }
}

export default new CotizacionService();
