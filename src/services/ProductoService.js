import axios from "axios";

const API_URL = "/api/productos";

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the token to the headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // Do NOT set Content-Type manually for FormData
    // Axios will automatically set it with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import productosData from '../productos.json';

class ProductosService {
  getAllProductos() {
    return Promise.resolve({ data: productosData });
  }

  getProductoById(id) {
    const producto = productosData.find(p => p.id === id);
    return Promise.resolve({ data: producto });
  }

  createProducto(producto) {
    console.log("Producto creado (simulado):", producto);
    return Promise.resolve({ data: producto });
  }

  updateProducto(id, producto) {
    console.log(`Producto ${id} actualizado (simulado):`, producto);
    return Promise.resolve({ data: producto });
  }

  deleteProducto(id) {
    console.log(`Producto ${id} eliminado (simulado).`);
    return Promise.resolve({ data: { message: "Producto eliminado" } });
  }
}

export default new ProductosService();
