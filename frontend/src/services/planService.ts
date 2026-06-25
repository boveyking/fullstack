import apiClient from './api'
import { Plan, CreatePlanRequest, UpdatePlanRequest, SubscribePlanRequest, SubscribePlanResponse } from '../types'

/**
 * Service for managing plans
 */
export const planService = {
  /**
   * Get all plans
   */
  async getPlans(): Promise<Plan[]> {
    const response = await apiClient.get<Plan[]>('/api/plans')
    return response.data
  },

  /**
   * Create a new plan
   */
  async createPlan(data: CreatePlanRequest): Promise<Plan> {
    const response = await apiClient.post<Plan>('/api/plans', data)
    return response.data
  },

  /**
   * Update a plan
   */
  async updatePlan(id: number, data: UpdatePlanRequest): Promise<Plan> {
    const response = await apiClient.put<Plan>(`/api/plans/${id}`, data)
    return response.data
  },

  /**
   * Delete a plan (sets is_active to false)
   */
  async deletePlan(id: number): Promise<void> {
    await apiClient.delete(`/api/plans/${id}`)
  },

  /**
   * Get plan(s) by ID. If plan_id is -1, returns all active plans. Otherwise returns list with single plan.
   * Public access endpoint.
   */
  async getPlanById(planId: number): Promise<Plan[]> {
    const response = await apiClient.get<Plan[]>('/api/get_plan_by_id', {
      params: { plan_id: planId }
    })
    return response.data
  },

  /**
   * Subscribe to a plan
   * Requires authentication
   */
  async subscribeToPlan(data: SubscribePlanRequest): Promise<SubscribePlanResponse> {
    const response = await apiClient.post<SubscribePlanResponse>('/api/subscribe', data)
    return response.data
  },
}

