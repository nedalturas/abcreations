'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Center, Stack, Text, Loader } from '@mantine/core';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const [modalOpened, setModalOpened] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleModalClose = () => {
    if (!user) {
      setModalOpened(true); // Keep modal open if not authenticated
    } else {
      setModalOpened(false);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading...</Text>
          </Stack>
        </Center>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Container size="sm">
        <Center h="100vh">
          <Stack align="center" gap="xl">
            <div style={{ textAlign: 'center' }}>
              <Text size="xl" fw={700} mb="sm">
                BagCraft Pro
              </Text>
              <Text c="dimmed">
                Professional bag repair and manufacturing management
              </Text>
            </div>
          </Stack>
        </Center>
      </Container>

      <AuthModal opened={modalOpened} onClose={handleModalClose} />
    </div>
  );
}