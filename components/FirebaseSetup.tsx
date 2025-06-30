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
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { AlertCircle, ExternalLink, Database, Key, Settings } from 'lucide-react';

interface FirebaseSetupProps {
  opened: boolean;
  onClose: () => void;
  onSave: (config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  }) => void;
  initialConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export function FirebaseSetup({ opened, onClose, onSave, initialConfig }: FirebaseSetupProps) {
  const [activeTab, setActiveTab] = useState<string | null>('setup');

  const form = useForm({
    initialValues: {
      apiKey: initialConfig?.apiKey || '',
      authDomain: initialConfig?.authDomain || '',
      projectId: initialConfig?.projectId || '',
      storageBucket: initialConfig?.storageBucket || '',
      messagingSenderId: initialConfig?.messagingSenderId || '',
      appId: initialConfig?.appId || '',
    },
    validate: {
      apiKey: (value) => (!value ? 'API Key is required' : null),
      authDomain: (value) => (!value ? 'Auth Domain is required' : null),
      projectId: (value) => (!value ? 'Project ID is required' : null),
      storageBucket: (value) => (!value ? 'Storage Bucket is required' : null),
      messagingSenderId: (value) => (!value ? 'Messaging Sender ID is required' : null),
      appId: (value) => (!value ? 'App ID is required' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    onSave(values);
    onClose();
  };

  const handleConfigPaste = (configText: string) => {
    try {
      // Try to extract config from Firebase config object
      const configMatch = configText.match(/const firebaseConfig = ({[\s\S]*?});/);
      if (configMatch) {
        const configStr = configMatch[1];
        // Simple regex extraction for each field
        const apiKey = configStr.match(/apiKey:\s*["']([^"']+)["']/)?.[1] || '';
        const authDomain = configStr.match(/authDomain:\s*["']([^"']+)["']/)?.[1] || '';
        const projectId = configStr.match(/projectId:\s*["']([^"']+)["']/)?.[1] || '';
        const storageBucket = configStr.match(/storageBucket:\s*["']([^"']+)["']/)?.[1] || '';
        const messagingSenderId = configStr.match(/messagingSenderId:\s*["']([^"']+)["']/)?.[1] || '';
        const appId = configStr.match(/appId:\s*["']([^"']+)["']/)?.[1] || '';

        form.setValues({
          apiKey,
          authDomain,
          projectId,
          storageBucket,
          messagingSenderId,
          appId,
        });
      }
    } catch (error) {
      console.error('Error parsing config:', error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Database size={20} />
          <Text fw={600}>Firebase Configuration</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="setup" leftSection={<Settings size={16} />}>
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
                Connect your Firebase project to enable real-time data sync and cloud storage!
              </Alert>

              <Textarea
                label="Quick Setup (Optional)"
                placeholder="Paste your Firebase config object here for quick setup..."
                description="Copy the entire firebaseConfig object from Firebase console and paste it here"
                minRows={3}
                onChange={(event) => handleConfigPaste(event.currentTarget.value)}
              />

              <TextInput
                label="API Key"
                placeholder="AIzaSyC..."
                description="Your Firebase Web API key"
                leftSection={<Key size={16} />}
                required
                {...form.getInputProps('apiKey')}
              />

              <Group grow>
                <TextInput
                  label="Auth Domain"
                  placeholder="your-project.firebaseapp.com"
                  description="Firebase Auth domain"
                  required
                  {...form.getInputProps('authDomain')}
                />

                <TextInput
                  label="Project ID"
                  placeholder="your-project-id"
                  description="Firebase project ID"
                  required
                  {...form.getInputProps('projectId')}
                />
              </Group>

              <Group grow>
                <TextInput
                  label="Storage Bucket"
                  placeholder="your-project.appspot.com"
                  description="Firebase Storage bucket"
                  required
                  {...form.getInputProps('storageBucket')}
                />

                <TextInput
                  label="Messaging Sender ID"
                  placeholder="123456789"
                  description="Firebase messaging sender ID"
                  required
                  {...form.getInputProps('messagingSenderId')}
                />
              </Group>

              <TextInput
                label="App ID"
                placeholder="1:123456789:web:abcdef..."
                description="Firebase app ID"
                required
                {...form.getInputProps('appId')}
              />

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
              <Text fw={600} mb="sm">🚀 Step 1: Create Firebase Project</Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  Go to{' '}
                  <Anchor href="https://console.firebase.google.com/" target="_blank">
                    Firebase Console <ExternalLink size={12} />
                  </Anchor>
                </List.Item>
                <List.Item>Click "Create a project" or "Add project"</List.Item>
                <List.Item>Enter your project name (e.g., "bagcraft-pro")</List.Item>
                <List.Item>Choose whether to enable Google Analytics (optional)</List.Item>
                <List.Item>Click "Create project"</List.Item>
              </List>
            </div>

            <div>
              <Text fw={600} mb="sm">⚙️ Step 2: Configure Firebase Services</Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <strong>Firestore Database:</strong> Go to "Firestore Database" → "Create database" → Start in "Test mode"
                </List.Item>
                <List.Item>
                  <strong>Storage:</strong> Go to "Storage" → "Get started" → Start in "Test mode"
                </List.Item>
                <List.Item>
                  <strong>Authentication (Optional):</strong> Go to "Authentication" → "Get started" → Enable "Email/Password"
                </List.Item>
              </List>
            </div>

            <div>
              <Text fw={600} mb="sm">🔧 Step 3: Get Configuration</Text>
              <List size="sm" spacing="xs">
                <List.Item>In Firebase Console, click the gear icon → "Project settings"</List.Item>
                <List.Item>Scroll down to "Your apps" section</List.Item>
                <List.Item>Click the web icon (&lt;/&gt;) to add a web app</List.Item>
                <List.Item>Enter app nickname (e.g., "BagCraft Web")</List.Item>
                <List.Item>Copy the configuration object that appears</List.Item>
              </List>
            </div>

            <div>
              <Text fw={600} mb="sm">📋 Step 4: Security Rules (Important!)</Text>
              <Text size="sm" c="dimmed" mb="sm">
                Update your Firestore security rules for production:
              </Text>
              <Code block>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to repair orders
    match /repairOrders/{document} {
      allow read, write: if true; // Change this for production
    }
    
    // Allow read/write access to job orders
    match /jobOrders/{document} {
      allow read, write: if true; // Change this for production
    }
  }
}`}
              </Code>
            </div>

            <Alert icon={<AlertCircle size={16} />} color="orange" variant="light">
              <Text size="sm">
                <strong>Security Note:</strong> The rules above allow public access for testing. 
                For production, implement proper authentication and restrict access based on user permissions.
              </Text>
            </Alert>

            <div>
              <Text fw={600} mb="sm">🌐 Step 5: Environment Variables</Text>
              <Text size="sm" c="dimmed" mb="sm">
                Create a <Code>.env.local</Code> file in your project root with:
              </Text>
              <Code block>
{`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`}
              </Code>
            </div>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}