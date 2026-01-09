import adminUser from '../adminUser.json';

class AuthService {
  login(email, password) {
    return new Promise((resolve, reject) => {
      if (email === adminUser.email && password === adminUser.password) {
        // Mocking the API response
        resolve({
          data: {
            nombre: 'Admin',
            email: adminUser.email,
            rol: 1, // Admin role
            token: 'fake-admin-jwt-token-for-ttm-repuestos'
          }
        });
      } else {
        // Mocking an axios error for incorrect credentials
        reject({
          response: {
            status: 401,
            data: {
              message: 'Credenciales incorrectas'
            }
          }
        });
      }
    });
  }

  register(userData) {
    return Promise.reject(new Error('El registro de nuevos usuarios está deshabilitado.'));
  }
}

export default new AuthService();
