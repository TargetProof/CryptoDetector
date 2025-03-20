// src/lib/types.ts
export interface ScanTarget {
    localSystem: boolean;
    cloudProviders: {
      aws: boolean;
      gcp: boolean;
      azure: boolean;
    };
    customDirectory?: string;
  }
  
  export interface ScanOptions {
    detectionSensitivity: 'high' | 'medium' | 'low';
    maxWorkers: number;
    outputFormat: 'text' | 'json' | 'csv';
    base64Decoding: boolean;
  }
  
  export interface AdvancedOptions {
    scheduleScan: boolean;
    scheduleDate?: string;
    scheduleTime?: string;
    emailNotification: boolean;
    saveConfiguration: boolean;
    configurationName?: string;
  }
  
  export interface ScanRequest {
    targets: ScanTarget;
    options: ScanOptions;
    advancedOptions?: AdvancedOptions;
  }
  
  export interface Match {
    pattern: string;
    match: string;
    category: string;
    weight: number;
  }
  
  export interface Detection {
    id: number;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    source: string;
    itemType: string;
    content: string;
    matches: Match[];
    score: number;
  }
  
  export interface ScanSummary {
    total: number;
    high: number;
    medium: number;
    low: number;
  }
  
  export interface ScanResults {
    scanId: string;
    timestamp: string;
    duration: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    summary: ScanSummary;
    detections: Detection[];
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    error?: string;
    results?: T;
  }
  