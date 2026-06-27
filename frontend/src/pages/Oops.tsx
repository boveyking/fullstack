import { useEffect } from 'react';
import { Container, Title, Text, Stack, Paper } from '@mantine/core';
import { Link } from 'react-router-dom';

export default function Oops() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container size="lg" py="xl" style={{ minHeight: '80vh' }}>
      Opps
    </Container>
  );
}

