'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Center, Stack, Text, Button, Group, Alert, Paper, Title, Divider, Box } from '@mantine/core';
import { Chrome, Shield, Zap, AlertCircle, Lock, Building2, CheckCircle, Users, Database } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { hasValidConfig } from '@/lib/firebase';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      console.error('Sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Text size="lg" c="dimmed">Loading...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <Container size="sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <Building2 size={40} className="text-white" />
            </div>
            <Title order={1} size="h1" fw={700} mb="sm" className="text-gray-900">
              Welcome to ABC Portal
            </Title>
          </div>

          <Paper shadow="xl" radius="xl" p="xl" className="border border-gray-100">
            <Stack gap="lg">
              {!hasValidConfig() && (
                <Alert icon={<AlertCircle size={16} />} color="blue" variant="light" radius="lg">
                  <Text size="sm">
                    <strong>Demo Mode:</strong> Firebase is not configured. You can still explore the app with demo data.
                  </Text>
                </Alert>
              )}

              {/* Features Grid */}
              <Divider label="Sign in to continue" labelPosition="center" />

              <Button
                leftSection={<Chrome size={20} />}
                onClick={handleGoogleSignIn}
                loading={isLoading}
                size="lg"
                fullWidth
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                radius="xl"
                style={{
                  height: '56px',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {hasValidConfig() ? 'Continue with Google' : 'Continue with Demo'}
              </Button>

              {/* Security Notice */}
              <Alert color="orange" variant="light" radius="lg">
                <Group gap="sm">
                  <Lock size={16} />
                  <div>
                    <Text size="sm" fw={600}>Restricted Access</Text>
                    <Text size="xs" c="dimmed">
                      Only authorized email addresses can access this application
                    </Text>
                  </div>
                </Group>
              </Alert>

              <Divider />

              {/* Help Section */}
              <div className="text-center">
                <Text size="xs" c="dimmed" mb="sm">
                  Need help accessing your account?
                </Text>
                <Group justify="center" gap="xs">
                  <Zap size={14} className="text-blue-500" />
                  <Text size="xs" c="dimmed">
                    Contact your administrator to add your email to the allowed list
                  </Text>
                </Group>
              </div>

              {hasValidConfig() && (
                <Alert icon={<AlertCircle size={16} />} color="gray" variant="light" radius="lg">
                  <Text size="xs" c="dimmed">
                    <strong>Troubleshooting:</strong> If you're having issues signing in, make sure pop-ups are enabled
                    and your email is authorized. Contact support if problems persist.
                  </Text>
                </Alert>
              )}
            </Stack>
          </Paper>

          {/* Footer */}
        </Container>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}