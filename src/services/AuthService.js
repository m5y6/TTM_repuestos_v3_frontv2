import axios from 'axios';
import api from './api'; // Importamos la instancia de axios configurada

const API_URL = 'http://localhost:8080/auth';

class AuthService {
  login(email, password) {
    return axios.post(`${API_URL}/login`, { email, password })
      .then(response => {
        if (response.data.token) {
          // Almacenamos todo el objeto de usuario, que incluye el token
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response;
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(userData) {
    // El registro devuelve un token, así que lo manejamos igual que el login
    return axios.post(`${API_URL}/register`, userData)
      .then(response => {
        if (response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response;
      });
  }

  getAllUsers() {
    return api.get(`${API_URL}/usuarios`);
  }

  updateUserRole(userId, rolId) {
    return api.put(`${API_URL}/usuarios/${userId}/rol?rolId=${rolId}`);
  }

  deleteUser(userId) {
    return api.delete(`${API_URL}/usuarios/${userId}`);
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export default new AuthService();
