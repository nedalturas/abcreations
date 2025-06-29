'use client';

import { useState } from 'react';
import {
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Calendar, Phone, User, DollarSign, Package } from 'lucide-react';
import { StatusSelector } from './StatusSelector';
import { JobOrder, OrderStatus } from '@/types';

interface JobOrderFormProps {
  onSubmit: (data: Omit<JobOrder, 'id' | 'createdAt'>) => void;
  initialData?: Partial<JobOrder>;
}

export function JobOrderForm({ onSubmit, initialData }: JobOrderFormProps) {
  const [status, setStatus] = useState<OrderStatus>(initialData?.status || 'pending');

  const form = useForm({
    initialValues: {
      customerName: initialData?.customerName || '',
      phoneNumber: initialData?.phoneNumber || '',
      description: initialData?.description || '',
      quantity: initialData?.quantity || 1,
      price: initialData?.price || 0,
      deadline: initialData?.deadline ? new Date(initialData.deadline) : new Date(),
    },
    validate: {
      customerName: (value) => (!value ? 'Customer name is required' : null),
      phoneNumber: (value) => (!value ? 'Phone number is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
      quantity: (value) => (value <= 0 ? 'Quantity must be greater than 0' : null),
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
          label="Job Description"
          placeholder="Describe the job requirements in detail"
          required
          minRows={3}
          autosize
          {...form.getInputProps('description')}
        />

        <Group grow>
          <NumberInput
            label="Quantity"
            placeholder="Enter quantity"
            leftSection={<Package size={16} />}
            required
            min={1}
            {...form.getInputProps('quantity')}
          />

          <NumberInput
            label="Total Price"
            placeholder="Enter total price"
            leftSection={<DollarSign size={16} />}
            required
            min={0}
            precision={2}
            {...form.getInputProps('price')}
          />
        </Group>

        <DateInput
          label="Deadline"
          placeholder="Select deadline"
          leftSection={<Calendar size={16} />}
          required
          {...form.getInputProps('deadline')}
        />

        <div>
          <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
            Status
          </label>
          <StatusSelector status={status} onStatusChange={setStatus} />
        </div>

        <Group justify="flex-end" mt="md">
          <Button type="submit" className="btn-primary">
            {initialData ? 'Update Job Order' : 'Create Job Order'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}