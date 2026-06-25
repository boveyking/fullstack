import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
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
  Anchor,
} from '@mantine/core'
import { LogIn, AlertCircle, CheckCircle } from 'lucide-react'
import { authService, LoginRequest } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
    }
  }, [location.state])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!/^\S+@\S+$/.test(formData.email)) {
      errors.email = 'Invalid email'
    }
    
    if (formData.password.length < 1) {
      errors.password = 'Password is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      const response = await authService.login(formData)

      // Use AuthContext to save user data
      login({
        user_id: response.user_id,
        user_name: response.user_name,
        email: response.email,
        role: response.role,
        plan_id: response.plan_id,
      })

      // Redirect to dashboard/home
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Validate email
    if (!formData.email || !/^\S+@\S+$/.test(formData.email)) {
      setError('Input valid email')
      setSuccessMessage(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      const response = await authService.requestPasswordReset({ email: formData.email })
      setSuccessMessage(response.message)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to request password reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack gap="md">
          <div style={{ textAlign: 'center' }}>
            <LogIn size={48} style={{ margin: '0 auto 16px', color: 'var(--mantine-color-blue-6)' }} />
            <Title order={2}>Login</Title>
            <Text c="dimmed" size="sm" mt={5}>
              Enter your credentials to access your account
            </Text>
          </div>

          {successMessage && (
            <Alert icon={<CheckCircle size={16} />} title="Success" color="green">
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="Enter your email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={validationErrors.email}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={validationErrors.password}
              />

              <Button type="submit" fullWidth loading={loading} mt="md">
                Login
              </Button>
            </Stack>
          </form>

          <Text ta="center" size="sm" mt="md">
            Don't have an account?{' '}
            <Anchor component={Link} to="/register">
              Register here
            </Anchor>
          </Text>
          
          <Text ta="center" size="sm" mt="xs">
            <Anchor href="#" onClick={handleResetPassword}>
              Reset Password
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  )
}

export default Login

