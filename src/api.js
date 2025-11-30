import { API_URL } from './config.js';

// Helper function for GET, POST, etc. with token
export async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("No token found. Please login.");

  // Add Authorization header
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) {
    const message = data.error || data.message || "Request failed";
    throw new Error(message);
  }

  return data;
}
