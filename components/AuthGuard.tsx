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
    if (!loading && !user && pathname !== '/login' && pathname !== '/auth') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Stack align="center" gap="md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <Text size="lg" c="dimmed">Loading...</Text>
        </Stack>
      </div>
    );
  }

  if (!user && pathname !== '/login' && pathname !== '/auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Stack align="center" gap="md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <Text size="lg" c="dimmed">Redirecting to sign in...</Text>
        </Stack>
      </div>
    );
  }

  return <>{children}</>;
}