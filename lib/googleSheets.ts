// Google Sheets API integration with automatic read/write capabilities
// This uses the Google Sheets API v4 to read/write data automatically

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  range: string;
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  // Read data from Google Sheets
  async readData(): Promise<any[][]> {
    try {
      const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${this.config.range}?key=${this.config.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google Sheets API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error('Error reading from Google Sheets:', error);
      throw error;
    }
  }

  // Write data to Google Sheets (append new row)
  async appendData(values: any[]): Promise<void> {
    try {
      const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${this.config.range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&key=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [values],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google Sheets API error: ${response.status} - ${errorData.error?.message || 'Failed to write data'}`);
      }
      
      console.log('Data successfully written to Google Sheets');
    } catch (error) {
      console.error('Error writing to Google Sheets:', error);
      throw error;
    }
  }

  // Update existing row in Google Sheets
  async updateData(range: string, values: any[]): Promise<void> {
    try {
      const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${range}?valueInputOption=RAW&key=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [values],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google Sheets API error: ${response.status} - ${errorData.error?.message || 'Failed to update data'}`);
      }
      
      console.log('Data successfully updated in Google Sheets');
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      throw error;
    }
  }

  // Convert sheet rows to repair orders
  parseRepairOrders(rows: any[][]): any[] {
    if (rows.length === 0) return [];
    
    // Skip header row
    const dataRows = rows.slice(1);
    
    return dataRows.map((row, index) => ({
      id: row[0] || `repair-${Date.now()}-${index}`,
      customerName: row[1] || '',
      phoneNumber: row[2] || '',
      damage: row[3] || '',
      price: parseFloat(row[4]) || 0,
      deadline: row[5] || new Date().toISOString().split('T')[0],
      status: row[6] || 'pending',
      createdAt: row[7] || new Date().toISOString(),
    }));
  }

  // Convert sheet rows to job orders
  parseJobOrders(rows: any[][]): any[] {
    if (rows.length === 0) return [];
    
    // Skip header row
    const dataRows = rows.slice(1);
    
    return dataRows.map((row, index) => ({
      id: row[0] || `job-${Date.now()}-${index}`,
      customerName: row[1] || '',
      phoneNumber: row[2] || '',
      description: row[3] || '',
      quantity: parseInt(row[4]) || 1,
      price: parseFloat(row[5]) || 0,
      deadline: row[6] || new Date().toISOString().split('T')[0],
      status: row[7] || 'pending',
      createdAt: row[8] || new Date().toISOString(),
    }));
  }

  // Convert repair order to sheet row
  repairOrderToSheetRow(order: any): any[] {
    return [
      order.id,
      order.customerName,
      order.phoneNumber,
      order.damage,
      order.price,
      order.deadline,
      order.status,
      order.createdAt,
    ];
  }

  // Convert job order to sheet row
  jobOrderToSheetRow(order: any): any[] {
    return [
      order.id,
      order.customerName,
      order.phoneNumber,
      order.description,
      order.quantity,
      order.price,
      order.deadline,
      order.status,
      order.createdAt,
    ];
  }
}

// Auto-configured Google Sheets service using environment variables
export class AutoGoogleSheetsService {
  private repairService: GoogleSheetsService | null = null;
  private jobService: GoogleSheetsService | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID;
    const repairRange = process.env.NEXT_PUBLIC_GOOGLE_REPAIRS_RANGE || 'Repairs!A:H';
    const jobRange = process.env.NEXT_PUBLIC_GOOGLE_JOBS_RANGE || 'Jobs!A:I';

    if (apiKey && spreadsheetId) {
      this.repairService = new GoogleSheetsService({
        spreadsheetId,
        apiKey,
        range: repairRange,
      });

      this.jobService = new GoogleSheetsService({
        spreadsheetId,
        apiKey,
        range: jobRange,
      });

      this.isConfigured = true;
      console.log('Google Sheets auto-integration configured successfully');
    } else {
      console.warn('Google Sheets environment variables not configured');
    }
  }

  // Check if the service is properly configured
  get configured(): boolean {
    return this.isConfigured;
  }

  // Auto-save repair order to Google Sheets
  async saveRepairOrder(order: any): Promise<void> {
    if (!this.repairService || !this.isConfigured) {
      console.warn('Google Sheets not configured - skipping auto-save');
      return;
    }

    try {
      const row = this.repairService.repairOrderToSheetRow(order);
      await this.repairService.appendData(row);
      console.log('Repair order automatically saved to Google Sheets');
    } catch (error) {
      console.error('Failed to auto-save repair order to Google Sheets:', error);
      // Don't throw error - let the app continue working even if sheets sync fails
    }
  }

  // Auto-save job order to Google Sheets
  async saveJobOrder(order: any): Promise<void> {
    if (!this.jobService || !this.isConfigured) {
      console.warn('Google Sheets not configured - skipping auto-save');
      return;
    }

    try {
      const row = this.jobService.jobOrderToSheetRow(order);
      await this.jobService.appendData(row);
      console.log('Job order automatically saved to Google Sheets');
    } catch (error) {
      console.error('Failed to auto-save job order to Google Sheets:', error);
      // Don't throw error - let the app continue working even if sheets sync fails
    }
  }

  // Load all repair orders from Google Sheets
  async loadRepairOrders(): Promise<any[]> {
    if (!this.repairService || !this.isConfigured) {
      return [];
    }

    try {
      const rows = await this.repairService.readData();
      return this.repairService.parseRepairOrders(rows);
    } catch (error) {
      console.error('Failed to load repair orders from Google Sheets:', error);
      return [];
    }
  }

  // Load all job orders from Google Sheets
  async loadJobOrders(): Promise<any[]> {
    if (!this.jobService || !this.isConfigured) {
      return [];
    }

    try {
      const rows = await this.jobService.readData();
      return this.jobService.parseJobOrders(rows);
    } catch (error) {
      console.error('Failed to load job orders from Google Sheets:', error);
      return [];
    }
  }

  // Update repair order in Google Sheets
  async updateRepairOrder(order: any, rowIndex: number): Promise<void> {
    if (!this.repairService || !this.isConfigured) {
      return;
    }

    try {
      const row = this.repairService.repairOrderToSheetRow(order);
      const range = `Repairs!A${rowIndex + 2}:H${rowIndex + 2}`; // +2 because of header row and 1-based indexing
      await this.repairService.updateData(range, row);
      console.log('Repair order automatically updated in Google Sheets');
    } catch (error) {
      console.error('Failed to auto-update repair order in Google Sheets:', error);
    }
  }

  // Update job order in Google Sheets
  async updateJobOrder(order: any, rowIndex: number): Promise<void> {
    if (!this.jobService || !this.isConfigured) {
      return;
    }

    try {
      const row = this.jobService.jobOrderToSheetRow(order);
      const range = `Jobs!A${rowIndex + 2}:I${rowIndex + 2}`; // +2 because of header row and 1-based indexing
      await this.jobService.updateData(range, row);
      console.log('Job order automatically updated in Google Sheets');
    } catch (error) {
      console.error('Failed to auto-update job order in Google Sheets:', error);
    }
  }
}

// Global instance for auto-sync
export const autoSheetsService = new AutoGoogleSheetsService();

// Utility function to create Google Sheets service
export function createGoogleSheetsService(
  spreadsheetId: string,
  apiKey: string,
  range: string
): GoogleSheetsService {
  return new GoogleSheetsService({
    spreadsheetId,
    apiKey,
    range,
  });
}

// Helper to get spreadsheet ID from Google Sheets URL
export function extractSpreadsheetId(url: string): string {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : '';
}