import api from './api';

const API_URL = 'http://localhost:8080/api/historial';

class HistorialService {
  /**
   * Obtiene todo el historial de cambios.
   */
  getHistorial() {
    return api.get(API_URL);
  }

  /**
   * Filtra el historial por entidad (ej: Producto, Marca).
   * @param {string} nombreEntidad 
   */
  getHistorialPorEntidad(nombreEntidad) {
    return api.get(`${API_URL}/entidad/${nombreEntidad}`);
  }

  /**
   * Filtra el historial por acción (ej: ELIMINAR, ACTUALIZAR).
   * @param {string} nombreAccion 
   */
  getHistorialPorAccion(nombreAccion) {
    return api.get(`${API_URL}/accion/${nombreAccion}`);
  }
}

export default new HistorialService();
