import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

// Services API
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getCategories: () => api.get('/services/categories'),
  search: (query) => api.get(`/services/search?q=${query}`)
}

// Bookings API
export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getByUser: (userId) => api.get(`/bookings/user/${userId}`),
  getByProvider: (providerId) => api.get(`/bookings/provider/${providerId}`),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  addReview: (id, review) => api.post(`/bookings/${id}/review`, review)
}

// Providers API
export const providersAPI = {
  getAll: (params) => api.get('/providers', { params }),
  getById: (id) => api.get(`/providers/${id}`),
  updateProfile: (data) => api.put('/providers/profile', data),
  updateLocation: (location) => api.put('/providers/location', location),
  getEarnings: () => api.get('/providers/earnings')
}

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data)
}

// Reviews API
export const reviewsAPI = {
  getByService: (serviceId) => api.get(`/reviews/service/${serviceId}`),
  getByProvider: (providerId) => api.get(`/reviews/provider/${providerId}`),
  create: (reviewData) => api.post('/reviews', reviewData)
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getProviders: (params) => api.get('/admin/providers', { params }),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  approveProvider: (id) => api.put(`/admin/providers/${id}/approve`),
  rejectProvider: (id) => api.put(`/admin/providers/${id}/reject`)
}

export default api