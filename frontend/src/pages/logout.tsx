import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Paper, Title, Text, Loader, Stack } from '@mantine/core'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Logout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    // Call logout from AuthContext
    logout()

    // Optionally call backend logout endpoint
    // authService.logout().catch(console.error)

    // Redirect to login page after a short delay
    const timer = setTimeout(() => {
      navigate('/login', { replace: true })
    }, 1000)

    return () => clearTimeout(timer)
  }, [logout, navigate])

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack gap="md" align="center">
          <LogOut size={48} style={{ color: 'var(--mantine-color-blue-6)' }} />
          <Title order={2}>Logging out...</Title>
          <Text c="dimmed" size="sm">
            You will be redirected to the login page shortly.
          </Text>
          <Loader size="md" />
        </Stack>
      </Paper>
    </Container>
  )
}

export default Logout

