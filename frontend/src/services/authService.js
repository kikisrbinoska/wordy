import { apiFetch } from '../lib/api.js';
import { JWT_KEY } from '../lib/constants.js';

/**
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>} JWT token
 */
export async function login(username, password) {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (response.token) {
    localStorage.setItem(JWT_KEY, response.token);
    return response.token;
  }
  throw new Error('No token returned from server');
}

/**
 * @param {string} username
 * @param {string} password
 * @param {string} name
 * @param {string} surname
 * @param {string} email
 * @returns {Promise<Object>} User object
 */
export async function register(username, password, name, surname, email) {
  const response = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      name,
      surname,
      email,
    }),
  });
  return response;
}

export function logout() {
  localStorage.removeItem(JWT_KEY);
  window.location.href = '/login';
}

export function getToken() {
  return localStorage.getItem(JWT_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.sub ?? payload.username,
      roles: payload.roles ?? [],
    };
  } catch {
    return null;
  }
}

