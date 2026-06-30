import { useEffect } from 'react';
import { Container, Title, Text, Button, Stack, Paper } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function Oops() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container size="md" py="xl" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper
        p="xl"
        radius="md"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Stack align="center" gap="lg">
          <FileQuestion size={80} strokeWidth={1} style={{ opacity: 0.5 }} />

          <Title
            order={1}
            style={{
              fontSize: '6rem',
              fontWeight: 700,
              lineHeight: 1,
              opacity: 0.15,
              letterSpacing: '-0.05em',
            }}
          >
            404
          </Title>

          <Title order={2}>Page Not Found</Title>

          <Text c="dimmed" maw={420}>
            The page you are looking for does not exist, has been moved, or is temporarily unavailable.
          </Text>

          <Button
            variant="light"
            size="md"
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}