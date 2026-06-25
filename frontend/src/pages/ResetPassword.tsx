import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Text,
} from '@mantine/core'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { authService } from '../services/authService'

function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    passwordAgain: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }
    
    if (formData.password !== formData.passwordAgain) {
      errors.passwordAgain = 'Passwords do not match'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setError('No reset token provided')
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      await authService.resetPassword({
        token: token,
        password: formData.password,
      })

      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successfully! Please login with your new password.' }
        })
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack gap="md">
          <div style={{ textAlign: 'center' }}>
            <Lock size={48} style={{ margin: '0 auto 16px', color: 'var(--mantine-color-blue-6)' }} />
            <Title order={2}>Reset Password</Title>
            <Text c="dimmed" size="sm" mt={5}>
              Enter your new password
            </Text>
          </div>

          {success && (
            <Alert icon={<CheckCircle size={16} />} title="Success" color="green">
              Password reset successfully! Redirecting to login page...
            </Alert>
          )}

          {error && (
            <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
              {error}
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <PasswordInput
                  label="New Password"
                  placeholder="Enter your new password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={validationErrors.password}
                />

                <PasswordInput
                  label="Password Again"
                  placeholder="Confirm your new password"
                  required
                  value={formData.passwordAgain}
                  onChange={(e) => setFormData({ ...formData, passwordAgain: e.target.value })}
                  error={validationErrors.passwordAgain}
                />

                <Button type="submit" fullWidth loading={loading} mt="md">
                  Reset Password
                </Button>
              </Stack>
            </form>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}

export default ResetPassword

