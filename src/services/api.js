import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

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
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores, como el 401
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, la devuelve sin cambios
  (error) => {
    // Si el error es 401 (No autorizado) y no es en la página de login
    if (error.response && error.response.status === 401 && window.location.pathname !== '/login') {
      // Disparamos un evento personalizado para que el AuthContext pueda reaccionar
      window.dispatchEvent(new Event('logout-event'));
    }
    return Promise.reject(error);
  }
);

export default api;