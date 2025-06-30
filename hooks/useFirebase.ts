'use client';

import { useState, useEffect } from 'react';
import { repairOrdersService, jobOrdersService } from '@/lib/firebaseService';
import { RepairOrder, JobOrder } from '@/types';
import { notifications } from '@mantine/notifications';

// Hook for managing repair orders with Firebase
export function useRepairOrders() {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load repair orders on mount
  useEffect(() => {
    loadRepairOrders();
  }, []);

  // Set up real-time listener
  useEffect(() => {
    const unsubscribe = repairOrdersService.onSnapshot((orders) => {
      setRepairOrders(orders);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadRepairOrders = async () => {
    try {
      setLoading(true);
      const orders = await repairOrdersService.getAll();
      setRepairOrders(orders);
      setError(null);
    } catch (err) {
      setError('Failed to load repair orders');
      console.error('Error loading repair orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRepairOrder = async (orderData: Omit<RepairOrder, 'id' | 'createdAt'>) => {
    try {
      const id = await repairOrdersService.create(orderData);
      notifications.show({
        title: 'Success!',
        message: 'Repair order created successfully',
        color: 'green',
      });
      return id;
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create repair order',
        color: 'red',
      });
      throw err;
    }
  };

  const updateRepairOrder = async (id: string, orderData: Partial<RepairOrder>) => {
    try {
      await repairOrdersService.update(id, orderData);
      notifications.show({
        title: 'Success!',
        message: 'Repair order updated successfully',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update repair order',
        color: 'red',
      });
      throw err;
    }
  };

  const deleteRepairOrder = async (id: string) => {
    try {
      await repairOrdersService.delete(id);
      notifications.show({
        title: 'Success!',
        message: 'Repair order deleted successfully',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete repair order',
        color: 'red',
      });
      throw err;
    }
  };

  const uploadImage = async (file: File, orderId: string) => {
    try {
      const imageUrl = await repairOrdersService.uploadImage(file, orderId);
      return imageUrl;
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red',
      });
      throw err;
    }
  };

  return {
    repairOrders,
    loading,
    error,
    createRepairOrder,
    updateRepairOrder,
    deleteRepairOrder,
    uploadImage,
    refresh: loadRepairOrders,
  };
}

// Hook for managing job orders with Firebase
export function useJobOrders() {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load job orders on mount
  useEffect(() => {
    loadJobOrders();
  }, []);

  // Set up real-time listener
  useEffect(() => {
    const unsubscribe = jobOrdersService.onSnapshot((orders) => {
      setJobOrders(orders);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadJobOrders = async () => {
    try {
      setLoading(true);
      const orders = await jobOrdersService.getAll();
      setJobOrders(orders);
      setError(null);
    } catch (err) {
      setError('Failed to load job orders');
      console.error('Error loading job orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createJobOrder = async (orderData: Omit<JobOrder, 'id' | 'createdAt'>) => {
    try {
      const id = await jobOrdersService.create(orderData);
      notifications.show({
        title: 'Success!',
        message: 'Job order created successfully',
        color: 'green',
      });
      return id;
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create job order',
        color: 'red',
      });
      throw err;
    }
  };

  const updateJobOrder = async (id: string, orderData: Partial<JobOrder>) => {
    try {
      await jobOrdersService.update(id, orderData);
      notifications.show({
        title: 'Success!',
        message: 'Job order updated successfully',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update job order',
        color: 'red',
      });
      throw err;
    }
  };

  const deleteJobOrder = async (id: string) => {
    try {
      await jobOrdersService.delete(id);
      notifications.show({
        title: 'Success!',
        message: 'Job order deleted successfully',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete job order',
        color: 'red',
      });
      throw err;
    }
  };

  return {
    jobOrders,
    loading,
    error,
    createJobOrder,
    updateJobOrder,
    deleteJobOrder,
    refresh: loadJobOrders,
  };
}

// Combined hook for dashboard statistics
export function useDashboardStats() {
  const { repairOrders } = useRepairOrders();
  const { jobOrders } = useJobOrders();

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

  return {
    stats,
    repairOrders,
    jobOrders,
    upcomingDeadlines: getUpcomingDeadlines(),
  };
}