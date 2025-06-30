'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Center, Stack, Text, Loader, Alert } from '@mantine/core';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function CompleteAuthPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { completeMagicLinkSignIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        const email = localStorage.getItem('emailForSignIn');
        if (!email) {
          setStatus('error');
          return;
        }

        await completeMagicLinkSignIn(email);
        setStatus('success');
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Magic link completion failed:', error);
        setStatus('error');
        
        // Redirect to auth page after error
        setTimeout(() => {
          router.push('/auth');
        }, 3000);
      }
    };

    completeSignIn();
  }, [completeMagicLinkSignIn, router]);

  return (
    <div className="page-container">
      <Container size="sm">
        <Center h="100vh">
          <Stack align="center" gap="xl">
            {status === 'loading' && (
              <>
                <Loader size="lg" />
                <Text>Completing sign in...</Text>
              </>
            )}

            {status === 'success' && (
              <>
                <Alert icon={<CheckCircle size={16} />} color="green" variant="light">
                  <Text fw={600}>Sign in successful!</Text>
                  <Text size="sm">Redirecting you to the dashboard...</Text>
                </Alert>
              </>
            )}

            {status === 'error' && (
              <>
                <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
                  <Text fw={600}>Sign in failed</Text>
                  <Text size="sm">The link may be invalid or expired. Redirecting to sign in page...</Text>
                </Alert>
              </>
            )}
          </Stack>
        </Center>
      </Container>
    </div>
  );
}