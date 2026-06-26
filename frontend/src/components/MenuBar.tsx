import './MenuBar.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Tooltip, Popover, Button,Text, Stack } from '@mantine/core';
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

  return (
    <header className="menu-bar">
      <div className="logo" onClick={handleLogoClick}>fullstack</div>
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
                  <Text size="xl" pr="md" >🪪</Text><Text size="lg" pt="xs" >Profile</Text>
                </Button>
                <Button
                  variant="subtle"
                  fullWidth
                  justify="flex-start"
                  onClick={handleLogoutClick}
                  style={{ textAlign: 'left' }}
                >
                  
                  <Text size="xl" pr="md" >⬅️</Text><Text size="lg" pt="2px" >Logout</Text>
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
              style={{ cursor: 'pointer', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              🗝️
            </Avatar>
          </Tooltip>
        )}
        <div className="menu-trigger" onClick={onMenuClick}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}

