'use client';

import { Group, Button } from '@mantine/core';
import { Check, Clock, Calendar } from 'lucide-react';
import { OrderStatus } from '@/types';

interface StatusSelectorProps {
  status: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
}

export function StatusSelector({ status, onStatusChange }: StatusSelectorProps) {
  const statuses: { value: OrderStatus; label: string; color: string; icon: React.ReactNode }[] = [
    { 
      value: 'pending', 
      label: 'Pending', 
      color: 'orange',
      icon: <Clock size={16} />
    },
    { 
      value: 'done', 
      label: 'Done', 
      color: 'green',
      icon: <Check size={16} />
    },
    { 
      value: 'rescheduled', 
      label: 'Rescheduled', 
      color: 'blue',
      icon: <Calendar size={16} />
    },
  ];

  return (
    <Group gap="xs">
      {statuses.map((statusOption) => (
        <Button
          key={statusOption.value}
          variant={status === statusOption.value ? 'filled' : 'light'}
          color={statusOption.color}
          size="sm"
          radius="xl"
          leftSection={statusOption.icon}
          onClick={() => onStatusChange(statusOption.value)}
          style={{
            fontWeight: status === statusOption.value ? 600 : 500,
            transition: 'all 0.2s ease'
          }}
        >
          {statusOption.label}
        </Button>
      ))}
    </Group>
  );
}