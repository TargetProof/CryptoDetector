// src/lib/scanService.ts
import { ScanRequest, ScanResults, ApiResponse } from './types';

export async function startScan(scanRequest: ScanRequest): Promise<ApiResponse<ScanResults>> {
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scanRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error starting scan:', error);
    return {
      success: false,
      message: 'Failed to start scan',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getScanResults(scanId: string): Promise<ApiResponse<ScanResults>> {
  try {
    const response = await fetch(`/api/results?scanId=${scanId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching scan results:', error);
    return {
      success: false,
      message: 'Failed to fetch scan results',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function generateReport(scanId: string, format: 'pdf' | 'csv'): Promise<ApiResponse<string>> {
  try {
    const response = await fetch(`/api/report?scanId=${scanId}&format=${format}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      message: 'Failed to generate report',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getScanHistory(): Promise<ApiResponse<ScanResults[]>> {
  try {
    const response = await fetch('/api/history');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching scan history:', error);
    return {
      success: false,
      message: 'Failed to fetch scan history',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
