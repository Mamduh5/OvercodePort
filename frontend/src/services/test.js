//for specific middleware / api

// src/services/userService.js
import api from '@/lib/api';

export async function getUsers() {
  const res = await api.get('/users');
  return res.data;
}