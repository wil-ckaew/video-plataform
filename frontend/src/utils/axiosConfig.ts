// src/utils/axiosConfig.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080', // URL base para a API
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
