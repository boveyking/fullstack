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
  NumberInput,
  Switch,
  Group,
  Stack,
  Alert,
  Loader,
  Paper,
  Textarea,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Trash2, Plus, Edit } from 'lucide-react'
import { planService } from '../services/planService'
import { Plan, CreatePlanRequest } from '../types'

function PlanMgr() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [opened, { open, close }] = useDisclosure(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<CreatePlanRequest>({
    name: '',
    description: '',
    is_active: true,
    month_price: undefined,
    bandwidth: undefined,
    connection: undefined,
  })

  const loadPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await planService.getPlans()
      setPlans(data)
    } catch (err) {
      setError('Failed to load plans')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const handleOpenAdd = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      description: '',
      is_active: true,
      month_price: undefined,
      bandwidth: undefined,
      connection: undefined,
    })
    open()
  }

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      is_active: plan.is_active,
      month_price: plan.month_price,
      bandwidth: plan.bandwidth,
      connection: plan.connection,
    })
    open()
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Plan name is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      if (editingPlan) {
        await planService.updatePlan(editingPlan.id, formData)
      } else {
        await planService.createPlan(formData)
      }
      
      close()
      loadPlans()
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${editingPlan ? 'update' : 'create'} plan`)
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan? This will set it to inactive.')) return

    try {
      await planService.deletePlan(id)
      loadPlans()
    } catch (err) {
      setError('Failed to delete plan')
      console.error(err)
    }
  }

  const rows = plans.map((plan) => (
    <Table.Tr key={plan.id}>
      <Table.Td>{plan.id}</Table.Td>
      <Table.Td>{plan.name}</Table.Td>
      <Table.Td>{plan.description || '-'}</Table.Td>
      <Table.Td>{plan.month_price !== null && plan.month_price !== undefined ? `$${plan.month_price}` : '-'}</Table.Td>
      <Table.Td>{plan.bandwidth !== null && plan.bandwidth !== undefined ? `${plan.bandwidth} GB` : '-'}</Table.Td>
      <Table.Td>{plan.connection !== null && plan.connection !== undefined ? plan.connection : '-'}</Table.Td>
      <Table.Td>
        <Badge color={plan.is_active ? 'green' : 'gray'}>
          {plan.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleOpenEdit(plan)}
          >
            <Edit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDelete(plan.id)}
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
        <Title order={2}>Plan Management</Title>
        <Button leftSection={<Plus size={16} />} onClick={handleOpenAdd}>
          Add Plan
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
                <Table.Th>Monthly Price</Table.Th>
                <Table.Th>Bandwidth</Table.Th>
                <Table.Th>Connections</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {plans.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8} style={{ textAlign: 'center' }}>
                    No plans found
                  </Table.Td>
                </Table.Tr>
              ) : (
                rows
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title={editingPlan ? 'Edit Plan' : 'Add New Plan'}
        centered
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Plan Name"
            placeholder="Enter plan name"
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
            placeholder="Enter plan description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            maxLength={100}
            disabled={submitting}
          />

          <NumberInput
            label="Monthly Price ($)"
            placeholder="Enter monthly price"
            value={formData.month_price || ''}
            onChange={(value) =>
              setFormData({ ...formData, month_price: value ? Number(value) : undefined })
            }
            min={0}
            disabled={submitting}
          />

          <NumberInput
            label="Bandwidth (GB)"
            placeholder="Enter bandwidth limit"
            value={formData.bandwidth || ''}
            onChange={(value) =>
              setFormData({ ...formData, bandwidth: value ? Number(value) : undefined })
            }
            min={0}
            disabled={submitting}
          />

          <NumberInput
            label="Connections"
            placeholder="Enter connection limit"
            value={formData.connection || ''}
            onChange={(value) =>
              setFormData({ ...formData, connection: value ? Number(value) : undefined })
            }
            min={1}
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
              {editingPlan ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}

export default PlanMgr

