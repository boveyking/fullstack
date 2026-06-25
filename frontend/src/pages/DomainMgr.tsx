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
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Trash2, Plus, Edit } from 'lucide-react'
import { domainService } from '../services/domainService'
import { Domain, CreateDomainRequest } from '../types'

function DomainMgr() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [opened, { open, close }] = useDisclosure(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<CreateDomainRequest>({
    root_domain: '',
    is_active: true,
  })

  const loadDomains = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await domainService.getDomains()
      setDomains(data)
    } catch (err) {
      setError('Failed to load domains')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDomains()
  }, [])

  const handleOpenAdd = () => {
    setEditingDomain(null)
    setFormData({
      root_domain: '',
      is_active: true,
    })
    open()
  }

  const handleOpenEdit = (domain: Domain) => {
    setEditingDomain(domain)
    setFormData({
      root_domain: domain.root_domain,
      is_active: domain.is_active,
    })
    open()
  }

  const handleSubmit = async () => {
    if (!formData.root_domain.trim()) {
      setError('Root domain is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      if (editingDomain) {
        await domainService.updateDomain(editingDomain.id, formData)
      } else {
        await domainService.createDomain(formData)
      }
      
      close()
      loadDomains()
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${editingDomain ? 'update' : 'create'} domain`)
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this domain?')) return

    try {
      await domainService.deleteDomain(id)
      loadDomains()
    } catch (err) {
      setError('Failed to delete domain')
      console.error(err)
    }
  }

  const rows = domains.map((domain) => (
    <Table.Tr key={domain.id}>
      <Table.Td>{domain.id}</Table.Td>
      <Table.Td>{domain.root_domain}</Table.Td>
      <Table.Td>
        <Badge color={domain.is_active ? 'green' : 'gray'}>
          {domain.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleOpenEdit(domain)}
          >
            <Edit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDelete(domain.id)}
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
        <Title order={2}>Domain Management</Title>
        <Button leftSection={<Plus size={16} />} onClick={handleOpenAdd}>
          Add Domain
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
                <Table.Th>Root Domain</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {domains.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4} style={{ textAlign: 'center' }}>
                    No domains found
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
        title={editingDomain ? 'Edit Domain' : 'Add New Domain'}
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Root Domain"
            placeholder="example.com"
            value={formData.root_domain}
            onChange={(e) =>
              setFormData({ ...formData, root_domain: e.target.value })
            }
            required
            maxLength={50}
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
              {editingDomain ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}

export default DomainMgr

