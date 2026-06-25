import apiClient from './api'
import { Group, GroupWithNodes, CreateGroupRequest, UpdateGroupRequest, Node, AssignNodesRequest } from '../types'

/**
 * Service for managing groups
 */
export const groupService = {
  /**
   * Get all groups
   */
  async getGroups(): Promise<Group[]> {
    const response = await apiClient.get<Group[]>('/api/groups')
    return response.data
  },

  /**
   * Get a single group with its nodes
   */
  async getGroup(groupId: number): Promise<GroupWithNodes> {
    const response = await apiClient.get<GroupWithNodes>(`/api/groups/${groupId}`)
    return response.data
  },

  /**
   * Create a new group
   */
  async createGroup(data: CreateGroupRequest): Promise<Group> {
    const response = await apiClient.post<Group>('/api/groups', data)
    return response.data
  },

  /**
   * Update a group
   */
  async updateGroup(id: number, data: UpdateGroupRequest): Promise<Group> {
    const response = await apiClient.put<Group>(`/api/groups/${id}`, data)
    return response.data
  },

  /**
   * Delete a group (sets is_active to false)
   */
  async deleteGroup(id: number): Promise<void> {
    await apiClient.delete(`/api/groups/${id}`)
  },

  /**
   * Get all nodes, optionally filtered by group or unassigned
   */
  async getNodes(groupId?: number, unassigned?: boolean): Promise<Node[]> {
    const params: Record<string, string | number | boolean> = {}
    if (groupId !== undefined) {
      params.group_id = groupId
    }
    if (unassigned !== undefined) {
      params.unassigned = unassigned
    }
    const response = await apiClient.get<Node[]>('/api/nodes', { params })
    return response.data
  },

  /**
   * Assign nodes to a group
   */
  async assignNodesToGroup(groupId: number, nodeIds: number[]): Promise<void> {
    await apiClient.post(`/api/groups/${groupId}/nodes`, { node_ids: nodeIds })
  },

  /**
   * Remove nodes from a group
   */
  async removeNodesFromGroup(groupId: number, nodeIds: number[]): Promise<void> {
    await apiClient.post(`/api/groups/${groupId}/nodes/remove`, {
      node_ids: nodeIds
    })
  },
}

