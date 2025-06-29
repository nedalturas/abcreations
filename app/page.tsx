'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Title,
  ActionIcon,
} from '@mantine/core';
import { 
  LayoutDashboard, 
  Wrench, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Phone
} from 'lucide-react';
import { RepairOrder, JobOrder } from '@/types';
import { notifications } from '@mantine/notifications';

export default function Dashboard() {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedRepairs = localStorage.getItem('repairOrders');
    const savedJobs = localStorage.getItem('jobOrders');
    
    if (savedRepairs) {
      setRepairOrders(JSON.parse(savedRepairs));
    }
    if (savedJobs) {
      setJobOrders(JSON.parse(savedJobs));
    }
  }, []);

  // Calculate statistics
  const stats = {
    totalRepairs: repairOrders.length,
    totalJobs: jobOrders.length,
    pendingRepairs: repairOrders.filter(r => r.status === 'pending').length,
    pendingJobs: jobOrders.filter(j => j.status === 'pending').length,
    completedRepairs: repairOrders.filter(r => r.status === 'done').length,
    completedJobs: jobOrders.filter(j => j.status === 'done').length,
    rescheduledRepairs: repairOrders.filter(r => r.status === 'rescheduled').length,
    rescheduledJobs: jobOrders.filter(j => j.status === 'rescheduled').length,
  };

  // Get upcoming deadlines (next 7 days)
  const getUpcomingDeadlines = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingRepairs = repairOrders.filter(repair => {
      const deadline = new Date(repair.deadline);
      return deadline >= today && deadline <= nextWeek && repair.status !== 'done';
    });
    
    const upcomingJobs = jobOrders.filter(job => {
      const deadline = new Date(job.deadline);
      return deadline >= today && deadline <= nextWeek && job.status !== 'done';
    });
    
    return [...upcomingRepairs, ...upcomingJobs].sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  };

  const upcomingDeadlines = getUpcomingDeadlines();

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

  return (
    <div className="page-container">
      <Container size="xl">
        {/* Page Header */}
        <div className="page-header">
          <Group gap="sm" mb="xs">
            <ThemeIcon size="xl" variant="light" color="blue" radius="xl">
              <LayoutDashboard size={28} />
            </ThemeIcon>
            <div>
              <Title className="page-title">Dashboard</Title>
              <Text className="page-subtitle">
                Overview of your repair and manufacturing operations
              </Text>
            </div>
          </Group>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon" style={{ backgroundColor: '#FFF8E1' }}>
              <Clock size={24} color="#F57C00" />
            </div>
            <div className="stats-number" style={{ color: '#F57C00' }}>
              {stats.pendingRepairs}
            </div>
            <div className="stats-label">Pending Repairs</div>
          </div>

          <div className="stats-card">
            <div className="stats-icon" style={{ backgroundColor: '#FFF8E1' }}>
              <Briefcase size={24} color="#F57C00" />
            </div>
            <div className="stats-number" style={{ color: '#F57C00' }}>
              {stats.pendingJobs}
            </div>
            <div className="stats-label">Pending Jobs</div>
          </div>

          <div className="stats-card">
            <div className="stats-icon" style={{ backgroundColor: '#E8F5E8' }}>
              <CheckCircle size={24} color="#2E7D32" />
            </div>
            <div className="stats-number" style={{ color: '#2E7D32' }}>
              {stats.completedRepairs + stats.completedJobs}
            </div>
            <div className="stats-label">Total Completed</div>
          </div>

          <div className="stats-card">
            <div className="stats-icon" style={{ backgroundColor: '#E3F2FD' }}>
              <TrendingUp size={24} color="#1976D2" />
            </div>
            <div className="stats-number" style={{ color: '#1976D2' }}>
              {stats.totalRepairs + stats.totalJobs}
            </div>
            <div className="stats-label">Total Orders</div>
          </div>
        </div>

        <Grid>
          {/* Recent Orders */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <div className="section-header">
              <Title className="section-title">Recent Orders</Title>
              <Text size="sm" c="dimmed">
                {repairOrders.length + jobOrders.length} Total
              </Text>
            </div>

            <Stack gap="sm">
              {[...repairOrders, ...jobOrders]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10)
                .map((order) => (
                  <div key={order.id} className="dashboard-card">
                    <div className="dashboard-card-header">
                      <div>
                        <div className="dashboard-card-type">
                          {'damage' in order ? <Wrench size={12} /> : <Briefcase size={12} />}
                          {'damage' in order ? 'Repair' : 'Job Order'}
                        </div>
                        <div className="dashboard-card-customer">{order.customerName}</div>
                        <div className="dashboard-card-phone">{order.phoneNumber}</div>
                      </div>
                      <ActionIcon
                        variant="light"
                        color="green"
                        size="sm"
                        radius="xl"
                        onClick={() => handlePhoneCall(order.phoneNumber, order.customerName)}
                        className="phone-button"
                        style={{ width: '32px', height: '32px' }}
                      >
                        <Phone size={14} />
                      </ActionIcon>
                    </div>

                    <div className="dashboard-card-footer">
                      <div className="dashboard-card-meta">
                        <div className="dashboard-card-price">${order.price.toFixed(2)}</div>
                        <div className="dashboard-card-deadline">
                          <Calendar size={12} />
                          {new Date(order.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
            </Stack>
            
            {repairOrders.length === 0 && jobOrders.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <LayoutDashboard size={32} />
                </div>
                <div className="empty-state-title">No orders yet</div>
                <div className="empty-state-description">
                  Create your first repair or job order to get started!
                </div>
              </div>
            )}
          </Grid.Col>

          {/* Upcoming Deadlines */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <div className="section-header">
              <Title className="section-title">Upcoming Deadlines</Title>
              <ThemeIcon size="sm" variant="light" color="orange" radius="xl">
                <AlertCircle size={16} />
              </ThemeIcon>
            </div>

            <Stack gap="sm">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.slice(0, 5).map((order) => (
                  <div key={order.id} className="upcoming-card">
                    <div className="upcoming-card-header">
                      <div className="upcoming-card-type">
                        {'damage' in order ? <Wrench size={12} /> : <Briefcase size={12} />}
                        {'damage' in order ? 'Repair' : 'Job'}
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="upcoming-card-customer">{order.customerName}</div>
                    <div className="upcoming-card-footer">
                      <div className="upcoming-card-meta">
                        <div className="upcoming-card-deadline">
                          <Calendar size={12} />
                          {new Date(order.deadline).toLocaleDateString()}
                        </div>
                        <div className="upcoming-card-price">
                          ${order.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="upcoming-card-actions">
                        <ActionIcon
                          variant="light"
                          color="green"
                          size="sm"
                          radius="xl"
                          onClick={() => handlePhoneCall(order.phoneNumber, order.customerName)}
                          style={{ width: '28px', height: '28px' }}
                        >
                          <Phone size={12} />
                        </ActionIcon>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div className="empty-state-icon" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}>
                    <Calendar size={24} />
                  </div>
                  <Text c="dimmed" size="sm">
                    No upcoming deadlines
                  </Text>
                </div>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
}