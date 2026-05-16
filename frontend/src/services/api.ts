import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Instância base do Axios para chamadas à API
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para anexar o Token JWT em todas as requisições
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hirefy_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor para tratar erros globais (Ex: Token expirado)
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Lógica de refresh token poderia ser implementada aqui
      // Por enquanto, apenas limpa o storage se o token for inválido
      localStorage.removeItem('hirefy_access_token');
    }
    return Promise.reject(error);
  }
);

// --- SERVICES ---

/**
 * SERVIÇO DE AUTENTICAÇÃO
 */
export const authService = {
  login: (credentials: any) => api.post('/auth/login/', credentials),
  refresh: (refresh: string) => api.post('/auth/refresh/', { refresh }),
};

/**
 * SERVIÇO DE USUÁRIOS / PERFIL
 */
export const userService = {
  getMe: () => api.get('/users/me/'),
  updateMe: (data: any) => api.put('/users/me/', data),
  deleteMe: () => api.delete('/users/me/'),
  register: (data: any) => api.post('/users/', data),
};

/**
 * SERVIÇO DE VAGAS (JOBS)
 */
export const jobService = {
  list: () => api.get('/jobs/'),
  getById: (id: string | number) => api.get(`/jobs/${id}/`),
  create: (data: any) => api.post('/jobs/', data),
  update: (id: string | number, data: any) => api.put(`/jobs/${id}/`, data),
  delete: (id: string | number) => api.delete(`/jobs/${id}/`),
};

/**
 * SERVIÇO DE EMPRESAS
 */
export const companyService = {
  getOwnCompany: () => api.get('/companies/'),
  create: (data: any) => api.post('/companies/', data),
  update: (id: string | number, data: any) => api.put(`/companies/${id}/`, data),
};

/**
 * SERVIÇO DE SCRAPING (vagas externas)
 */
const scraperApi = axios.create({
  baseURL: '/scraper',
  headers: { 'Content-Type': 'application/json' },
});

export const scraperService = {
  listVagas: () => scraperApi.get('/vagas'),
};
