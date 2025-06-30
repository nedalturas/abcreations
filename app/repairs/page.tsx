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
import { Wrench, Plus, MoreVertical, Edit, Trash2, Phone, Calendar } from 'lucide-react';
import { RepairForm } from '@/components/RepairForm';
import { FirebaseSync } from '@/components/FirebaseSync';
import { useRepairOrders } from '@/hooks/useFirebase';
import { RepairOrder } from '@/types';
import { notifications } from '@mantine/notifications';

export default function RepairsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editingOrder, setEditingOrder] = useState<RepairOrder | null>(null);
  
  const {
    repairOrders,
    loading,
    error,
    createRepairOrder,
    updateRepairOrder,
    deleteRepairOrder,
    refresh,
  } = useRepairOrders();

  const handleRepairSubmit = async (data: Omit<RepairOrder, 'id' | 'createdAt'>) => {
    try {
      if (editingOrder) {
        await updateRepairOrder(editingOrder.id, data);
      } else {
        await createRepairOrder(data);
      }
      setEditingOrder(null);
      close();
    } catch (error) {
      console.error('Error submitting repair order:', error);
    }
  };

  const handleEdit = (order: RepairOrder) => {
    setEditingOrder(order);
    open();
  };

  const handleDelete = async (orderId: string) => {
    try {
      await deleteRepairOrder(orderId);
    } catch (error) {
      console.error('Error deleting repair order:', error);
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
              <Text>Loading repair orders...</Text>
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
              <ThemeIcon size="xl" variant="light" color="blue" radius="xl">
                <Wrench size={28} />
              </ThemeIcon>
              <div>
                <Title className="page-title">Repair Orders</Title>
                <Text className="page-subtitle">
                  Manage all bag repair orders and track their progress
                </Text>
              </div>
            </Group>
            
            <Group gap="sm">
              {/* <FirebaseSync onDataSync={refresh} /> */}
              
              <Button
                leftSection={<Plus size={18} />}
                onClick={handleNewOrder}
                size="md"
                className="btn-primary desktop-new-button"
              >
                New Repair Order
              </Button>
            </Group>
          </Group>
        </div>

        {/* Section Header */}
        <div className="section-header">
          <Title className="section-title">All Repair Orders</Title>
          <Badge variant="light" color="blue" size="lg" radius="xl">
            {repairOrders.length} Total
          </Badge>
        </div>

        {/* Orders Cards */}
        <Stack gap="md">
          {repairOrders.map((order) => (
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
                  <strong>Damage:</strong> {order.damage}
                </div>
              </div>

              <div className="order-card-footer">
                <div className="order-card-meta">
                  <div className="order-card-price">${order.price.toFixed(2)}</div>
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
        
        {repairOrders.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Wrench size={32} />
            </div>
            <div className="empty-state-title">No repair orders yet</div>
            <div className="empty-state-description">
              Create your first repair order to get started.
            </div>
          </div>
        )}

        {/* Floating Action Button for Mobile */}
        <button
          className="floating-action-button"
          onClick={handleNewOrder}
          aria-label="New Repair Order"
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
              <ThemeIcon size="sm" variant="light" color="blue" >
                <Wrench size={16} />
              </ThemeIcon>
              <Text fw={600}>
                {editingOrder ? 'Edit Repair Order' : 'New Repair Order'}
              </Text>
            </Group>
          }
          size="lg"
          centered
          
        >
          <RepairForm
            onSubmit={handleRepairSubmit}
            initialData={editingOrder || undefined}
          />
        </Modal>
      </Container>
    </div>
  );
}