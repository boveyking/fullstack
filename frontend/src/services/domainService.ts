import apiClient from './api'
import { Domain, CreateDomainRequest, UpdateDomainRequest } from '../types'

/**
 * Service for managing domains
 */
export const domainService = {
  /**
   * Get all domains
   */
  async getDomains(): Promise<Domain[]> {
    const response = await apiClient.get<Domain[]>('/api/domains')
    return response.data
  },

  /**
   * Create a new domain
   */
  async createDomain(data: CreateDomainRequest): Promise<Domain> {
    const response = await apiClient.post<Domain>('/api/domains', data)
    return response.data
  },

  /**
   * Update a domain
   */
  async updateDomain(id: number, data: UpdateDomainRequest): Promise<Domain> {
    const response = await apiClient.put<Domain>(`/api/domains/${id}`, data)
    return response.data
  },

  /**
   * Delete a domain
   */
  async deleteDomain(id: number): Promise<void> {
    await apiClient.delete(`/api/domains/${id}`)
  },
}

