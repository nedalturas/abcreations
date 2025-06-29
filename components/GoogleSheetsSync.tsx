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
  FileSpreadsheet, 
  RefreshCw, 
  Settings, 
  Trash2, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { GoogleSheetsSetup } from './GoogleSheetsSetup';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

interface GoogleSheetsSyncProps {
  onDataSync?: (data: { repairOrders: any[]; jobOrders: any[] }) => void;
}

export function GoogleSheetsSync({ onDataSync }: GoogleSheetsSyncProps) {
  const [setupOpened, { open: openSetup, close: closeSetup }] = useDisclosure(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const {
    config,
    isConfigured,
    isLoading,
    lastSync,
    saveConfig,
    clearConfig,
    syncAll,
  } = useGoogleSheets();

  const handleSync = async () => {
    if (!isConfigured) {
      openSetup();
      return;
    }

    setIsSyncing(true);
    try {
      const data = await syncAll();
      onDataSync?.(data);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncStatus = () => {
    if (isSyncing || isLoading) {
      return { icon: <Loader size={14} />, color: 'blue', text: 'Syncing...' };
    }
    
    if (!isConfigured) {
      return { icon: <AlertCircle size={14} />, color: 'orange', text: 'Not configured' };
    }
    
    if (lastSync) {
      return { icon: <CheckCircle size={14} />, color: 'green', text: 'Connected' };
    }
    
    return { icon: <Clock size={14} />, color: 'gray', text: 'Ready to sync' };
  };

  const status = getSyncStatus();

  return (
    <>
      <Group gap="xs">
        <Button
          leftSection={<FileSpreadsheet size={16} />}
          rightSection={status.icon}
          onClick={handleSync}
          loading={isSyncing || isLoading}
          variant={isConfigured ? 'light' : 'filled'}
          color={isConfigured ? 'green' : 'blue'}
          size="sm"
        >
          {isConfigured ? 'Sync Sheets' : 'Connect Sheets'}
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
                  disabled={isSyncing || isLoading}
                >
                  Sync Now
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<Trash2 size={14} />}
                  color="red"
                  onClick={clearConfig}
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

      <GoogleSheetsSetup
        opened={setupOpened}
        onClose={closeSetup}
        onSave={saveConfig}
        initialConfig={config || undefined}
      />
    </>
  );
}