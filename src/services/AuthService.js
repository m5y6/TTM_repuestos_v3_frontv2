import axios from 'axios';

const AUTH_API_URL = '/api/auth/';

class AuthService {
  login(email, password) {
    return axios.post(AUTH_API_URL + 'login', {
      email,
      password,
    });
  }

  register(userData) {
    return axios.post(AUTH_API_URL + 'register', userData);
  }
}

export default new AuthService();
