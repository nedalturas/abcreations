'use client';

import { useState } from 'react';
import {
  Button,
  Group,
  Text,
  ActionIcon,
  Menu,
  Badge,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Database, 
  RefreshCw, 
  Settings, 
  Trash2, 
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Download
} from 'lucide-react';
import { FirebaseSetup } from './FirebaseSetup';
import { notifications } from '@mantine/notifications';

interface FirebaseSyncProps {
  onDataSync?: () => void;
}

export function FirebaseSync({ onDataSync }: FirebaseSyncProps) {
  const [setupOpened, { open: openSetup, close: closeSetup }] = useDisclosure(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load config from localStorage
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('firebaseConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error parsing Firebase config:', error);
      }
    }
  }, []);

  const isConfigured = !!config;

  const handleSync = async () => {
    if (!isConfigured) {
      openSetup();
      return;
    }

    setIsSyncing(true);
    try {
      // Trigger data refresh
      onDataSync?.();
      setLastSync(new Date());
      
      notifications.show({
        title: 'Sync Complete!',
        message: 'Data synchronized with Firebase',
        color: 'green',
      });
    } catch (error) {
      console.error('Sync failed:', error);
      notifications.show({
        title: 'Sync Failed',
        message: 'Failed to sync with Firebase',
        color: 'red',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveConfig = (newConfig: any) => {
    setConfig(newConfig);
    localStorage.setItem('firebaseConfig', JSON.stringify(newConfig));
    notifications.show({
      title: 'Configuration Saved',
      message: 'Firebase integration configured successfully',
      color: 'green',
    });
  };

  const handleClearConfig = () => {
    setConfig(null);
    localStorage.removeItem('firebaseConfig');
    notifications.show({
      title: 'Configuration Cleared',
      message: 'Firebase integration disabled',
      color: 'blue',
    });
  };

  const getSyncStatus = () => {
    if (isSyncing) {
      return { icon: <Loader size={14} />, color: 'blue', text: 'Syncing...' };
    }
    
    if (!isConfigured) {
      return { icon: <AlertCircle size={14} />, color: 'orange', text: 'Not configured' };
    }
    
    return { icon: <CheckCircle size={14} />, color: 'green', text: 'Connected' };
  };

  const status = getSyncStatus();

  return (
    <>
      <Group gap="xs">
        <Button
          leftSection={<Database size={16} />}
          rightSection={status.icon}
          onClick={handleSync}
          loading={isSyncing}
          variant={isConfigured ? 'light' : 'filled'}
          color={isConfigured ? 'green' : 'blue'}
          size="sm"
        >
          {isConfigured ? 'Firebase' : 'Connect Firebase'}
        </Button>

        {isConfigured && (
          <>
            <Badge variant="light" color={status.color} size="sm">
              {status.text}
            </Badge>

            <Menu shadow="lg" width={200}>
              <Menu.Target>
                <ActionIcon variant="light" color="gray" size="sm">
                  <Settings size={14} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<Settings size={14} />}
                  onClick={openSetup}
                >
                  Configure
                </Menu.Item>
                <Menu.Item
                  leftSection={<RefreshCw size={14} />}
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  Sync Now
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<Trash2 size={14} />}
                  color="red"
                  onClick={handleClearConfig}
                >
                  Disconnect
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </>
        )}

        {lastSync && (
          <Text size="xs" c="dimmed">
            Last sync: {lastSync.toLocaleTimeString()}
          </Text>
        )}
      </Group>

      <FirebaseSetup
        opened={setupOpened}
        onClose={closeSetup}
        onSave={handleSaveConfig}
        initialConfig={config || undefined}
      />
    </>
  );
}