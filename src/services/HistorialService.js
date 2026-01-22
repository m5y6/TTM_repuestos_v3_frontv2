import api from './api';

class HistorialService {
  /**
   * Obtiene todo el historial de cambios.
   */
  getHistorial() {
    return api.get('/api/historial');
  }

  /**
   * Filtra el historial por entidad (ej: Producto, Marca).
   * @param {string} nombreEntidad 
   */
  getHistorialPorEntidad(nombreEntidad) {
    return api.get(`/api/historial/entidad/${nombreEntidad}`);
  }

  /**
   * Filtra el historial por acción (ej: ELIMINAR, ACTUALIZAR).
   * @param {string} nombreAccion 
   */
  getHistorialPorAccion(nombreAccion) {
    return api.get(`/api/historial/accion/${nombreAccion}`);
  }
}

export default new HistorialService();
