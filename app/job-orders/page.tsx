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
import { Briefcase, Plus, MoreVertical, Edit, Trash2, Phone, Calendar, Package } from 'lucide-react';
import { JobOrderForm } from '@/components/JobOrderForm';
import { GoogleSheetsSync } from '@/components/GoogleSheetsSync';
import { useAutoSheets } from '@/hooks/useAutoSheets';
import { JobOrder } from '@/types';
import { notifications } from '@mantine/notifications';

export default function JobOrdersPage() {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingOrder, setEditingOrder] = useState<JobOrder | null>(null);
  const { saveJobOrder, isConfigured } = useAutoSheets();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('jobOrders');
    if (savedJobs) {
      setJobOrders(JSON.parse(savedJobs));
    }
  }, []);

  // Save to localStorage whenever jobOrders changes
  useEffect(() => {
    localStorage.setItem('jobOrders', JSON.stringify(jobOrders));
  }, [jobOrders]);

  const handleJobOrderSubmit = async (data: Omit<JobOrder, 'id' | 'createdAt'>) => {
    if (editingOrder) {
      // Update existing order
      const updatedOrder: JobOrder = {
        ...editingOrder,
        ...data,
      };
      setJobOrders(prev => prev.map(order => 
        order.id === editingOrder.id ? updatedOrder : order
      ));
      
      // Auto-save to Google Sheets if configured
      if (isConfigured) {
        try {
          await saveJobOrder(updatedOrder);
          notifications.show({
            title: 'Success!',
            message: 'Job order updated and synced to Google Sheets',
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Partially Successful',
            message: 'Job order updated locally, but failed to sync to Google Sheets',
            color: 'yellow',
          });
        }
      } else {
        notifications.show({
          title: 'Success!',
          message: 'Job order updated successfully',
          color: 'green',
        });
      }
    } else {
      // Create new order
      const newJobOrder: JobOrder = {
        ...data,
        id: `job-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setJobOrders(prev => [...prev, newJobOrder]);
      
      // Auto-save to Google Sheets if configured
      if (isConfigured) {
        try {
          await saveJobOrder(newJobOrder);
          notifications.show({
            title: 'Success!',
            message: 'Job order created and saved to Google Sheets',
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Partially Successful',
            message: 'Job order created locally, but failed to save to Google Sheets',
            color: 'yellow',
          });
        }
      } else {
        notifications.show({
          title: 'Success!',
          message: 'Job order created successfully',
          color: 'green',
        });
      }
    }
    
    setEditingOrder(null);
    close();
  };

  const handleEdit = (order: JobOrder) => {
    setEditingOrder(order);
    open();
  };

  const handleDelete = (orderId: string) => {
    setJobOrders(prev => prev.filter(order => order.id !== orderId));
    notifications.show({
      title: 'Deleted',
      message: 'Job order deleted successfully',
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

  const handleDataSync = (data: { repairOrders: any[]; jobOrders: JobOrder[] }) => {
    setJobOrders(data.jobOrders);
    notifications.show({
      title: 'Data Synced!',
      message: `Loaded ${data.jobOrders.length} job orders from Google Sheets`,
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
              <ThemeIcon size="xl" variant="light" color="green" radius="xl">
                <Briefcase size={28} />
              </ThemeIcon>
              <div>
                <Title className="page-title">Job Orders</Title>
                <Text className="page-subtitle">
                  Manage manufacturing orders and production schedules
                  {isConfigured && (
                    <Text size="sm" c="green" mt={4}>
                      ✓ Auto-syncing with Google Sheets
                    </Text>
                  )}
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
          {jobOrders
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
              Create your first job order or sync from Google Sheets to get started
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