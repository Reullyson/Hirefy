import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Instância base do Axios
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor para anexar JWT
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hirefy_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Interceptor global de erros
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hirefy_access_token");
      localStorage.removeItem("hirefy_refresh_token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ======================
// AUTH
// ======================

export const authService = {
  login: (credentials: any) => api.post("/auth/login/", credentials),

  googleLogin: (token: string) => api.post("/auth/google/", { token }),

  refresh: (refresh: string) => api.post("/auth/refresh/", { refresh }),
};

// ======================
// USERS
// ======================

export const userService = {
  getMe: () => api.get("/users/me/"),

  getAllUsers: () => api.get("/users/"),

  getUserById: (id: string | number) => api.get(`/users/${id}/`),

  updateUser: (id: string | number, data: any) =>
    api.patch(`/users/${id}/`, data),

  toggleUserActive: (id: string | number) =>
    api.patch(`/users/${id}/toggle-active/`),

  deleteUser: (id: string | number) => api.delete(`/users/${id}/`),

  updateMe: (data: any) => api.put("/users/me/", data),

  deleteMe: () => api.delete("/users/me/"),

  register: (data: any) => api.post("/users/", data),

  inviteAdmin: (data: { email: string; code: string }) =>
    api.post("/users/invite-admin/", data),

  inviteRecruiter: (data: {
    nome: string;
    email: string;
    company_name: string;
    cnpj: string;
  }) => api.post("/users/invite-recruiter/", data),

  acceptInvite: (data: {
    uid: string;
    token: string;
    password: string;
    confirm_password: string;
  }) => api.post("/users/accept-invite/", data),

  changePassword: (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => api.post("/users/change-password/", data),

  resetPasswordRequest: (email: string) =>
    api.post("/users/reset-password-request/", { email }),

  resetPasswordConfirm: (data: {
    uid: string;
    token: string;
    password: string;
    confirm_password: string;
  }) => api.post("/users/reset-password-confirm/", data),
};

// ======================
// JOBS
// ======================

export const jobService = {
  list: () => api.get("/jobs/"),

  getById: (id: string | number) => api.get(`/jobs/${id}/`),

  create: (data: any) => api.post("/jobs/", data),

  update: (id: string | number, data: any) => api.patch(`/jobs/${id}/`, data),

  delete: (id: string | number) => api.delete(`/jobs/${id}/`),

  approve: (id: string | number) => api.patch(`/jobs/${id}/aprovar/`),

  reject: (id: string | number) => api.patch(`/jobs/${id}/rejeitar/`),

  importGupy: (url: string) => api.post("/jobs/import-gupy/", { url }),
};

// ======================
// COMPANIES
// ======================

export const companyService = {
  list: () => api.get("/companies/"),

  getOwnCompany: () => api.get("/companies/"),

  getById: (id: string | number) => api.get(`/companies/${id}/`),

  create: (data: any) => api.post("/companies/", data),

  update: (id: string | number, data: any) => api.patch(`/companies/${id}/`, data),

  approve: (id: string | number) => api.patch(`/companies/${id}/aprovar/`),

  reject: (id: string | number) => api.patch(`/companies/${id}/rejeitar/`),
};

// ======================
// APPLICATIONS
// ======================

export const applicationService = {
  list: (jobId?: string | number) =>
    api.get("/applications/", { params: { job: jobId } }),

  getById: (id: string | number) => api.get(`/applications/${id}/`),

  create: (data: any) => api.post("/applications/", data),

  update: (id: string | number, data: any) =>
    api.patch(`/applications/${id}/`, data),

  updateStatus: (id: string | number, status: string, feedback?: string) =>
    api.patch(`/applications/${id}/`, { status, feedback }),

  delete: (id: string | number) => api.delete(`/applications/${id}/`),
};

// ======================
// SCRAPER
// ======================

const scraperApi = axios.create({
  baseURL: "/scraper",
  headers: {
    "Content-Type": "application/json",
  },
});

export const scraperService = {
  listVagas: () => scraperApi.get("/vagas"),
};