'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/auth') {
      router.push('/auth');
    }
  }, [user, loading, router, pathname]);

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

  if (!user && pathname !== '/auth') {
    return (
      <div className="page-container">
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Redirecting to sign in...</Text>
          </Stack>
        </Center>
      </div>
    );
  }

  return <>{children}</>;
}