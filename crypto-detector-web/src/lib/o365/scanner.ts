// src/lib/o365/scanner.ts
import { AuthResult } from './auth';

// Interface for scan options
export interface O365ScanOptions {
  includeEmail?: boolean;
  includeSharePoint?: boolean;
  includeOneDrive?: boolean;
  includeTeams?: boolean;
  maxItems?: number;
  scanDepth?: 'light' | 'standard' | 'deep';
  fileTypes?: string[];
}

// Interface for scan result
export interface O365ScanResult {
  scanId: string;
  timestamp: string;
  tenant: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  detections: Array<{
    id: number;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    source: string;
    itemType: string;
    score: number;
    content: string;
    matches: Array<{
      match: string;
      category: string;
      weight: number;
    }>;
  }>;
  error?: string;
}

// Cryptomining patterns to detect
const CRYPTO_PATTERNS = [
  { pattern: /coinminer|cryptominer|monerominer/i, category: 'Mining Software', weight: 9 },
  { pattern: /coinhive|cryptoloot|deepminer|webminepool/i, category: 'Browser Mining', weight: 10 },
  { pattern: /stratum\+tcp|pool\.supportxmr|nanopool|minexmr/i, category: 'Mining Pool', weight: 8 },
  { pattern: /cryptonight|ethash|equihash|randomx/i, category: 'Mining Algorithm', weight: 7 },
  { pattern: /monero|xmr|eth wallet|btc wallet/i, category: 'Cryptocurrency', weight: 6 },
  { pattern: /WinRing0|GPU mining/i, category: 'Mining Hardware Access', weight: 8 },
  { pattern: /hashrate|throttle|stealth mining/i, category: 'Mining Behavior', weight: 7 },
  { pattern: /base64 -d|eval\(atob|fromCharCode/i, category: 'Obfuscation', weight: 8 },
  { pattern: /powershell -enc|powershell -e|hidden -w/i, category: 'Suspicious Execution', weight: 9 },
  { pattern: /schtasks|persistence|startup folder/i, category: 'Persistence Mechanism', weight: 7 }
];

/**
 * Scan O365 tenant for cryptomining indicators
 * This is a mock implementation for demonstration purposes
 */
export async function scanO365Tenant(
  authResult: AuthResult,
  tenant: string,
  options: O365ScanOptions = {}
): Promise<O365ScanResult> {
  // Validate authentication
  if (!authResult.authenticated || !authResult.token) {
    return {
      scanId: `failed-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tenant,
      status: 'failed',
      summary: { total: 0, high: 0, medium: 0, low: 0 },
      detections: [],
      error: 'Authentication required'
    };
  }

  // In a real implementation, this would use Microsoft Graph API to scan various O365 services
  console.log(`[Mock] Scanning O365 tenant: ${tenant} with options:`, options);
  
  // Mock scan delay to simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock scan results
  const mockDetections = [
    {
      id: 1,
      severity: 'HIGH' as const,
      source: 'Exchange Online',
      itemType: 'Email Attachment',
      score: 92,
      content: 'Suspicious PowerShell script with obfuscated mining commands',
      matches: [
        { match: 'Invoke-Expression', category: 'PowerShell Execution', weight: 7 },
        { match: 'base64 encoded content', category: 'Obfuscation', weight: 8 }
      ]
    },
    {
      id: 2,
      severity: 'HIGH' as const,
      source: 'SharePoint Online',
      itemType: 'Shared Document',
      score: 88,
      content: 'JavaScript file with hidden cryptomining code',
      matches: [
        { match: 'CoinHive', category: 'Mining Service', weight: 10 },
        { match: 'WebAssembly.instantiate', category: 'Browser Mining', weight: 6 }
      ]
    },
    {
      id: 3,
      severity: 'MEDIUM' as const,
      source: 'OneDrive',
      itemType: 'Script File',
      score: 65,
      content: 'Batch file with suspicious network connections',
      matches: [
        { match: 'pool.minexmr.com', category: 'Mining Pool', weight: 8 }
      ]
    },
    {
      id: 4,
      severity: 'MEDIUM' as const,
      source: 'Teams',
      itemType: 'Shared Link',
      score: 58,
      content: 'Link to suspicious mining pool registration',
      matches: [
        { match: 'cryptopool.eu', category: 'Mining Pool', weight: 7 }
      ]
    },
    {
      id: 5,
      severity: 'LOW' as const,
      source: 'Exchange Online',
      itemType: 'Email Body',
      score: 35,
      content: 'Email discussing cryptocurrency mining',
      matches: [
        { match: 'mining rig', category: 'Mining Hardware', weight: 4 }
      ]
    }
  ];
  
  // Filter detections based on options
  let filteredDetections = [...mockDetections];
  
  if (options.includeEmail === false) {
    filteredDetections = filteredDetections.filter(d => !d.source.includes('Exchange'));
  }
  
  if (options.includeSharePoint === false) {
    filteredDetections = filteredDetections.filter(d => !d.source.includes('SharePoint'));
  }
  
  if (options.includeOneDrive === false) {
    filteredDetections = filteredDetections.filter(d => !d.source.includes('OneDrive'));
  }
  
  if (options.includeTeams === false) {
    filteredDetections = filteredDetections.filter(d => !d.source.includes('Teams'));
  }
  
  // Calculate summary
  const summary = {
    total: filteredDetections.length,
    high: filteredDetections.filter(d => d.severity === 'HIGH').length,
    medium: filteredDetections.filter(d => d.severity === 'MEDIUM').length,
    low: filteredDetections.filter(d => d.severity === 'LOW').length
  };
  
  return {
    scanId: `o365-scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    tenant,
    status: 'completed',
    summary,
    detections: filteredDetections
  };
}

/**
 * Analyze content for cryptomining indicators
 * This can be used to scan individual files or content
 */
export function analyzeCryptoMiningIndicators(content: string): {
  score: number;
  matches: Array<{ match: string; category: string; weight: number }>;
} {
  const matches: Array<{ match: string; category: string; weight: number }> = [];
  
  // Check content against known patterns
  for (const { pattern, category, weight } of CRYPTO_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      matches.push({
        match: match[0],
        category,
        weight
      });
    }
  }
  
  // Calculate overall score (0-100)
  const totalWeight = matches.reduce((sum, m) => sum + m.weight, 0);
  const score = Math.min(Math.round((totalWeight / 30) * 100), 100); // Normalize to 0-100
  
  return { score, matches };
}
