import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AppShell, Burger, Group, Title, Button, ActionIcon, useMantineColorScheme, useComputedColorScheme, Avatar, Popover, Stack, Anchor } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Instances from './pages/Instances'
import DomainMgr from './pages/DomainMgr'
import PlanMgr from './pages/PlanMgr'
import GroupMgr from './pages/GroupMgr'
import VPNClientMgr from './pages/VPNClientMgr'
import SubscriptionMgr from './pages/SubscriptionMgr'
import UserMgr from './pages/UserMgr'
import Register from './pages/Register'
import Login from './pages/Login'
import Logout from './pages/Logout'
import VerifyUser from './pages/VerifyUser'
import ResetPassword from './pages/ResetPassword'
import { useAuth } from './contexts/AuthContext'
import apiClient from './services/api'

interface UserData {
  user_id: number;
  user_name: string | null;
  email: string | null;
  role?: string | null;
  plan_id?: number;
}

function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      {computedColorScheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </ActionIcon>
  );
}

function AvatarPopover({ user }: { user: UserData }) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      width={400}
      position="bottom"
      withArrow
      shadow="md"
      opened={opened}
      onClose={() => setOpened(false)}
    >
      <Popover.Target>
        <Avatar
          radius="xl"
          size="md"
          color="orange"
          bg="blue"
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => setOpened(true)}
          onMouseLeave={() => setOpened(false)}
        >
          {user.user_name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
      </Popover.Target>
      <Popover.Dropdown
        onMouseEnter={() => setOpened(true)}
        onMouseLeave={() => setOpened(false)}
      >
        <Stack gap="xs">
          <Anchor
            component={Link}
            to="/dashboard"
            style={{ textDecoration: 'none' }}
          >
            Dashboard ({user.email || 'Guest'})




          </Anchor>
          <Anchor
            component={Link}
            to="/logout"
            style={{ textDecoration: 'none' }}
          >
            Logout
          </Anchor>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

function AppContent() {
  const [opened, { toggle }] = useDisclosure();
  const { isAuthenticated, user } = useAuth();

  const menuItems = [

    { label: 'Login', path: '/login' },
    { label: 'Plan', path: '/plan' },
    { label: 'Subscription', path: '/sub_mgr' },
    { label: 'Help', path: '/help' },
  ];

  // Add Register and Logout based on authentication state
  const authMenuItems = [
    ...menuItems,
    ...(isAuthenticated
      ? [{ label: 'Logout', path: '/logout' }]
      : [{ label: 'Register', path: '/register' }]
    ),
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>VPN Service</Title>
          </Group>

          <Group gap="md" visibleFrom="sm">
            {authMenuItems.map((item) => (
              <Button key={item.label} component={Link} to={item.path} variant="subtle">
                {item.label}
              </Button>
            ))}
          </Group>

          <Group>
            <ColorSchemeToggle />
            {isAuthenticated && user?.user_name && (
              <AvatarPopover user={user} />
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        {authMenuItems.map((item) => (
          <Button
            key={item.label}
            component={Link}
            to={item.path}
            variant="subtle"
            fullWidth
            justify="flex-start"
            onClick={toggle}
          >
            {item.label}
          </Button>
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instances" element={<Instances />} />
          <Route path="/domains" element={<DomainMgr />} />
          <Route path="/plan_mgr" element={<PlanMgr />} />
          <Route path="/group_mgr" element={<GroupMgr />} />
          <Route path="/client_mgr" element={<VPNClientMgr />} />
          <Route path="/sub_mgr" element={<SubscriptionMgr />} />
          <Route path="/user_mgr" element={<UserMgr />} />
          <Route path="/register/:ref_code?" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/verify_user/:token" element={<VerifyUser />} />
          <Route path="/reset_password/:token" element={<ResetPassword />} />

          {/* Add other routes as needed */}
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}

function App() {
  // Check if this is a plain text route before rendering React
  const path = window.location.pathname;
  const subMatch = path.match(/^\/sub\/([^\/]+)$/);
  const linkMatch = path.match(/^\/link\/(.+)$/);

  if (subMatch) {
    //that is to deal with direct link which return base64 encoded vless url for user to use
    // for example:  https://our.service.com/sub/MTIzNDU2Nzg5MA==  will hit here
    // clash://install-config?url=https://our.service.com/sub/MTIzNDU2Nzg5MA==  will also hit here
    // deep link for clash is handled in linkMatch
    const uuid = subMatch[1];

    // Fetch content from API and render as plain text
    useEffect(() => {
      const fetchAndRenderPlainText = async () => {
        try {
          const response = await apiClient.get(`/api/get_sub_content?uuid=${uuid}`);
          const plainText = response.data || '';

          // Replace document with plain text
          document.open('text/plain');
          document.write(plainText);
          document.close();
        } catch (error) {
          // Handle error - show error message as plain text
          document.open('text/plain');
          document.write('Error: Unable to fetch content');
          document.close();
        }
      };

      fetchAndRenderPlainText();
    }, [uuid]);

    return null;
  }

  if (linkMatch) {
    const encodedParams = decodeURIComponent(linkMatch[1]);

    // Parse the URL to extract uuid and target
    // Expected format: /link/uuid|target
    const parts = encodedParams.split('|');
    const uuid = parts[0];
    const target = parts[1] || 'base64'; // Default to base64 if not specified

    // Fetch content from API and render as plain text
    useEffect(() => {
      const fetchAndRenderPlainText = async () => {
        try {
          const response = await apiClient.get(`/api/sub_convert?uuid=${encodeURIComponent(uuid)}&target=${encodeURIComponent(target)}`);
          const plainText = response.data || '';

          // Replace document with plain text
          document.open('text/plain');
          document.write(plainText);
          document.close();
        } catch (error) {
          // Handle error - show error message as plain text
          document.open('text/plain');
          document.write('Error: Unable to fetch content');
          document.close();
        }
      };

      fetchAndRenderPlainText();
    }, [uuid, target]);

    return null;
  }

  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
