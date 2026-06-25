import { Container, Title, Text, Card, Button, Group, Stack, Loader, Alert, Badge } from '@mantine/core'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { planService } from '../services/planService'
import { Plan } from '../types'

function SubscriptionMgr() {
  const { user, updateUser } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!user) {
          setError('Please login to view subscription')
          setLoading(false)
          return
        }

        // Always fetch all active plans
        const fetchedPlans = await planService.getPlanById(-1)
        setPlans(fetchedPlans)
      } catch (err) {
        console.error('Error fetching plans:', err)
        setError('Failed to load subscription information')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [user])

  const subscribeToPlan = async (planId: number) => {
    if (!user) {
      setError('Please login to subscribe to a plan')
      return
    }

    try {
      setSubscribing(true)
      setError(null)
      setSuccess(null)

      const result = await planService.subscribeToPlan({
        plan_id: planId,
        expiry_days: 30, // Default to 30 days
      })

      setSuccess(result.message || `Successfully subscribed to plan! Added to ${result.nodes_count} node(s).`)

      // Update user context with new plan_id
      updateUser({ ...user, plan_id: result.plan_id })

      // Refresh all plans to show the updated subscription
      const fetchedPlans = await planService.getPlanById(-1)
      setPlans(fetchedPlans)
    } catch (err: any) {
      console.error('Error subscribing to plan:', err)
      const errorMessage = err.response?.data?.detail || 'Failed to subscribe to plan'
      setError(errorMessage)
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" mt="xl">
          <Loader size="lg" />
        </Group>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title="Error">
          {error}
        </Alert>
      </Container>
    )
  }

  const userPlanId = user?.plan_id ?? -1

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="md">
        Subscription Management
      </Title>

      {success && (
        <Alert color="green" title="Success" mb="md" onClose={() => setSuccess(null)} withCloseButton>
          {success}
        </Alert>
      )}

      {error && !loading && (
        <Alert color="red" title="Error" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      {/* Show all plans in card style in one row */}
      <Group gap="md" align="stretch" wrap="nowrap">
        {plans.map((plan) => {
          const isCurrentPlan = userPlanId > -1 && plan.id === userPlanId
          
          return (
            <Card
              key={plan.id}
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
              style={{ flex: 1, minWidth: 250 }}
            >
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text size="lg" fw={700}>
                      {plan.name}
                    </Text>
                    {plan.description && (
                      <Text size="sm" c="dimmed">
                        {plan.description}
                      </Text>
                    )}
                  </Stack>
                  <Group gap="xs">
                    {isCurrentPlan ? (
                      <>
                        <Badge color="green">current</Badge>
                         
                      </>
                    ) : (
                      <Badge color="gray">Switch</Badge>
                    )}
                  </Group>
                </Group>
                
                {plan.month_price !== null && plan.month_price !== undefined && (
                  <Text size="md" fw={600}>
                    ${plan.month_price} / month
                  </Text>
                )}
                
                <Stack gap={4}>
                  {plan.bandwidth && (
                    <Text size="sm">
                      Bandwidth: {plan.bandwidth} GB
                    </Text>
                  )}
                  {plan.connection && (
                    <Text size="sm">
                      Connections: {plan.connection}
                    </Text>
                  )}
                </Stack>
                
                {isCurrentPlan ? (
                  <Button
                    variant="filled"
                    color="blue"
                    fullWidth
                    loading={subscribing}
                    onClick={() => subscribeToPlan(plan.id)}
                  >
                    Refill
                  </Button>
                ) : (
                  <Button
                    variant="filled"
                    color="blue"
                    fullWidth
                    loading={subscribing}
                    onClick={() => subscribeToPlan(plan.id)}
                  >
                    Subscribe
                  </Button>
                )}
              </Stack>
            </Card>
          )
        })}
      </Group>
    </Container>
  )
}

export default SubscriptionMgr

