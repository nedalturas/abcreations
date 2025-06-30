'use client';

import { useState } from 'react';
import {
  Modal,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Text,
  Tabs,
  Divider,
  Anchor,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Mail, Lock, User, Wand2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AuthModal({ opened, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string | null>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resetPassword, sendMagicLink } = useAuth();

  const signInForm = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const signUpForm = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
      displayName: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
    },
  });

  const magicLinkForm = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const resetForm = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSignIn = async (values: typeof signInForm.values) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      onClose();
      signInForm.reset();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (values: typeof signUpForm.values) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.displayName);
      onClose();
      signUpForm.reset();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (values: typeof magicLinkForm.values) => {
    setIsLoading(true);
    try {
      await sendMagicLink(values.email);
      magicLinkForm.reset();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values: typeof resetForm.values) => {
    setIsLoading(true);
    try {
      await resetPassword(values.email);
      resetForm.reset();
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
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List grow>
          <Tabs.Tab value="signin" leftSection={<Lock size={16} />}>
            Sign In
          </Tabs.Tab>
          <Tabs.Tab value="signup" leftSection={<User size={16} />}>
            Sign Up
          </Tabs.Tab>
          <Tabs.Tab value="magic" leftSection={<Wand2 size={16} />}>
            Magic Link
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="signin" pt="md">
          <form onSubmit={signInForm.onSubmit(handleSignIn)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="Enter your email"
                leftSection={<Mail size={16} />}
                required
                {...signInForm.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                leftSection={<Lock size={16} />}
                required
                {...signInForm.getInputProps('password')}
              />

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                className="btn-primary"
              >
                Sign In
              </Button>

              <Divider />

              <Group justify="center">
                <Anchor
                  size="sm"
                  onClick={() => setActiveTab('reset')}
                  style={{ cursor: 'pointer' }}
                >
                  Forgot your password?
                </Anchor>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="signup" pt="md">
          <form onSubmit={signUpForm.onSubmit(handleSignUp)}>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                leftSection={<User size={16} />}
                required
                {...signUpForm.getInputProps('displayName')}
              />

              <TextInput
                label="Email"
                placeholder="Enter your email"
                leftSection={<Mail size={16} />}
                required
                {...signUpForm.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Create a password"
                leftSection={<Lock size={16} />}
                required
                {...signUpForm.getInputProps('password')}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                leftSection={<Lock size={16} />}
                required
                {...signUpForm.getInputProps('confirmPassword')}
              />

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                className="btn-primary"
              >
                Create Account
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="magic" pt="md">
          <form onSubmit={magicLinkForm.onSubmit(handleMagicLink)}>
            <Stack gap="md">
              <Alert icon={<Wand2 size={16} />} color="blue" variant="light">
                Enter your email and we'll send you a magic link to sign in without a password!
              </Alert>

              <TextInput
                label="Email"
                placeholder="Enter your email"
                leftSection={<Mail size={16} />}
                required
                {...magicLinkForm.getInputProps('email')}
              />

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                className="btn-primary"
              >
                Send Magic Link
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="reset" pt="md">
          <form onSubmit={resetForm.onSubmit(handleResetPassword)}>
            <Stack gap="md">
              <Alert icon={<AlertCircle size={16} />} color="orange" variant="light">
                Enter your email and we'll send you instructions to reset your password.
              </Alert>

              <TextInput
                label="Email"
                placeholder="Enter your email"
                leftSection={<Mail size={16} />}
                required
                {...resetForm.getInputProps('email')}
              />

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                className="btn-primary"
              >
                Send Reset Email
              </Button>

              <Group justify="center">
                <Anchor
                  size="sm"
                  onClick={() => setActiveTab('signin')}
                  style={{ cursor: 'pointer' }}
                >
                  Back to Sign In
                </Anchor>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}