import apiClient from './api'
import { Instance, CreateInstanceRequest, HealthStatus, AwsSetting } from '../types'

/**
 * Service for managing AWS instances
 */
export const instanceService = {
  /**
   * Get health status of the backend
   */
  async getHealth(): Promise<HealthStatus> {
    const response = await apiClient.get<HealthStatus>('/api/health')
    return response.data
  },

  /**
   * Get all instances with optional filters
   */
  async getInstances(region?: string, isActive?: boolean): Promise<Instance[]> {
    const params = new URLSearchParams()
    if (region) params.append('region', region)
    if (isActive !== undefined) params.append('is_active', String(isActive))
    
    const response = await apiClient.get<Instance[]>(`/api/instances?${params.toString()}`)
    return response.data
  },

  /**
   * Create a new instance
   */
  async createInstance(data: CreateInstanceRequest): Promise<Instance> {
    const response = await apiClient.post<Instance>('/api/instances', data)
    return response.data
  },

  /**
   * Delete an instance
   */
  async deleteInstance(id: number): Promise<void> {
    await apiClient.delete(`/api/instances/${id}`)
  },

  /**
   * Get all AWS settings (regions, cities, AMI IDs)
   */
  async getSettings(): Promise<AwsSetting[]> {
    const response = await apiClient.get<AwsSetting[]>('/api/settings')
    return response.data
  },
}
