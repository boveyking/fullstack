import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Text, Loader, Center } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Perform logout
    logout();
    
    // Remove user_data from localStorage (logout already does this, but ensuring it's removed)
    localStorage.removeItem('user_data');
    
    // Redirect to home page after a short delay
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <Box pt="lg" pb="lg">
        <Center style={{ minHeight: '50vh', flexDirection: 'column' }}>
          <Loader size="lg" />
          <Text mt="md" size="lg" fw={500}>
            Logging out...
          </Text>
          <Text mt="xs" size="sm" color="dimmed">
            You will be redirected to the home page shortly.
          </Text>
        </Center>
      </Box>
    </Container>
  );
}

