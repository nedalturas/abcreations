'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  ThemeIcon,
  Button,
  Modal,
  Badge,
  ActionIcon,
  Menu,
  Stack,
  Loader,
  Center,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Briefcase, Plus, MoreVertical, Edit, Trash2, Phone, Calendar, Package } from 'lucide-react';
import { JobOrderForm } from '@/components/JobOrderForm';
import { FirebaseSync } from '@/components/FirebaseSync';
import { useJobOrders } from '@/hooks/useFirebase';
import { JobOrder } from '@/types';
import { notifications } from '@mantine/notifications';

export default function JobOrdersPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editingOrder, setEditingOrder] = useState<JobOrder | null>(null);
  
  const {
    jobOrders,
    loading,
    error,
    createJobOrder,
    updateJobOrder,
    deleteJobOrder,
    refresh,
  } = useJobOrders();

  const handleJobOrderSubmit = async (data: Omit<JobOrder, 'id' | 'createdAt'>) => {
    try {
      if (editingOrder) {
        await updateJobOrder(editingOrder.id, data);
      } else {
        await createJobOrder(data);
      }
      setEditingOrder(null);
      close();
    } catch (error) {
      console.error('Error submitting job order:', error);
    }
  };

  const handleEdit = (order: JobOrder) => {
    setEditingOrder(order);
    open();
  };

  const handleDelete = async (orderId: string) => {
    try {
      await deleteJobOrder(orderId);
    } catch (error) {
      console.error('Error deleting job order:', error);
    }
  };

  const handleNewOrder = () => {
    setEditingOrder(null);
    open();
  };

  const handlePhoneCall = (phoneNumber: string, customerName: string) => {
    const telLink = `tel:${phoneNumber}`;
    window.location.href = telLink;
    
    notifications.show({
      title: 'Calling...',
      message: `Dialing ${customerName} at ${phoneNumber}`,
      color: 'blue',
    });
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`status-badge status-${status}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <Container size="xl">
          <Center h={400}>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text>Loading job orders...</Text>
            </Stack>
          </Center>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Container size="xl">
          <Center h={400}>
            <Stack align="center" gap="md">
              <Text c="red">Error: {error}</Text>
              <Button onClick={refresh}>Retry</Button>
            </Stack>
          </Center>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Container size="xl">
        {/* Page Header */}
        <div className="page-header">
          <Group justify="space-between" align="flex-start">
            <Group gap="sm">
              <ThemeIcon size="xl" variant="light" color="green" radius="xl">
                <Briefcase size={28} />
              </ThemeIcon>
              <div>
                <Title className="page-title">Job Orders</Title>
                <Text className="page-subtitle">
                  Manage manufacturing orders and production schedules
                  <Text size="sm" c="green" mt={4}>
                    ✓ Real-time sync with Firebase
                  </Text>
                </Text>
              </div>
            </Group>
            
            <Group gap="sm">
              <FirebaseSync onDataSync={refresh} />
              
              <Button
                leftSection={<Plus size={18} />}
                onClick={handleNewOrder}
                size="md"
                className="btn-primary desktop-new-button"
              >
                New Job Order
              </Button>
            </Group>
          </Group>
        </div>

        {/* Section Header */}
        <div className="section-header">
          <Title className="section-title">All Job Orders</Title>
          <Badge variant="light" color="green" size="lg" radius="xl">
            {jobOrders.length} Total
          </Badge>
        </div>

        {/* Orders Cards */}
        <Stack gap="md">
          {jobOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div className="order-card-customer">{order.customerName}</div>
                  <div className="order-card-phone">{order.phoneNumber}</div>
                </div>
                <div className="order-card-actions">
                  <ActionIcon
                    variant="light"
                    color="green"
                    size="lg"
                    radius="xl"
                    onClick={() => handlePhoneCall(order.phoneNumber, order.customerName)}
                    className="phone-button"
                  >
                    <Phone size={16} />
                  </ActionIcon>
                  
                  <Menu shadow="lg" width={180} radius="lg">
                    <Menu.Target>
                      <ActionIcon variant="light" color="gray" size="lg" radius="xl">
                        <MoreVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<Edit size={16} />}
                        onClick={() => handleEdit(order)}
                      >
                        Edit Order
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<Trash2 size={16} />}
                        color="red"
                        onClick={() => handleDelete(order.id)}
                      >
                        Delete Order
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-card-description">
                  <strong>Description:</strong> {order.description}
                </div>
              </div>

              <div className="order-card-footer">
                <div className="order-card-meta">
                  <div className="order-card-price">${order.price.toFixed(2)}</div>
                  <div className="order-card-deadline">
                    <Package size={14} />
                    Qty: {order.quantity}
                  </div>
                  <div className="order-card-deadline">
                    <Calendar size={14} />
                    {new Date(order.deadline).toLocaleDateString()}
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </div>
          ))}
        </Stack>
        
        {jobOrders.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Briefcase size={32} />
            </div>
            <div className="empty-state-title">No job orders yet</div>
            <div className="empty-state-description">
              Create your first job order to get started with Firebase!
            </div>
          </div>
        )}

        {/* Floating Action Button for Mobile */}
        <button
          className="floating-action-button"
          onClick={handleNewOrder}
          aria-label="New Job Order"
        >
          <Plus size={24} />
        </button>

        {/* Modal for Create/Edit */}
        <Modal
          opened={opened}
          onClose={() => {
            setEditingOrder(null);
            close();
          }}
          title={
            <Group gap="sm">
              <ThemeIcon size="sm" variant="light" color="green" radius="xl">
                <Briefcase size={16} />
              </ThemeIcon>
              <Text fw={600}>
                {editingOrder ? 'Edit Job Order' : 'New Job Order'}
              </Text>
            </Group>
          }
          size="lg"
          centered
          radius="xl"
        >
          <JobOrderForm
            onSubmit={handleJobOrderSubmit}
            initialData={editingOrder || undefined}
          />
        </Modal>
      </Container>
    </div>
  );
}