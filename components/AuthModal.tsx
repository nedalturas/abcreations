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
  Code,
} from '@mantine/core';
import { Chrome, Shield, Zap, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { hasValidConfig } from '@/lib/firebase';

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
      console.error('Sign-in error:', error);
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
          <Text fw={600} size="lg">Welcome to Alturas Bag Creations Portal</Text>
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

        {!hasValidConfig() && (
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              <strong>Demo Mode:</strong> Firebase is not configured. You can still explore the app with demo data.
            </Text>
          </Alert>
        )}

        <Alert color="orange" variant="light">
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
          {hasValidConfig() ? 'Continue with Google' : 'Continue with Demo'}
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

        {hasValidConfig() && (
          <Alert icon={<AlertCircle size={16} />} color="orange" variant="light">
            <Text size="sm">
              <strong>Access Denied?</strong>
              <br />
              • Make sure you're using an authorized email address
              <br />
              • Contact your administrator to add your email to the allowed list
              <br />
              • Check that pop-ups are enabled for Google Sign-In
            </Text>
          </Alert>
        )}

        <Alert icon={<AlertCircle size={16} />} color="gray" variant="light">
          <Text size="xs" c="dimmed">
            <strong>For Administrators:</strong> To add or remove authorized emails, 
            edit the <Code>ALLOWED_EMAILS</Code> array in <Code>lib/allowedEmails.ts</Code>
          </Text>
        </Alert>
      </Stack>
    </Modal>
  );
}