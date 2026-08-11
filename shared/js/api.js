// NIRVANA MART API Client
const API_BASE = window.location.hostname === 'localhost' || window.location.protocol === 'file:' 
  ? 'http://localhost:3000/api'
  : 'https://nirvana-mart.onrender.com/api';

function getToken() { return localStorage.getItem('vm_token'); }

async function _fetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Timeout: 25s for first load (server may be cold-starting on free hosting)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(API_BASE + path, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Server is waking up — please wait a moment and try again.');
    }
    throw err;
  }
}

const API = {
  get: (path) => _fetch(path, { method: 'GET' }),
  post: (path, body) => _fetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => _fetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => _fetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => _fetch(path, { method: 'DELETE' }),
};

window.API = API;

// Cloudinary Image Optimizer
window.optimizeImage = function(url, width = 600) {
  if (!url) return '';
  if (url.includes('cloudinary.com') && !url.includes('/upload/w_') && !url.includes('/upload/q_')) {
    return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
  }
  return url;
};
