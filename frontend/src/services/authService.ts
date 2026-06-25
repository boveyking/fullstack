import apiClient from './api'

export interface RegisterRequest {
  user_name: string
  email: string
  password: string
  password_again: string
  ref_code?: string
}

export interface RegisterApiRequest {
  user_name: string
  email: string
  password: string
  ref_code?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user_id: number
  user_name: string
  email: string
  role?: string
  plan_id?: number
}

export interface ResetPasswordRequest {
  email: string
}

export interface ResetPasswordConfirm {
  token: string
  password: string
}

/**
 * Service for authentication
 */
export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterApiRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/register', data)
    return response.data
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', data)
    return response.data
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout')
  },

  /**
   * Verify user email with token
   */
  async verifyUser(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/api/auth/verify/${token}`)
    return response.data
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/reset-password', data)
    return response.data
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordConfirm): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/reset-password/confirm', data)
    return response.data
  },
}

