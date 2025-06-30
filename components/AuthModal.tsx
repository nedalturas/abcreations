'use client';

import { useState } from 'react';
import {
  Modal,
  Button,
  Stack,
  Group,
  Text,
  Alert,
  Divider,
  Center,
} from '@mantine/core';
import { Chrome, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AuthModal({ opened, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text fw={600} size="lg">Welcome to BagCraft Pro</Text>
        </Group>
      }
      size="md"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="lg">
        <div style={{ textAlign: 'center' }}>
          <Text size="sm" c="dimmed" mb="md">
            Sign in to access your bag repair and manufacturing management system
          </Text>
        </div>

        <Alert color="blue" variant="light">
          <Group gap="sm">
            <Shield size={16} />
            <div>
              <Text size="sm" fw={600}>Secure Authentication</Text>
              <Text size="xs" c="dimmed">
                We use Google's secure authentication system to protect your account
              </Text>
            </div>
          </Group>
        </Alert>

        <Button
          leftSection={<Chrome size={20} />}
          onClick={handleGoogleSignIn}
          loading={isLoading}
          size="lg"
          fullWidth
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
          style={{
            height: '50px',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          Continue with Google
        </Button>

        <Divider />

        <Stack gap="xs">
          <Group gap="xs" justify="center">
            <Zap size={14} />
            <Text size="xs" c="dimmed">
              Quick and secure access
            </Text>
          </Group>
          <Text size="xs" c="dimmed" ta="center">
            By signing in, you agree to our terms of service and privacy policy
          </Text>
        </Stack>
      </Stack>
    </Modal>
  );
}