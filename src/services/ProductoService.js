import api from "./api"; // Usamos la instancia central de axios

const API_URL = "http://localhost:8080/api/productos";

class ProductosService {
  getAllProductos() {
    return api.get(API_URL);
  }

  getProductoById(id) {
    return api.get(`${API_URL}/${id}`);
  }

  createProducto(producto) {
    // La subida de la imagen debe manejarse antes de llamar a esta función.
    // El backend espera un campo 'imagen_url' con el link a la imagen.
    return api.post(API_URL, producto);
  }

  updateProducto(id, producto) {
    return api.put(`${API_URL}/${id}`, producto);
  }

  deleteProducto(id) {
    return api.delete(`${API_URL}/${id}`);
  }
}

export default new ProductosService();
