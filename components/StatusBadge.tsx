import { Badge } from '@mantine/core';
import { OrderStatus } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'done':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'rescheduled':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'done':
        return 'Done';
      case 'pending':
        return 'Pending';
      case 'rescheduled':
        return 'Rescheduled';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge 
      color={getStatusColor(status)} 
      variant="light"
      size="lg"
    >
      {getStatusText(status)}
    </Badge>
  );
}