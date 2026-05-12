// Empty string = relative URLs → Vite dev proxy handles them.
// Set VITE_API_URL only when deploying to a separate origin.
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

function getToken() {
  return localStorage.getItem('wordy_token');
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('wordy_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (res.status === 204) return null;
  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.message) message = body.message;
    } catch {}
    throw new Error(message);
  }
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return res.json();
  if (ct.includes('text/')) return res.text();
  return res.blob();
}

export async function apiFetch(path, options = {}) {
  const { headers = {}, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...authHeaders(),
      ...headers,
    },
  });
  return handleResponse(res);
}

export async function apiUpload(path, formData, extraHeaders = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      ...extraHeaders,
    },
    body: formData,
  });
  return handleResponse(res);
}

export { BASE_URL, getToken };
