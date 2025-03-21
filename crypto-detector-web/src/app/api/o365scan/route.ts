// src/app/api/o365scan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateO365 } from '@/lib/o365/auth';
import { scanO365Tenant } from '@/lib/o365/scanner';

// Add this line to make the route dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { tenantId, clientId, clientSecret, scanOptions } = body;
    
    // Validate required parameters
    if (!tenantId || !clientId || !clientSecret) {
     return NextResponse.json(
       { error: 'Missing required authentication parameters' },
       { status: 400 }
      );
    }
    
    console.log(`Received scan request for tenant: ${tenantId}`);
    
    // Authenticate with O365 using real credentials
    const authResult = await authenticateO365({
     tenantId,
     clientId,
     clientSecret,
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
      scanOptions || {}
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
