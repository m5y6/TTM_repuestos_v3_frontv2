import axios from 'axios';

const api = axios.create();

// Interceptor para añadir el token de autenticación a las cabeceras
api.interceptors.request.use(
  (config) => {
    // Obtener el objeto de usuario del localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      const token = user ? user.token : null;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // No establecer Content-Type manualmente para FormData
    // Axios lo hará automáticamente con el boundary correcto
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
