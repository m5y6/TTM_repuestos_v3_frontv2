import axios from "axios";

const API_URL = "/api/ventas";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

class VentaService {
  getVentas() {
    return api.get("/");
  }

  createVenta(ventaData) {
    return api.post("/", ventaData);
  }

  getVentaById(id) {
    return api.get(`/${id}`);
  }

  updateVentaStatus(id, estado) {
    return api.put(`/${id}/estado`, { estado });
  }
}

export default new VentaService();