import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Container,
  Paper,
  Title,
  Stack,
  Alert,
  Text,
  Loader,
  Center,
} from '@mantine/core'
import { CheckCircle, AlertCircle, MailCheck } from 'lucide-react'
import { authService } from '../services/authService'

function VerifyUser() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasVerified, setHasVerified] = useState(false)

  useEffect(() => {
    // Prevent duplicate verification requests (React StrictMode in dev)
    if (hasVerified || success) {
      return
    }

    const verifyToken = async () => {
      if (!token) {
        setError('No verification token provided')
        setLoading(false)
        return
      }

      // Mark as verifying to prevent duplicate calls
      setHasVerified(true)

      try {
        await authService.verifyUser(token)
        setSuccess(true)
        setLoading(false)
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Email verified successfully! Please login.' } 
          })
        }, 3000)
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Verification failed')
        setLoading(false)
        // Reset hasVerified on error so user can retry
        setHasVerified(false)
      }
    }

    verifyToken()
  }, [token, navigate, hasVerified, success])

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack gap="md">
          <div style={{ textAlign: 'center' }}>
            <MailCheck size={48} style={{ margin: '0 auto 16px', color: 'var(--mantine-color-blue-6)' }} />
            <Title order={2}>Email Verification</Title>
            <Text c="dimmed" size="sm" mt={5}>
              Verifying your email address
            </Text>
          </div>

          {loading && (
            <Center>
              <Stack gap="md" align="center">
                <Loader size="lg" />
                <Text c="dimmed">Please wait...</Text>
              </Stack>
            </Center>
          )}

          {success && (
            <Alert icon={<CheckCircle size={16} />} title="Success" color="green">
              Your email has been verified successfully! Redirecting to login page...
            </Alert>
          )}

          {error && (
            <Alert icon={<AlertCircle size={16} />} title="Verification Failed" color="red">
              {error}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}

export default VerifyUser

