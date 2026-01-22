import api from './api'; // Importamos la instancia de axios configurada

class AuthService {
  login(email, password) {
    return api.post('/auth/login', { email, password })
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
    return api.post('/auth/register', userData)
      .then(response => {
        if (response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response;
      });
  }

  getAllUsers() {
    return api.get('/auth/usuarios');
  }

  updateUserRole(userId, rolId) {
    return api.put(`/auth/usuarios/${userId}/rol?rolId=${rolId}`);
  }

  deleteUser(userId) {
    return api.delete(`/auth/usuarios/${userId}`);
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export default new AuthService();
