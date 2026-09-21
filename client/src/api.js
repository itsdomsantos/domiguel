import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Anexa o token de autenticação, se existir.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('domdot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
