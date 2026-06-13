export const API_URL = import.meta.env.VITE_API_URL || 'https://api.atyant.in';

export async function apiRequest(path, options = {}) {
  const response = await fetch(${API_URL} + path, options);
  if (!response.ok) throw new Error('API request failed');
  return response.json();
}

