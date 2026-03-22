import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // Твой порт из index.ts
});

// Автоматически добавляем токен в каждый запрос, если он есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;