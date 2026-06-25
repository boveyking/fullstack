import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add user_id from localStorage to headers for authentication
    const storedUserData = localStorage.getItem('user_data')
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData)
        if (userData.user_id) {
          config.headers['X-User-ID'] = String(userData.user_id)
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data)
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request)
    } else {
      // Something else happened
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
