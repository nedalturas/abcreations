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
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <Container size="xl" py="lg">
          <Group>
            <svg fill="#FF385C" height="32px" width="32px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489.6 489.6">
              <path d="M466.1,115c-9.7,0-17.5,7.8-17.5,17.5v54.8h-27.2V89.8L188.3,103V78.5h12.8V22.1h-12.8V9.7c0-5.4-4.3-9.7-9.7-9.7 s-9.7,4.3-9.7,9.7v12.4h-12.8v56.3h12.7v24.5c0,0.4,0,0.8,0,1.2L5.6,113.4v85.1l17.1,0.8v82h16.7v35h13.2v39.2 c0,5.4,4.3,9.7,9.7,9.7s9.7-4.3,9.7-9.7v-39.2h13.2v-35h16.7V204l182.2,10.1v180.7H5.6v94.8h416.2V282.9H449v54.8 c0,9.7,7.8,17.5,17.5,17.5s17.5-7.8,17.5-17.5V132.5C483.6,122.8,475.8,115,466.1,115z M448.6,263.1h-27.2v-56.3h27.2V263.1z"/>
            </svg>
            <Text size="xl" fw={700} c="#FF385C">
              Alturas Bag Creations
            </Text>
          </Group>
        </Container>
      </div>

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
            <Text size="lg" c="dimmed" maw={400} mx="auto">
              Professional bag repair and manufacturing management system
            </Text>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-3">
                    <Shield size={24} className="text-white" />
                  </div>
                  <Text size="sm" fw={600} mb="xs">Secure Access</Text>
                  <Text size="xs" c="dimmed">Google authentication</Text>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mb-3">
                    <Database size={24} className="text-white" />
                  </div>
                  <Text size="sm" fw={600} mb="xs">Real-time Data</Text>
                  <Text size="xs" c="dimmed">Firebase integration</Text>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-lg mb-3">
                    <Users size={24} className="text-white" />
                  </div>
                  <Text size="sm" fw={600} mb="xs">Team Management</Text>
                  <Text size="xs" c="dimmed">Collaborative workspace</Text>
                </div>
              </div>

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

              {/* Features List */}
              <div className="space-y-3 pt-4">
                <Group gap="sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <Text size="sm" c="dimmed">Manage repair orders and job schedules</Text>
                </Group>
                <Group gap="sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <Text size="sm" c="dimmed">Track customer information and deadlines</Text>
                </Group>
                <Group gap="sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <Text size="sm" c="dimmed">Real-time dashboard and analytics</Text>
                </Group>
              </div>

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
          <div className="text-center mt-8">
            <Text size="xs" c="dimmed">
              By signing in, you agree to our terms of service and privacy policy
            </Text>
          </div>
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