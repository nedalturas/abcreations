'use client';

import { useState } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Group,
  Text,
  Alert,
  Tabs,
  Code,
  List,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { AlertCircle, ExternalLink, FileSpreadsheet, Key, Database } from 'lucide-react';

interface GoogleSheetsSetupProps {
  opened: boolean;
  onClose: () => void;
  onSave: (config: { spreadsheetId: string; apiKey: string; repairRange: string; jobRange: string }) => void;
  initialConfig?: {
    spreadsheetId: string;
    apiKey: string;
    repairRange: string;
    jobRange: string;
  };
}

export function GoogleSheetsSetup({ opened, onClose, onSave, initialConfig }: GoogleSheetsSetupProps) {
  const [activeTab, setActiveTab] = useState<string | null>('setup');

  const form = useForm({
    initialValues: {
      spreadsheetId: initialConfig?.spreadsheetId || '',
      apiKey: initialConfig?.apiKey || '',
      repairRange: initialConfig?.repairRange || 'Repairs!A:H',
      jobRange: initialConfig?.jobRange || 'Jobs!A:I',
    },
    validate: {
      spreadsheetId: (value) => (!value ? 'Spreadsheet ID is required' : null),
      apiKey: (value) => (!value ? 'API Key is required' : null),
      repairRange: (value) => (!value ? 'Repair range is required' : null),
      jobRange: (value) => (!value ? 'Job range is required' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    onSave(values);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <FileSpreadsheet size={20} />
          <Text fw={600}>Google Sheets Integration</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="setup" leftSection={<Database size={16} />}>
            Setup
          </Tabs.Tab>
          <Tabs.Tab value="instructions" leftSection={<AlertCircle size={16} />}>
            Instructions
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="setup" pt="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
                Connect your Google Sheets to sync repair and job orders automatically!
              </Alert>

              <TextInput
                label="Google Sheets URL or Spreadsheet ID"
                placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit or just the ID"
                description="Paste your Google Sheets URL or just the spreadsheet ID"
                {...form.getInputProps('spreadsheetId')}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  // Extract ID from URL if full URL is provided
                  const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                  const id = match ? match[1] : value;
                  form.setFieldValue('spreadsheetId', id);
                }}
              />

              <TextInput
                label="Google Sheets API Key"
                placeholder="AIzaSyC..."
                description="Your Google Cloud API key with Sheets API enabled"
                leftSection={<Key size={16} />}
                {...form.getInputProps('apiKey')}
              />

              <Group grow>
                <TextInput
                  label="Repairs Sheet Range"
                  placeholder="Repairs!A:H"
                  description="Sheet name and range for repair orders"
                  {...form.getInputProps('repairRange')}
                />

                <TextInput
                  label="Jobs Sheet Range"
                  placeholder="Jobs!A:I"
                  description="Sheet name and range for job orders"
                  {...form.getInputProps('jobRange')}
                />
              </Group>

              <Group justify="flex-end" mt="md">
                <Button variant="light" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">
                  Save Configuration
                </Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="instructions" pt="md">
          <Stack gap="lg">
            <div>
              <Text fw={600} mb="sm">📋 Step 1: Prepare Your Google Sheet</Text>
              <Text size="sm" c="dimmed" mb="sm">
                Create a Google Sheet with two tabs: "Repairs" and "Jobs"
              </Text>
              
              <Text fw={500} size="sm" mb="xs">Repairs Sheet Headers (Row 1):</Text>
              <Code block>
                ID | Customer Name | Phone | Damage | Price | Deadline | Status | Created At
              </Code>
              
              <Text fw={500} size="sm" mb="xs" mt="md">Jobs Sheet Headers (Row 1):</Text>
              <Code block>
                ID | Customer Name | Phone | Description | Quantity | Price | Deadline | Status | Created At
              </Code>
            </div>

            <div>
              <Text fw={600} mb="sm">🔑 Step 2: Get Google Sheets API Key</Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  Go to{' '}
                  <Anchor href="https://console.cloud.google.com/" target="_blank">
                    Google Cloud Console <ExternalLink size={12} />
                  </Anchor>
                </List.Item>
                <List.Item>Create a new project or select existing one</List.Item>
                <List.Item>Enable the "Google Sheets API"</List.Item>
                <List.Item>Go to "Credentials" → "Create Credentials" → "API Key"</List.Item>
                <List.Item>Copy your API key</List.Item>
              </List>
            </div>

            <div>
              <Text fw={600} mb="sm">🔗 Step 3: Share Your Sheet</Text>
              <List size="sm" spacing="xs">
                <List.Item>Open your Google Sheet</List.Item>
                <List.Item>Click "Share" button</List.Item>
                <List.Item>Change access to "Anyone with the link can view"</List.Item>
                <List.Item>Copy the sheet URL</List.Item>
              </List>
            </div>

            <Alert icon={<AlertCircle size={16} />} color="orange" variant="light">
              <Text size="sm">
                <strong>Note:</strong> This integration currently supports reading data from Google Sheets. 
                To write data back to sheets, you'll need to set up OAuth2 authentication or use Google Apps Script.
              </Text>
            </Alert>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}