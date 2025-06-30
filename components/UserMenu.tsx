'use client';

import { useState } from 'react';
import {
  Menu,
  Avatar,
  Text,
  Group,
  ActionIcon,
  Modal,
  TextInput,
  Button,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { User, Settings, LogOut, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function UserMenu() {
  const { user, signOutUser, updateUserProfile } = useAuth();
  const [profileOpened, { open: openProfile, close: closeProfile }] = useDisclosure(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const profileForm = useForm({
    initialValues: {
      displayName: user?.displayName || '',
    },
    validate: {
      displayName: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
    },
  });

  const handleUpdateProfile = async (values: typeof profileForm.values) => {
    setIsUpdating(true);
    try {
      await updateUserProfile(values.displayName);
      closeProfile();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (!user) return null;

  const displayName = user.displayName || 'User';
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Menu shadow="lg" width={220} radius="lg">
        <Menu.Target>
          <ActionIcon variant="light" size="lg" radius="xl">
            {user.photoURL ? (
              <Avatar src={user.photoURL} size="sm" radius="xl" />
            ) : (
              <Avatar size="sm" radius="xl" color="blue">
                {initials}
              </Avatar>
            )}
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>
            <Group gap="xs">
              {user.photoURL ? (
                <Avatar src={user.photoURL} size="xs" radius="xl" />
              ) : (
                <Avatar size="xs" radius="xl" color="blue">
                  {initials}
                </Avatar>
              )}
              <div>
                <Text size="sm" fw={600}>
                  {displayName}
                </Text>
                <Text size="xs" c="dimmed">
                  {user.email}
                </Text>
              </div>
            </Group>
          </Menu.Label>

          <Menu.Divider />

          <Menu.Item
            leftSection={<Edit size={16} />}
            onClick={openProfile}
          >
            Edit Profile
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            leftSection={<LogOut size={16} />}
            color="red"
            onClick={handleSignOut}
          >
            Sign Out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        opened={profileOpened}
        onClose={closeProfile}
        title={
          <Group gap="sm">
            <Settings size={20} />
            <Text fw={600}>Edit Profile</Text>
          </Group>
        }
        centered
      >
        <form onSubmit={profileForm.onSubmit(handleUpdateProfile)}>
          <Stack gap="md">
            <Group gap="md">
              {user.photoURL ? (
                <Avatar src={user.photoURL} size="lg" radius="xl" />
              ) : (
                <Avatar size="lg" radius="xl" color="blue">
                  {initials}
                </Avatar>
              )}
              <div>
                <Text size="sm" fw={600}>
                  {user.email}
                </Text>
                <Text size="xs" c="dimmed">
                  Signed in with Google
                </Text>
              </div>
            </Group>

            <TextInput
              label="Display Name"
              placeholder="Enter your name"
              leftSection={<User size={16} />}
              required
              {...profileForm.getInputProps('displayName')}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={closeProfile}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isUpdating}
                className="btn-primary"
              >
                Update Profile
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}