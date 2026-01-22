import api from "./api"; // Usamos la instancia central de axios

class ProductosService {
  getAllProductos() {
    return api.get("/api/productos");
  }

  getProductoById(id) {
    return api.get(`/api/productos/${id}`);
  }

  createProducto(producto) {
    // La subida de la imagen debe manejarse antes de llamar a esta función.
    // El backend espera un campo 'imagen_url' con el link a la imagen.
    return api.post("/api/productos", producto);
  }

  updateProducto(id, producto) {
    return api.put(`/api/productos/${id}`, producto);
  }

  deleteProducto(id) {
    return api.delete(`/api/productos/${id}`);
  }
}

export default new ProductosService();
