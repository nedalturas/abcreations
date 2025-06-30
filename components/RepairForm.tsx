'use client';

import { useState } from 'react';
import {
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Stack,
  Group,
  FileInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Calendar, Camera, Phone, User, DollarSign } from 'lucide-react';
import { StatusSelector } from './StatusSelector';
import { RepairOrder, OrderStatus } from '@/types';

interface RepairFormProps {
  onSubmit: (data: Omit<RepairOrder, 'id' | 'createdAt'>) => void;
  initialData?: Partial<RepairOrder>;
}

export function RepairForm({ onSubmit, initialData }: RepairFormProps) {
  const [status, setStatus] = useState<OrderStatus>(initialData?.status || 'pending');

  const form = useForm({
    initialValues: {
      customerName: initialData?.customerName || '',
      phoneNumber: initialData?.phoneNumber || '',
      damage: initialData?.damage || '',
      price: initialData?.price || 0,
      picture: initialData?.picture || null,
      deadline: initialData?.deadline ? new Date(initialData.deadline) : new Date(),
    },
    validate: {
      customerName: (value) => (!value ? 'Customer name is required' : null),
      phoneNumber: (value) => (!value ? 'Phone number is required' : null),
      damage: (value) => (!value ? 'Damage description is required' : null),
      price: (value) => (value <= 0 ? 'Price must be greater than 0' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const submissionData = {
      ...values,
      deadline: values.deadline.toISOString().split('T')[0],
      status,
    };
    
    onSubmit(submissionData);
    
    // Reset form only if not editing
    if (!initialData) {
      form.reset();
      setStatus('pending');
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Group grow>
          <TextInput
            label="Customer Name"
            placeholder="Enter customer name"
            leftSection={<User size={16} />}
            required
            {...form.getInputProps('customerName')}
          />

          <TextInput
            label="Phone Number"
            placeholder="Enter phone number"
            leftSection={<Phone size={16} />}
            required
            {...form.getInputProps('phoneNumber')}
          />
        </Group>

        <Textarea
          label="Damage Description"
          placeholder="Describe the damage in detail"
          required
          minRows={3}
          autosize
          {...form.getInputProps('damage')}
        />

        <Group grow>
          <NumberInput
            label="Repair Price"
            placeholder="Enter repair price"
            leftSection={<DollarSign size={16} />}
            required
            min={0}
            decimalScale={2}
            fixedDecimalScale
            {...form.getInputProps('price')}
          />

          <DateInput
            label="Deadline"
            placeholder="Select deadline"
            leftSection={<Calendar size={16} />}
            required
            {...form.getInputProps('deadline')}
          />
        </Group>

        <FileInput
          label="Damage Picture"
          placeholder="Upload damage picture (optional)"
          leftSection={<Camera size={16} />}
          accept="image/*"
          {...form.getInputProps('picture')}
        />

        <div>
          <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
            Status
          </label>
          <StatusSelector status={status} onStatusChange={setStatus} />
        </div>

        <Group justify="flex-end" mt="md">
          <Button type="submit" className="btn-primary">
            {initialData ? 'Update Repair Order' : 'Create Repair Order'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}