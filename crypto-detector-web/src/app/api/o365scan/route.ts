// src/app/api/o365scan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateO365 } from '@/lib/o365/auth';
import { scanO365Tenant, O365ScanOptions } from '@/lib/o365/scanner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, clientId, clientSecret, scanOptions } = body;
    
    // Validate required parameters
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required parameter: tenantId' },
        { status: 400 }
      );
    }
    
    console.log(`Received scan request for tenant: ${tenantId}`);
    
    // Authenticate with O365
    const authResult = await authenticateO365({
      tenantId,
      clientId: clientId || 'demo-client-id',
      clientSecret: clientSecret || 'demo-client-secret',
      scope: 'https://graph.microsoft.com/.default'
    }) ;
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }
    
    // Perform the scan
    const scanResult = await scanO365Tenant(
      authResult,
      tenantId,
      scanOptions as O365ScanOptions || {}
    );
    
    // Return the scan results
    return NextResponse.json(scanResult);
  } catch (error) {
    console.error('Error processing O365 scan request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
