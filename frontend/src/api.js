const TOKEN_KEY = 'guitare_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const response = await fetch(path, { method, headers, body: payload });
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Erreur inattendue');
  }
  return data;
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  me: () => {
    if (!getToken()) return Promise.reject(new Error('Session absente'));
    return request('/api/auth/me');
  },
  courses: () => request('/api/courses'),
  course: (id) => request(`/api/courses/${id}`),
  createCourse: (body) => request('/api/courses', { method: 'POST', body }),
  updateCourse: (id, body) => request(`/api/courses/${id}`, { method: 'PATCH', body }),
  deleteCourse: (id) => request(`/api/courses/${id}`, { method: 'DELETE' }),
  createLesson: (courseId, formData) => request(`/api/courses/${courseId}/lessons`, { method: 'POST', body: formData }),
  visitLesson: (courseId, lessonId) => request(`/api/progress/${courseId}/lessons/${lessonId}/visit`, { method: 'POST', body: {} }),
  completeLesson: (courseId, lessonId) => request(`/api/progress/${courseId}/lessons/${lessonId}/complete`, { method: 'POST', body: {} }),
  streamUrl: (lessonId) => `/api/lessons/${lessonId}/stream?token=${encodeURIComponent(getToken() || '')}`,
};
