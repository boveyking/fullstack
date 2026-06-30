import './MenuBar.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Tooltip, Popover, Button, Text, Stack, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { Sun, Moon, Github } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MenuBarProps {
  onMenuClick: () => void;
}

export function MenuBar({ onMenuClick }: MenuBarProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [popoverOpened, setPopoverOpened] = useState(false);

  const handleLogoClick = () => {
    navigate('/home');
  };

  const handleProfileClick = () => {
    setPopoverOpened(false);
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    setPopoverOpened(false);
    navigate('/logout');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Articles', path: '#' },
    { label: 'Gatherings', path: '#' },
    { label: 'Members', path: '/dashboard' },
  ];

  const handleNavClick = (path: string) => {
    if (path !== '#') {
      navigate(path);
    }
  };

  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('dark');

  return (
    <header className="menu-bar">
      <div className="logo" onClick={handleLogoClick}>fullstack</div>

      {/* Horizontal nav links - visible on desktop, hidden on mobile */}
      <nav className="nav-horizontal">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.path}
            className="nav-horizontal-link"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(item.path);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isAuthenticated && user?.logo && (
          <Popover 
            width={200} 
            shadow="md" 
            position="bottom" 
            withArrow
            opened={popoverOpened}
            onChange={setPopoverOpened}
          >
            <Popover.Target>
              <Avatar 
                src={user.logo} 
                alt="User logo" 
                size="md" 
                style={{ cursor: 'pointer' }}
                imageProps={{
                  style: {
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                  }
                }}
                onMouseEnter={() => setPopoverOpened(true)}
                onMouseLeave={() => setPopoverOpened(false)}
              />
            </Popover.Target>
            <Popover.Dropdown
              onMouseEnter={() => setPopoverOpened(true)}
              onMouseLeave={() => setPopoverOpened(false)}
            >
              <Stack gap="xs">
                <Button
                  variant="subtle"
                  fullWidth
                  justify="flex-start"
                  onClick={handleProfileClick}
                  style={{ textAlign: 'left' }}
                >
                  <Text size="xl" pr="md">🪪</Text><Text size="lg" pt="xs">Profile</Text>
                </Button>
                <Button
                  variant="subtle"
                  fullWidth
                  justify="flex-start"
                  onClick={handleLogoutClick}
                  style={{ textAlign: 'left' }}
                >
                  <Text size="xl" pr="md">⬅️</Text><Text size="lg" pt="2px">Logout</Text>
                </Button>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
        {!isAuthenticated && (
          <Tooltip label="Please login" withArrow>
            <Avatar 
              onClick={handleLoginClick}
              size="md" 
              style={{ cursor: 'pointer', backgroundColor: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              🗝️
            </Avatar>
          </Tooltip>
        )}
        <Tooltip label="View on GitHub" withArrow>
          <a
            href="https://github.com/boveyking/fullstack"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-color)', display: 'flex', alignItems: 'center' }}
          >
            <ActionIcon
              variant="subtle"
              size="lg"
              style={{ color: 'var(--text-color)' }}
              aria-label="GitHub"
            >
              <Github size={20} />
            </ActionIcon>
          </a>
        </Tooltip>
        <Tooltip label={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} mode`} withArrow>
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
            style={{ color: 'var(--text-color)' }}
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </ActionIcon>
        </Tooltip>
        {/* Hamburger menu trigger - hidden on desktop, visible on mobile */}
        <div className="menu-trigger" onClick={onMenuClick}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}