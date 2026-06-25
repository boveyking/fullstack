import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Button,
  Table,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Switch,
  Group,
  Stack,
  Alert,
  Loader,
  Paper,
  Textarea,
  Select,
  Checkbox,
  ScrollArea,
  Divider,
  Text,
  Grid,
  Box,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Trash2, Plus, Edit, Users,Computer,Network,Globe } from 'lucide-react'
import { groupService } from '../services/groupService'
import { planService } from '../services/planService'
import { Group as GroupType, CreateGroupRequest, Node, Plan } from '../types'

function GroupMgr() {
  const [groups, setGroups] = useState<GroupType[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [allNodes, setAllNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [opened, { open, close }] = useDisclosure(false)
  const [nodesModalOpened, { open: openNodesModal, close: closeNodesModal }] = useDisclosure(false)
  const [editingGroup, setEditingGroup] = useState<GroupType | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null)
  const [groupNodes, setGroupNodes] = useState<Node[]>([])
  const [availableNodes, setAvailableNodes] = useState<Node[]>([])
  const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: '',
    description: '',
    is_active: true,
    plan_id: undefined,
  })

  const loadGroups = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await groupService.getGroups()
      setGroups(data)
    } catch (err) {
      setError('Failed to load groups')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadPlans = async () => {
    try {
      const data = await planService.getPlans()
      setPlans(data.filter(p => p.is_active))
    } catch (err) {
      console.error('Failed to load plans:', err)
    }
  }

  const loadNodes = async () => {
    try {
      const data = await groupService.getNodes()
      setAllNodes(data)
    } catch (err) {
      console.error('Failed to load nodes:', err)
    }
  }

  useEffect(() => {
    loadGroups()
    loadPlans()
    loadNodes()
  }, [])

  const handleOpenAdd = () => {
    setEditingGroup(null)
    setFormData({
      name: '',
      description: '',
      is_active: true,
      plan_id: undefined,
    })
    open()
  }

  const handleOpenEdit = (group: GroupType) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      is_active: group.is_active,
      plan_id: group.plan_id,
    })
    open()
  }

  const handleOpenNodesModal = async (group: GroupType) => {
    setSelectedGroup(group)
    setSelectedNodeIds([])
    try {
      // Load nodes for this group
      const groupData = await groupService.getGroup(group.id)
      setGroupNodes(groupData.nodes || [])
      
      // Load all nodes to show which ones are not in this group
      // In many-to-many, a node can be in multiple groups, so we show all nodes
      // and indicate which groups they belong to
      const allNodes = await groupService.getNodes()
      
      // Filter out nodes that are already in this group
      const nodesNotInGroup = allNodes.filter(
        node => !node.group_ids || !node.group_ids.includes(group.id)
      )
      setAvailableNodes(nodesNotInGroup)
      
      openNodesModal()
    } catch (err) {
      setError('Failed to load nodes')
      console.error(err)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Group name is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      if (editingGroup) {
        await groupService.updateGroup(editingGroup.id, formData)
      } else {
        await groupService.createGroup(formData)
      }
      
      close()
      loadGroups()
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${editingGroup ? 'update' : 'create'} group`)
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this group? This will set it to inactive.')) return

    try {
      await groupService.deleteGroup(id)
      loadGroups()
    } catch (err) {
      setError('Failed to delete group')
      console.error(err)
    }
  }

  const handleAssignNodes = async () => {
    if (!selectedGroup || selectedNodeIds.length === 0) return

    try {
      setSubmitting(true)
      setError(null)
      await groupService.assignNodesToGroup(selectedGroup.id, selectedNodeIds)
      setSelectedNodeIds([])
      await loadNodes() // Reload all nodes to update counts
      await handleOpenNodesModal(selectedGroup) // Reload nodes in modal
      loadGroups() // Reload groups
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to assign nodes')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveNodes = async (nodeIds: number[]) => {
    if (!selectedGroup) return

    try {
      setSubmitting(true)
      setError(null)
      await groupService.removeNodesFromGroup(selectedGroup.id, nodeIds)
      await loadNodes() // Reload all nodes to update counts
      await handleOpenNodesModal(selectedGroup) // Reload nodes in modal
      loadGroups() // Reload groups
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove nodes')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const getPlanName = (planId?: number) => {
    if (!planId) return '-'
    const plan = plans.find(p => p.id === planId)
    return plan ? plan.name : '-'
  }

  const getNodeCount = (groupId: number) => {
    return allNodes.filter(node => 
      node.group_ids && node.group_ids.includes(groupId)
    ).length
  }

  const rows = groups.map((group) => (
    <Table.Tr key={group.id}>
      <Table.Td>{group.id}</Table.Td>
      <Table.Td>{group.name}</Table.Td>
      <Table.Td>{group.description || '-'}</Table.Td>
      <Table.Td>{getPlanName(group.plan_id)}</Table.Td>
      <Table.Td>
        <Badge color={group.is_active ? 'green' : 'gray'}>
          {group.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>{getNodeCount(group.id)}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleOpenNodesModal(group)}
            title="Manage Nodes"
          >
            <Network size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleOpenEdit(group)}
          >
            <Edit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDelete(group.id)}
          >
            <Trash2 size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Group Management</Title>
        <Button leftSection={<Plus size={16} />} onClick={handleOpenAdd}>
          Add Group
        </Button>
      </Group>

      {error && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <Paper shadow="xs" p="md">
        {loading ? (
          <Group justify="center" p="xl">
            <Loader />
          </Group>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Nodes</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {groups.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                    No groups found
                  </Table.Td>
                </Table.Tr>
              ) : (
                rows
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      {/* Group Add/Edit Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={editingGroup ? 'Edit Group' : 'Add New Group'}
        centered
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Group Name"
            placeholder="Enter group name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            maxLength={30}
            disabled={submitting}
          />

          <Textarea
            label="Description"
            placeholder="Enter group description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            maxLength={200}
            disabled={submitting}
          />

          <Select
            label="Plan"
            placeholder="Select a plan (optional)"
            data={plans.map(plan => ({ value: plan.id.toString(), label: plan.name }))}
            value={formData.plan_id?.toString() || null}
            onChange={(value) =>
              setFormData({ ...formData, plan_id: value ? parseInt(value) : undefined })
            }
            clearable
            disabled={submitting}
          />

          <Switch
            label="Active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.currentTarget.checked })
            }
            disabled={submitting}
          />

          {error && (
            <Alert color="red" onClose={() => setError(null)} withCloseButton>
              {error}
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editingGroup ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Node Management Modal */}
      <Modal
        opened={nodesModalOpened}
        onClose={closeNodesModal}
        title={`Manage Nodes - ${selectedGroup?.name || ''}`}
        centered
        size="lg"
      >
        <Stack gap="md">
          {/* Current Nodes in Group */}
          <div>
            <Title order={5} mb="sm">Nodes in This Group ({groupNodes.length})</Title>
            <Text size="xs" c="dimmed" mb="sm">
              Removing a node from this group will not remove it from other groups
            </Text>
            {groupNodes.length === 0 ? (
              <Text c="dimmed">No nodes assigned to this group</Text>
            ) : (
              <ScrollArea h={300}>
                <Grid gutter="xs">
                  {groupNodes.map((node) => {
                    const otherGroupIds = node.group_ids?.filter(gid => gid !== selectedGroup?.id) || []
                    return (
                      <Grid.Col key={node.id} span={3}>
                        <Box p={8} style={{ borderRadius: 4, border: '1px solid #dee2e6' }}>
                          <Group justify="space-between" gap="xs">
                            <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                              <Text size="sm" truncate style={{ flex: 1 }}>
                                {node.remark || `Node #${node.id}`}
                              </Text>
                              {otherGroupIds.length > 0 && (
                                <Badge size="xs" color="blue"  >
                                  +{otherGroupIds.length}
                                </Badge>
                              )}
                            </Group>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => handleRemoveNodes([node.id])}
                              disabled={submitting}
                              title="Remove from this group"
                            >
                              <Trash2 size={14} />
                            </ActionIcon>
                          </Group>
                        </Box>
                      </Grid.Col>
                    )
                  })}
                </Grid>
              </ScrollArea>
            )}
          </div>

          <Divider />

          {/* Available Nodes to Assign */}
          <div>
            <Title order={5} mb="sm">Nodes Not in This Group ({availableNodes.length})</Title>
            <Text size="xs" c="dimmed" mb="sm">
              Nodes can belong to multiple groups. Adding a node here will add it to this group without removing it from others.
            </Text>
            {availableNodes.length === 0 ? (
              <Text c="dimmed">All nodes are already in this group</Text>
            ) : (
              <ScrollArea h={300}>
                <Grid gutter="xs">
                  {availableNodes.map((node) => {
                    const nodeGroupIds = node.group_ids || []
                    return (
                      <Grid.Col key={node.id} span={3}>
                        <Box p={8} style={{ borderRadius: 4, border: '1px solid #dee2e6' }}>
                          <Group gap="xs" wrap="nowrap">
                            <Checkbox
                              checked={selectedNodeIds.includes(node.id)}
                              onChange={(e) => {
                                if (e.currentTarget.checked) {
                                  setSelectedNodeIds([...selectedNodeIds, node.id])
                                } else {
                                  setSelectedNodeIds(selectedNodeIds.filter(id => id !== node.id))
                                }
                              }}
                              disabled={submitting}
                              label={node.remark || `Node #${node.id}`}
                              styles={{ label: { fontSize: '0.875rem' } }}
                            />
                            {nodeGroupIds.length > 0 && (
                              <Badge size="xs" color="orange" >
                                {nodeGroupIds.length}
                              </Badge>
                            )}
                          </Group>
                        </Box>
                      </Grid.Col>
                    )
                  })}
                </Grid>
              </ScrollArea>
            )}
          </div>

          {error && (
            <Alert color="red" onClose={() => setError(null)} withCloseButton>
              {error}
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeNodesModal} disabled={submitting}>
              Close
            </Button>
            <Button
              onClick={handleAssignNodes}
              loading={submitting}
              disabled={selectedNodeIds.length === 0}
            >
              Add to This Group ({selectedNodeIds.length})
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}

export default GroupMgr

