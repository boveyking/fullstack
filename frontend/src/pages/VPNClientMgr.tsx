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
import { clientService } from '../services/clientService'
import { Client, CreateClientRequest } from '../types'

function VPNClientMgr() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [opened, { open, close }] = useDisclosure(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<CreateClientRequest>({
    name: '',
    OS: '',
    download_url: '',
    sub_template: '',
    is_active: true,
  })

  const loadClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await clientService.getClients()
      setClients(data)
    } catch (err) {
      setError('Failed to load clients')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleOpenAdd = () => {
    setEditingClient(null)
    setFormData({
      name: '',
      OS: '',
      download_url: '',
      sub_template: '',
      is_active: true,
    })
    open()
  }

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      OS: client.OS,
      download_url: client.download_url || '',
      sub_template: client.sub_template || '',
      is_active: client.is_active,
    })
    open()
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Client name is required')
      return
    }

    if (!formData.OS.trim()) {
      setError('Operating system is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      if (editingClient) {
        await clientService.updateClient(editingClient.id, formData)
      } else {
        await clientService.createClient(formData)
      }
      
      close()
      loadClients()
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${editingClient ? 'update' : 'create'} client`)
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client? This will set it to inactive.')) return

    try {
      await clientService.deleteClient(id)
      loadClients()
    } catch (err) {
      setError('Failed to delete client')
      console.error(err)
    }
  }

  const rows = clients.map((client) => (
    <Table.Tr key={client.id}>
      <Table.Td>{client.id}</Table.Td>
      <Table.Td>{client.name}</Table.Td>
      <Table.Td>{client.OS}</Table.Td>
      <Table.Td>
        {client.download_url ? (
          <a href={client.download_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
            {client.download_url.length > 50 ? `${client.download_url.substring(0, 50)}...` : client.download_url}
          </a>
        ) : (
          '-'
        )}
      </Table.Td>
      <Table.Td>
        {client.sub_template ? (
          <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {client.sub_template.length > 30 ? `${client.sub_template.substring(0, 30)}...` : client.sub_template}
          </span>
        ) : (
          '-'
        )}
      </Table.Td>
      <Table.Td>
        <Badge color={client.is_active ? 'green' : 'gray'}>
          {client.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleOpenEdit(client)}
          >
            <Edit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDelete(client.id)}
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
        <Title order={2}>VPN Client Management</Title>
        <Button leftSection={<Plus size={16} />} onClick={handleOpenAdd}>
          Add Client
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
                <Table.Th>OS</Table.Th>
                <Table.Th>Download URL</Table.Th>
                <Table.Th>Sub Template</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {clients.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                    No clients found
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
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        centered
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Client Name"
            placeholder="Enter client name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            disabled={submitting}
          />

          <TextInput
            label="Operating System"
            placeholder="e.g., Windows, macOS, Linux, iOS, Android"
            value={formData.OS}
            onChange={(e) =>
              setFormData({ ...formData, OS: e.target.value })
            }
            required
            disabled={submitting}
          />

          <TextInput
            label="Download URL"
            placeholder="Enter download URL (optional)"
            value={formData.download_url}
            onChange={(e) =>
              setFormData({ ...formData, download_url: e.target.value })
            }
            disabled={submitting}
          />

          <TextInput
            label="Sub Template"
            placeholder="Enter subscription template (optional)"
            value={formData.sub_template}
            onChange={(e) =>
              setFormData({ ...formData, sub_template: e.target.value })
            }
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
              {editingClient ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}

export default VPNClientMgr

