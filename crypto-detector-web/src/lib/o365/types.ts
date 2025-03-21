// src/lib/o365/types.ts
export interface O365ScanConfig {
    tenantId: string;
    clientId?: string;
    clientSecret?: string;
    scanOptions: O365ScanOptions;
  }
  
  export interface O365ScanOptions {
    includeEmail?: boolean;
    includeSharePoint?: boolean;
    includeOneDrive?: boolean;
    includeTeams?: boolean;
    maxItems?: number;
    scanDepth?: 'light' | 'standard' | 'deep';
    fileTypes?: string[];
  }
  
  export interface ScanMatch {
    match: string;
    category: string;
    weight: number;
  }
  
  export interface ScanDetection {
    id: number;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    source: string;
    itemType: string;
    score: number;
    content: string;
    matches: ScanMatch[];
  }
  
  export interface ScanSummary {
    total: number;
    high: number;
    medium: number;
    low: number;
  }
  
  export interface O365ScanResult {
    scanId: string;
    timestamp: string;
    tenant: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    summary: ScanSummary;
    detections: ScanDetection[];
    error?: string;
  }
  