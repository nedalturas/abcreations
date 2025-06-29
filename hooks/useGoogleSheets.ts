'use client';

import { useState, useEffect } from 'react';
import { GoogleSheetsService, createGoogleSheetsService } from '@/lib/googleSheets';
import { RepairOrder, JobOrder } from '@/types';
import { notifications } from '@mantine/notifications';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  repairRange: string;
  jobRange: string;
}

export function useGoogleSheets() {
  const [config, setConfig] = useState<GoogleSheetsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('googleSheetsConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error parsing Google Sheets config:', error);
      }
    }
  }, []);

  // Save config to localStorage
  const saveConfig = (newConfig: GoogleSheetsConfig) => {
    setConfig(newConfig);
    localStorage.setItem('googleSheetsConfig', JSON.stringify(newConfig));
    notifications.show({
      title: 'Configuration Saved',
      message: 'Google Sheets integration configured successfully',
      color: 'green',
    });
  };

  // Clear config
  const clearConfig = () => {
    setConfig(null);
    localStorage.removeItem('googleSheetsConfig');
    notifications.show({
      title: 'Configuration Cleared',
      message: 'Google Sheets integration disabled',
      color: 'blue',
    });
  };

  // Sync repair orders from Google Sheets
  const syncRepairOrders = async (): Promise<RepairOrder[]> => {
    if (!config) {
      throw new Error('Google Sheets not configured');
    }

    setIsLoading(true);
    try {
      const service = createGoogleSheetsService(
        config.spreadsheetId,
        config.apiKey,
        config.repairRange
      );

      const rows = await service.readData();
      const repairOrders = service.parseRepairOrders(rows);
      
      setLastSync(new Date());
      notifications.show({
        title: 'Sync Complete',
        message: `Synced ${repairOrders.length} repair orders from Google Sheets`,
        color: 'green',
      });

      return repairOrders;
    } catch (error) {
      console.error('Error syncing repair orders:', error);
      notifications.show({
        title: 'Sync Failed',
        message: 'Failed to sync repair orders from Google Sheets',
        color: 'red',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sync job orders from Google Sheets
  const syncJobOrders = async (): Promise<JobOrder[]> => {
    if (!config) {
      throw new Error('Google Sheets not configured');
    }

    setIsLoading(true);
    try {
      const service = createGoogleSheetsService(
        config.spreadsheetId,
        config.apiKey,
        config.jobRange
      );

      const rows = await service.readData();
      const jobOrders = service.parseJobOrders(rows);
      
      setLastSync(new Date());
      notifications.show({
        title: 'Sync Complete',
        message: `Synced ${jobOrders.length} job orders from Google Sheets`,
        color: 'green',
      });

      return jobOrders;
    } catch (error) {
      console.error('Error syncing job orders:', error);
      notifications.show({
        title: 'Sync Failed',
        message: 'Failed to sync job orders from Google Sheets',
        color: 'red',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sync both repair and job orders
  const syncAll = async (): Promise<{ repairOrders: RepairOrder[]; jobOrders: JobOrder[] }> => {
    if (!config) {
      throw new Error('Google Sheets not configured');
    }

    setIsLoading(true);
    try {
      const [repairOrders, jobOrders] = await Promise.all([
        syncRepairOrders(),
        syncJobOrders(),
      ]);

      return { repairOrders, jobOrders };
    } catch (error) {
      console.error('Error syncing all data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    config,
    isConfigured: !!config,
    isLoading,
    lastSync,
    saveConfig,
    clearConfig,
    syncRepairOrders,
    syncJobOrders,
    syncAll,
  };
}