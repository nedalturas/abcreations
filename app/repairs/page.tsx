'use client';

import { useState, useEffect } from 'react';
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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Wrench, Plus, MoreVertical, Edit, Trash2, Phone, Calendar } from 'lucide-react';
import { RepairForm } from '@/components/RepairForm';
import { GoogleSheetsSync } from '@/components/GoogleSheetsSync';
import { RepairOrder } from '@/types';
import { notifications } from '@mantine/notifications';

export default function RepairsPage() {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingOrder, setEditingOrder] = useState<RepairOrder | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedRepairs = localStorage.getItem('repairOrders');
    if (savedRepairs) {
      setRepairOrders(JSON.parse(savedRepairs));
    }
  }, []);

  // Save to localStorage whenever repairOrders changes
  useEffect(() => {
    localStorage.setItem('repairOrders', JSON.stringify(repairOrders));
  }, [repairOrders]);

  const handleRepairSubmit = (data: Omit<RepairOrder, 'id' | 'createdAt'>) => {
    if (editingOrder) {
      // Update existing order
      const updatedOrder: RepairOrder = {
        ...editingOrder,
        ...data,
      };
      setRepairOrders(prev => prev.map(order => 
        order.id === editingOrder.id ? updatedOrder : order
      ));
      notifications.show({
        title: 'Success!',
        message: 'Repair order updated successfully',
        color: 'green',
      });
    } else {
      // Create new order
      const newRepair: RepairOrder = {
        ...data,
        id: `repair-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setRepairOrders(prev => [...prev, newRepair]);
      notifications.show({
        title: 'Success!',
        message: 'Repair order created successfully',
        color: 'green',
      });
    }
    
    setEditingOrder(null);
    close();
  };

  const handleEdit = (order: RepairOrder) => {
    setEditingOrder(order);
    open();
  };

  const handleDelete = (orderId: string) => {
    setRepairOrders(prev => prev.filter(order => order.id !== orderId));
    notifications.show({
      title: 'Deleted',
      message: 'Repair order deleted successfully',
      color: 'red',
    });
  };

  const handleNewOrder = () => {
    setEditingOrder(null);
    open();
  };

  const handlePhoneCall = (phoneNumber: string, customerName: string) => {
    // Create tel: link for mobile devices
    const telLink = `tel:${phoneNumber}`;
    window.location.href = telLink;
    
    notifications.show({
      title: 'Calling...',
      message: `Dialing ${customerName} at ${phoneNumber}`,
      color: 'blue',
    });
  };

  const handleDataSync = (data: { repairOrders: RepairOrder[]; jobOrders: any[] }) => {
    setRepairOrders(data.repairOrders);
    notifications.show({
      title: 'Data Synced!',
      message: `Loaded ${data.repairOrders.length} repair orders from Google Sheets`,
      color: 'green',
    });
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`status-badge status-${status}`}>
        {status}
      </span>
    );
  };

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
              <GoogleSheetsSync onDataSync={handleDataSync} />
              
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
          {repairOrders
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((order) => (
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
              Create your first repair order or sync from Google Sheets to get started
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
              <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                <Wrench size={16} />
              </ThemeIcon>
              <Text fw={600}>
                {editingOrder ? 'Edit Repair Order' : 'New Repair Order'}
              </Text>
            </Group>
          }
          size="lg"
          centered
          radius="xl"
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