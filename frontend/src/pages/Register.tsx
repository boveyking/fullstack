import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
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
import { UserPlus, AlertCircle } from 'lucide-react'
import { authService, RegisterRequest } from '../services/authService'

function Register() {
  const navigate = useNavigate()
  const { ref_code: refCodeParam } = useParams<{ ref_code?: string }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<RegisterRequest>({
    user_name: '',
    email: '',
    password: '',
    password_again: '',
    ref_code: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Populate ref_code from URL parameter
  useEffect(() => {
    if (refCodeParam) {
      setFormData((prev) => ({ ...prev, ref_code: refCodeParam }))
    }
  }, [refCodeParam])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (formData.user_name.length < 3) {
      errors.user_name = 'Username must be at least 3 characters'
    }
    
    if (!/^\S+@\S+$/.test(formData.email)) {
      errors.email = 'Invalid email'
    }
    
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.password_again) {
      errors.password_again = 'Passwords do not match'
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

      // Remove password_again before sending to API
      const { password_again, ...registerData } = formData
      
      await authService.register({
        user_name: registerData.user_name,
        email: registerData.email,
        password: registerData.password,
        ref_code: registerData.ref_code || undefined,
      })

      // Registration successful, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please login.' } })
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack gap="md">
          <div style={{ textAlign: 'center' }}>
            <UserPlus size={48} style={{ margin: '0 auto 16px', color: 'var(--mantine-color-blue-6)' }} />
            <Title order={2}>Create Account</Title>
            <Text c="dimmed" size="sm" mt={5}>
              Register for a new account
            </Text>
          </div>

          {error && (
            <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Username"
                placeholder="Enter your username"
                required
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                error={validationErrors.user_name}
              />

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

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                value={formData.password_again}
                onChange={(e) => setFormData({ ...formData, password_again: e.target.value })}
                error={validationErrors.password_again}
              />

              <TextInput
                label="Reference Code (Optional)"
                placeholder="Enter reference code if you have one"
                value={formData.ref_code}
                onChange={(e) => setFormData({ ...formData, ref_code: e.target.value })}
              />

              <Button type="submit" fullWidth loading={loading} mt="md">
                Register
              </Button>
            </Stack>
          </form>

          <Text ta="center" size="sm" mt="md">
            Already have an account?{' '}
            <Anchor component={Link} to="/login">
              Login here
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  )
}

export default Register

