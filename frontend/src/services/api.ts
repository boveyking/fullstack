import axios, { AxiosInstance, AxiosError } from 'axios'

// Use environment variable if set, otherwise use relative URLs in production
// This allows the frontend to work when served from the same domain as the API
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
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

// Registration API
export interface RegisterRequest {
  name: string
  username: string
  email: string
  title?: string
  password: string
  alias?: string
  intro: string
  city: string
  country: string
  org_name: string
  public: boolean
  flag?: string
  logo?: string
}

export interface RegisterResponse {
  user_id: number
  org_id: number
  address_id: number
  message: string
}

export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/api/register', data)
  return response.data
}

export interface OrgDataByTokenResponse {
  email: string
  organization: string
  city?: string
  country?: string
  intro?: string
  title?: string
  user_name?: string
  name?: string
  alias_name?: string
  logo?: string
  status?: string
}

export const getOrgByToken = async (token: string): Promise<OrgDataByTokenResponse> => {
  const response = await apiClient.get<OrgDataByTokenResponse>(`/api/organization/token/${token}`)
  return response.data
}

// Organization API
export interface Organization {
  id: number
  org_name: string | null
  org_desc: string | null
  is_active: boolean | null
  address_id: number | null
  create_datetime: string | null
  status: string | null
  is_public: boolean | null
  city: string | null
}

export interface OrganizationsPaginatedResponse {
  items: Organization[]
  total: number
  offset: number
  limit: number
}

export const getOrganizations = async (
  offset: number = 0,
  length: number = 10
): Promise<OrganizationsPaginatedResponse> => {
  const response = await apiClient.get<OrganizationsPaginatedResponse>('/api/organizations', {
    params: { offset, length }
  })
  return response.data
}

export interface UpdateOrganizationStatusRequest {
  status: string
}

export const updateOrganizationStatus = async (
  orgId: number,
  status: string
): Promise<Organization> => {
  const response = await apiClient.patch<Organization>(
    `/api/organizations/${orgId}/status`,
    { status } as UpdateOrganizationStatusRequest
  )
  return response.data
}

// User API
export interface User {
  id: number
  user_name: string | null
  name: string | null
  email: string | null
  title: string | null
  is_active: boolean | null
  org_name: string | null
}

export interface UsersPaginatedResponse {
  items: User[]
  total: number
  offset: number
  limit: number
}

export const getUsers = async (
  offset: number = 0,
  length: number = 10
): Promise<UsersPaginatedResponse> => {
  const response = await apiClient.get<UsersPaginatedResponse>('/api/users', {
    params: { offset, length }
  })
  return response.data
}

// Login API
export interface LoginRequest {
  username_or_email: string
  password: string
}

export interface UserData {
  user_id: number
  user_name: string | null
  email: string | null
  org_id: number | null
  logo: string | null
}

export interface LoginResponse {
  code: number
  result: boolean
  message?: string
  user_data?: UserData
}

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/login', data)
  return response.data
}

// Invite API
export interface InviteRequest {
  email: string
  organization: string
}

export interface InviteResponse {
  code: number
  result: boolean
  message: string
  invite_id?: number | null
}

export const inviteUser = async (data: InviteRequest): Promise<InviteResponse> => {
  const response = await apiClient.post<InviteResponse>('/api/invite', data)
  return response.data
}

// Verify API
export interface VerifyResponse {
  code: number
  result: boolean
  message: string
  email?: string | null
  organization?: string | null
}

export const verifyInvitation = async (token: string): Promise<VerifyResponse> => {
  const response = await apiClient.get<VerifyResponse>(`/api/verify/${token}`)
  return response.data
}

// User Info API
export interface UserInfo {
  user_id: number
  user_name: string | null
  name: string | null
  email: string | null
  title: string | null
  alias_name: string | null
  is_active: boolean | null
  role: string | null
  create_datetime: string | null
  org_id: number | null
  org_name: string | null
  org_desc: string | null
  org_status: string | null
  is_public: boolean | null
  logo: string | null
  address_id: number | null
  city: string | null
  country: string | null
}

export const getUserInfo = async (userId: number): Promise<UserInfo> => {
  const response = await apiClient.get<UserInfo>(`/api/user/${userId}`)
  return response.data
}

// Password Reset API
export interface PasswordResetRequest {
  username_or_email: string
}

export interface PasswordResetResponse {
  code: number
  result: boolean
  message: string
}

export const sendResetPasswordEmail = async (usernameOrEmail: string): Promise<PasswordResetResponse> => {
  const response = await apiClient.post<PasswordResetResponse>('/api/reset-password/request', {
    username_or_email: usernameOrEmail
  } as PasswordResetRequest)
  return response.data
}

// Reset Password with Token API
export interface ResetPasswordWithTokenRequest {
  token: string
  password: string
}

export interface ResetPasswordWithTokenResponse {
  code: number
  result: boolean
  message: string
}

export const resetPasswordWithToken = async (
  token: string,
  password: string
): Promise<ResetPasswordWithTokenResponse> => {
  const response = await apiClient.post<ResetPasswordWithTokenResponse>('/api/reset-password', {
    token,
    password
  } as ResetPasswordWithTokenRequest)
  return response.data
}

export default apiClient
