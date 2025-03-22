// Add these interface definitions at the top of scanner.ts
import axios from 'axios';

// Define or import AuthResult
interface AuthResult {
  authenticated: boolean;
  token?: string;
}

export interface O365ScanOptions {
  includeEmail?: boolean;
  includeSharePoint?: boolean;
  includeOneDrive?: boolean;
  includeTeams?: boolean;
  scanDepth?: string;
}

export interface O365ScanResult {
  scanId: string;
  timestamp: string;
  tenant: string;
  status: 'completed' | 'failed' | 'in-progress';
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  detections: any[];
  error?: string;
}

// Define the analyzeCryptoMiningIndicators function
function analyzeCryptoMiningIndicators(content: string) {
  // Mock implementation for now
  return {
    score: 0,
    matches: []
  };
}

// In src/lib/o365/scanner.ts, update the scanO365Tenant function:
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

  try {
    console.log(`Scanning O365 tenant: ${tenant} with options:`, options);
    
    // Initialize results array
    const detections: any[] = [];
    
    // Set up Microsoft Graph API client
    const graphClient = axios.create({
      baseURL: 'https://graph.microsoft.com/v1.0',
      headers: {
        Authorization: `Bearer ${authResult.token}`,
        'Content-Type': 'application/json'
      }
    }) ;
    
    // Scan Exchange Online emails if enabled
    if (options.includeEmail !== false) {
      try {
        // Get recent messages
        const messagesResponse = await graphClient.get('/me/messages?$top=50');
        const messages = messagesResponse.data.value;
        
        // Analyze each message
        for (const message of messages) {
          // Check content for cryptomining indicators
          const content = message.body.content || '';
          const analysis = analyzeCryptoMiningIndicators(content);
          
          if (analysis.matches.length > 0) {
            detections.push({
              id: detections.length + 1,
              severity: analysis.score > 70 ? 'HIGH' : analysis.score > 40 ? 'MEDIUM' : 'LOW',
              source: 'Exchange Online',
              itemType: 'Email',
              score: analysis.score,
              content: content.substring(0, 200) + '...',  // Truncate for display
              matches: analysis.matches
            });
          }
        }
      } catch (error) {
        console.error('Error scanning Exchange Online:', error);
      }
    }
    
    // Implement similar scanning for SharePoint, OneDrive, and Teams
    // ...
    
    // Calculate summary
    const summary = {
      total: detections.length,
      high: detections.filter(d => d.severity === 'HIGH').length,
      medium: detections.filter(d => d.severity === 'MEDIUM').length,
      low: detections.filter(d => d.severity === 'LOW').length
    };
    
    return {
      scanId: `o365-scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tenant,
      status: 'completed',
      summary,
      detections
    };
  } catch (error) {
    console.error('Error during O365 scan:', error);
    return {
      scanId: `error-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tenant,
      status: 'failed',
      summary: { total: 0, high: 0, medium: 0, low: 0 },
      detections: [],
      error: error instanceof Error ? error.message : 'Unknown error during scan'
    };
  }
}
