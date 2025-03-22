// src/lib/o365/index.ts
export * from './types';
export * from './auth';
export * from './scanner';


// Import from types.ts only
import { O365ScanOptions, O365ScanResult } from './types';
import { authenticateO365 } from './auth';
import { scanO365Tenant } from './scanner';

// Export a convenience function for running a scan
import { authenticateO365 } from './auth';
import { scanO365Tenant, O365ScanOptions } from './scanner';
import { O365ScanResult, O365ScanConfig } from './types';

/**
 * Run a complete O365 scan with a single function call
 * This is a convenience wrapper around the authentication and scanning functions
 */
export async function runO365Scan(config: O365ScanConfig): Promise<O365ScanResult> {
  try {
    // Authenticate
    const authResult = await authenticateO365({
      tenantId: config.tenantId,
      clientId: config.clientId || 'demo-client-id',
      clientSecret: config.clientSecret || 'demo-client-secret',
      scope: 'https://graph.microsoft.com/.default'
    }) ;
    
    if (!authResult.authenticated) {
      return {
        scanId: `failed-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tenant: config.tenantId,
        status: 'failed',
        summary: { total: 0, high: 0, medium: 0, low: 0 },
        detections: [],
        error: authResult.error || 'Authentication failed'
      };
    }
    
    // Run the scan
    return await scanO365Tenant(
      authResult,
      config.tenantId,
      config.scanOptions
    );
  } catch (error) {
    // Handle any unexpected errors
    return {
      scanId: `error-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tenant: config.tenantId,
      status: 'failed',
      summary: { total: 0, high: 0, medium: 0, low: 0 },
      detections: [],
      error: error instanceof Error ? error.message : 'Unknown error during scan'
    };
  }
}
