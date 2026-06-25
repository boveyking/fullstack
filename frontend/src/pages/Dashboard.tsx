import { Container, Title, Paper, Text, Grid, Card, Button } from '@mantine/core'
import { Link } from 'react-router-dom'
import { Server, Globe, Users, Package, FolderTree, Monitor } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Dashboard() {
  const { user } = useAuth();
  const isGod = user?.role === 'god';
  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="md">
        My Dashboard
      </Title>
    
 

 


        
    
      <Grid>
              {isGod && (
                <>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Server size={48} />
            </Card.Section>
            <Title order={4} ta="center" mt="md" mb="xs">
              Manage Instances
            </Title>
            <Text size="sm" c="dimmed" ta="center" mb="md">
              Configure and monitor AWS instances
            </Text>
            <Button component={Link} to="/instances" fullWidth >
              Go to Instances
            </Button>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Globe size={48} />
            </Card.Section>
            <Title order={4} ta="center" mt="md" mb="xs">
              Manage Domains
            </Title>
            <Text size="sm" c="dimmed" ta="center" mb="md">
              Configure domain settings and DNS
            </Text>
            <Button component={Link} to="/domains" fullWidth >
              Go to Domains
            </Button>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Users size={48} />
            </Card.Section>
            <Title order={4} ta="center" mt="md" mb="xs">
              Manage Users
            </Title>
            <Text size="sm" c="dimmed" ta="center" mb="md">
              Manage user accounts and permissions
            </Text>
            <Button component={Link} to="/user_mgr" fullWidth >
              Go to Users
            </Button>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Package size={48} />
            </Card.Section>
            <Title order={4} ta="center" mt="md" mb="xs">
              Manage Plans
            </Title>
            <Text size="sm" c="dimmed" ta="center" mb="md">
              Configure subscription plans and pricing
            </Text>
            <Button component={Link} to="/plan_mgr" fullWidth >
              Go to Plans
            </Button>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <FolderTree size={48} />
            </Card.Section>
            <Title order={4} ta="center" mt="md" mb="xs">
              Manage Groups
            </Title>
            <Text size="sm" c="dimmed" ta="center" mb="md">
              Configure groups and assign nodes
            </Text>
            <Button component={Link} to="/group_mgr" fullWidth >
              Go to Groups
            </Button>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Monitor size={48} />
            </Card.Section>
            <Title order={4} ta="center" mt="md" mb="xs">
              Manage Clients
            </Title>
            <Text size="sm" c="dimmed" ta="center" mb="md">
              Configure VPN client applications
            </Text>
            <Button component={Link} to="/client_mgr" fullWidth >
              Go to Clients
            </Button>
          </Card>
        </Grid.Col>
        </>
      )}
  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Monitor size={48} />
            </Card.Section>
            <Title order={4} ta="center" mt="md" mb="xs">
              Manage Account
            </Title>
            <Text size="sm" c="dimmed" ta="center" mb="md">
              Configure your account settings
            </Text>
            <Button component={Link} to="/client_mgr" fullWidth >
              Go to Account
            </Button>
          </Card>
        </Grid.Col>
      </Grid>

    </Container>
  )
}

export default Dashboard
