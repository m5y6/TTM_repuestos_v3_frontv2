import users from '../adminUser.json';

class AuthService {
  login(email, password) {
    return new Promise((resolve, reject) => {
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        // Mocking the API response
        resolve({
          data: {
            nombre: user.email.split('@')[0], // Or a name property if you add one
            email: user.email,
            rol: user.rol === 'admin' ? 1 : 2, // Assuming 1 for admin, 2 for employee
            token: `fake-${user.rol}-jwt-token-for-ttm-repuestos`
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
