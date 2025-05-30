import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/user')
};

export const stationService = {
  getAll: () => api.get('/stations'),
  getById: (id) => api.get(`/stations/${id}`),
  create: (station) => api.post('/stations', station),
  update: (id, station) => api.put(`/stations/${id}`, station),
  delete: (id) => api.delete(`/stations/${id}`)
};

export default api;
