import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecocollect_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Centralized error handling (Phase 8): normalize backend error shape
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail
    const message = typeof detail === 'string' ? detail : 'Something went wrong. Please try again.'
    return Promise.reject({ ...error, message })
  }
)

export default api
