import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login if the token is invalid/expired
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, data) => api.post(`/api/auth/reset-password/${token}`, data),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data) => api.put('/api/users/me', data),
  changePassword: (data) => api.put('/api/users/change-password', data),
  uploadResume: (formData) => {
    return api.post('/api/users/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Internships API
export const internshipsAPI = {
  getAll: (params = {}) => api.get('/api/internships', { params }),
  getById: (id) => api.get(`/api/internships/${id}`),
  getRecommendations: (params = {}) => api.get('/api/internships/recommendations', { params }),
  apply: (internshipId, data) => api.post(`/api/internships/${internshipId}/apply`, data),
  getApplications: (params = {}) => api.get('/api/applications', { params }),
  getApplication: (id) => api.get(`/api/applications/${id}`),
  updateApplication: (id, data) => api.put(`/api/applications/${id}`, data),
};

// Admin API
export const adminAPI = {
  // Internships
  createInternship: (data) => api.post('/api/admin/internships', data),
  updateInternship: (id, data) => api.put(`/api/admin/internships/${id}`, data),
  deleteInternship: (id) => api.delete(`/api/admin/internships/${id}`),
  uploadInternships: (formData) => {
    return api.post('/api/admin/internships/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  syncGovernmentInternships: () => api.post('/api/admin/internships/sync/government'),
  
  // Users
  getUsers: (params = {}) => api.get('/api/admin/users', { params }),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  createUser: (data) => api.post('/api/admin/users', data),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  
  // Applications
  getAllApplications: (params = {}) => api.get('/api/admin/applications', { params }),
  updateApplicationStatus: (id, status) => api.put(`/api/admin/applications/${id}/status`, { status }),
};

export default api;
