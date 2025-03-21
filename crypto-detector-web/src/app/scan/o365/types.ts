export interface O365ScanOptions {
    includeEmail: boolean;
    includeSharePoint: boolean;
    includeOneDrive: boolean;
    includeTeams: boolean;
    scanDepth: 'light' | 'standard' | 'deep';
  }
  
  export interface O365ScanResult {
    scanId: string;
    tenant: string;
    timestamp: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    summary: {
      total: number;
      high: number;
      medium: number;
      low: number;
    };
    detections: Detection[];
  }
  
  interface Detection {
    id: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    source: string;
    itemType: string;
    score: number;
    content: string;
    matches: {
      match: string;
      category: string;
      weight: number;
    }[];
  }
  