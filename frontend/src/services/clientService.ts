import apiClient from './api'
import { Client, CreateClientRequest, UpdateClientRequest } from '../types'

/**
 * Service for managing clients
 */
export const clientService = {
  /**
   * Get all clients
   */
  async getClients(): Promise<Client[]> {
    const response = await apiClient.get<Client[]>('/api/clients')
    return response.data
  },

  /**
   * Create a new client
   */
  async createClient(data: CreateClientRequest): Promise<Client> {
    const response = await apiClient.post<Client>('/api/clients', data)
    return response.data
  },

  /**
   * Update a client
   */
  async updateClient(id: number, data: UpdateClientRequest): Promise<Client> {
    const response = await apiClient.put<Client>(`/api/clients/${id}`, data)
    return response.data
  },

  /**
   * Delete a client (sets is_active to false)
   */
  async deleteClient(id: number): Promise<void> {
    await apiClient.delete(`/api/clients/${id}`)
  },
}

