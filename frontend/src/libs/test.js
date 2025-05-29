// for base middleware / api

// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // your backend
  timeout: 5000,
});

export default api;