import { useEffect } from 'react';
import { Container } from '@mantine/core';

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

