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

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login page
      // We can't use useNavigate here, so we use window.location
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

class ProductosService {
  getAllProductos() {
    return api.get("");
  }

  getProductoById(id) {
    return api.get(`/${id}`);
  }

  createProductos(producto) {
    return api.post("", producto);
  }

  updateProductos(id, producto) {
    return api.put(`/${id}`, producto);
  }

  deleteProducto(id) {
    return api.delete(`/${id}`);
  }
}

export default new ProductosService();
