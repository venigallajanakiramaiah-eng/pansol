async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong.');
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  soils: () => request('/soils'),
  soil: (slug) => request(`/soils/${slug}`),
  categories: () => request('/categories'),
  popularPlants: () => request('/plants/popular'),
  plants: ({ soil, category } = {}) => {
    const params = new URLSearchParams();
    if (soil) params.set('soil', soil);
    if (category) params.set('category', category);
    const qs = params.toString();
    return request(`/plants${qs ? `?${qs}` : ''}`);
  },
  plant: (slug) => request(`/plants/${slug}`),
  searchPlants: (q) => request(`/plants/search?q=${encodeURIComponent(q)}`),
};
