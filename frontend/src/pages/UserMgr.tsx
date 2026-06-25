import { Container, Title, Paper, Table, Group, TextInput, Pagination, Modal, ActionIcon, Badge, Tooltip } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Search, UserX, Eye, Ban, Check, X, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../services/api'

interface User {
  id: number
  user_name: string
  email: string
  uuid: string | null
  role?: string
  is_active: boolean
  create_datetime: string
}

interface UserListResponse {
  users: User[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

function UserMgr() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [emailFilter, setEmailFilter] = useState('')
  const [uuidFilter, setUuidFilter] = useState('')
  const [activeEmailFilter, setActiveEmailFilter] = useState('')
  const [activeUuidFilter, setActiveUuidFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAccessDenied, setShowAccessDenied] = useState(false)

  // Check if user has god role
  const isGod = user?.role === 'god'

  useEffect(() => {
    if (!isGod) {
      setShowAccessDenied(true)
      return
    }
    fetchUsers()
  }, [page, activeEmailFilter, activeUuidFilter, isGod])

  const fetchUsers = async () => {
    if (!isGod) return
    
    setLoading(true)
    try {
      const params: any = {
        page,
        page_size: pageSize,
      }
      
      if (activeEmailFilter) {
        params.email = activeEmailFilter
      }
      
      if (activeUuidFilter) {
        params.uuid = activeUuidFilter
      }

      const response = await apiClient.get<UserListResponse>('/api/users', { params })
      setUsers(response.data.users)
      setTotalPages(response.data.total_pages)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyEmailFilter = () => {
    setActiveEmailFilter(emailFilter)
    setPage(1) // Reset to first page when applying filter
  }

  const handleClearEmailFilter = () => {
    setEmailFilter('')
    setActiveEmailFilter('')
    setPage(1)
  }

  const handleApplyUuidFilter = () => {
    setActiveUuidFilter(uuidFilter)
    setPage(1) // Reset to first page when applying filter
  }

  const handleClearUuidFilter = () => {
    setUuidFilter('')
    setActiveUuidFilter('')
    setPage(1)
  }

  const handleDetail = (userId: number) => {
    console.log('View detail for user:', userId)
    // TODO: Implement detail view
  }

  const handleRemove = (userId: number) => {
    console.log('Remove user:', userId)
    // TODO: Implement remove user
  }

  const handleDisable = (userId: number) => {
    console.log('Disable user:', userId)
    // TODO: Implement disable user
  }

  const handleCleanup = async (userId: number) => {
    if (!confirm('Are you sure you want to cleanup this user from all inbounds? This action cannot be undone.')) {
      return
    }
    
    try {
      setLoading(true)
      await apiClient.post(`/api/clean_user_from_inbound`, { target_user_id: userId })
      alert('User cleaned up successfully from all inbounds')
      fetchUsers() // Refresh the list
    } catch (error: any) {
      console.error('Failed to cleanup user:', error)
      alert(`Failed to cleanup user: ${error.response?.data?.detail || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Show access denied modal if not god
  if (!isGod) {
    return (
      <Modal
        opened={showAccessDenied}
        onClose={() => setShowAccessDenied(false)}
        title="Access Denied"
        centered
      >
        <Paper p="md">
          <Title order={4} c="red" mb="md">Restricted Resource</Title>
          <p>Access denied. You do not have permission to view this page.</p>
        </Paper>
      </Modal>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="md">
        User Management
      </Title>

      <Paper shadow="sm" p="md" mb="md">
        <Group mb="md">
          <TextInput
            placeholder="Filter by email"
            leftSection={<Search size={16} />}
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.currentTarget.value)}
            style={{ flex: 1 }}
            rightSection={
              emailFilter ? (
                activeEmailFilter === emailFilter ? (
                  <Tooltip label="Clear filter" withArrow position="left">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={handleClearEmailFilter}
                    >
                      <X size={16} />
                    </ActionIcon>
                  </Tooltip>
                ) : (
                  <Tooltip label="Apply filter" withArrow position="left">
                    <ActionIcon
                      variant="subtle"
                      color="green"
                      onClick={handleApplyEmailFilter}
                    >
                      <Check size={16} />
                    </ActionIcon>
                  </Tooltip>
                )
              ) : null
            }
          />
          <TextInput
            placeholder="Filter by UUID"
            leftSection={<Search size={16} />}
            value={uuidFilter}
            onChange={(e) => setUuidFilter(e.currentTarget.value)}
            style={{ flex: 1 }}
            rightSection={
              uuidFilter ? (
                activeUuidFilter === uuidFilter ? (
                  <Tooltip label="Clear filter" withArrow position="left">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={handleClearUuidFilter}
                    >
                      <X size={16} />
                    </ActionIcon>
                  </Tooltip>
                ) : (
                  <Tooltip label="Apply filter" withArrow position="left">
                    <ActionIcon
                      variant="subtle"
                      color="green"
                      onClick={handleApplyUuidFilter}
                    >
                      <Check size={16} />
                    </ActionIcon>
                  </Tooltip>
                )
              ) : null
            }
          />
        </Group>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Username</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>UUID</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={8} style={{ textAlign: 'center' }}>
                  {loading ? 'Loading...' : 'No users found'}
                </Table.Td>
              </Table.Tr>
            ) : (
              users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>{user.id}</Table.Td>
                  <Table.Td>{user.user_name}</Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                    {user.uuid ? `${user.uuid.substring(0, 8)}...` : 'N/A'}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={user.role === 'god' ? 'red' : 'blue'}>
                      {user.role || 'user'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={user.is_active ? 'green' : 'gray'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {new Date(user.create_datetime).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="View Details" withArrow>
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleDetail(user.id)}
                        >
                          <Eye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Disable User" withArrow>
                        <ActionIcon
                          variant="light"
                          color="orange"
                          onClick={() => handleDisable(user.id)}
                        >
                          <Ban size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Remove User" withArrow>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleRemove(user.id)}
                        >
                          <UserX size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Cleanup from all inbounds" withArrow>
                        <ActionIcon
                          variant="light"
                          color="grape"
                          onClick={() => handleCleanup(user.id)}
                        >
                          <Trash2 size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>

        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
            />
          </Group>
        )}
      </Paper>
    </Container>
  )
}

export default UserMgr

