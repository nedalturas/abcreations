'use client';

import { useEffect } from 'react';
import { autoSheetsService } from '@/lib/googleSheets';
import { RepairOrder, JobOrder } from '@/types';

// Hook to automatically sync data with Google Sheets
export function useAutoSheets() {
  // Auto-save repair order to Google Sheets
  const saveRepairOrder = async (order: RepairOrder) => {
    if (autoSheetsService.configured) {
      try {
        await autoSheetsService.saveRepairOrder(order);
      } catch (error) {
        console.error('Auto-save to Google Sheets failed:', error);
      }
    }
  };

  // Auto-save job order to Google Sheets
  const saveJobOrder = async (order: JobOrder) => {
    if (autoSheetsService.configured) {
      try {
        await autoSheetsService.saveJobOrder(order);
      } catch (error) {
        console.error('Auto-save to Google Sheets failed:', error);
      }
    }
  };

  // Load all data from Google Sheets
  const loadAllData = async (): Promise<{ repairOrders: RepairOrder[]; jobOrders: JobOrder[] }> => {
    if (!autoSheetsService.configured) {
      return { repairOrders: [], jobOrders: [] };
    }

    try {
      const [repairOrders, jobOrders] = await Promise.all([
        autoSheetsService.loadRepairOrders(),
        autoSheetsService.loadJobOrders(),
      ]);

      return { repairOrders, jobOrders };
    } catch (error) {
      console.error('Failed to load data from Google Sheets:', error);
      return { repairOrders: [], jobOrders: [] };
    }
  };

  return {
    saveRepairOrder,
    saveJobOrder,
    loadAllData,
    isConfigured: autoSheetsService.configured,
  };
}