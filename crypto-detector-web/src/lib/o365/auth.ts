// src/lib/o365/auth.ts
import axios from 'axios';

// Interface for authentication options
export interface O365AuthOptions {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
}

// Interface for authentication result
export interface AuthResult {
  authenticated: boolean;
  token?: string;
  error?: string;
  expiresAt?: number;
}

/**
 * Authenticate with Microsoft Graph API using client credentials flow
 * In a production environment, this should be done server-side only
 */
export async function authenticateO365(options: O365AuthOptions): Promise<AuthResult> {
  try {
    // Validate required parameters
    if (!options.tenantId || !options.clientId || !options.clientSecret) {
      return {
        authenticated: false,
        error: 'Missing required authentication parameters'
      };
    }

    // Real authentication implementation with Microsoft Graph API
    const tokenEndpoint = `https://login.microsoftonline.com/${options.tenantId}/oauth2/v2.0/token`;
    const scope = options.scope || 'https://graph.microsoft.com/.default';
    
    console.log(`Authenticating with tenant: ${options.tenantId}`) ;
    
    const response = await axios.post(tokenEndpoint, 
      new URLSearchParams({
        client_id: options.clientId,
        scope: scope,
        client_secret: options.clientSecret,
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('Authentication successful');
    
    return {
      authenticated: true,
      token: response.data.access_token,
      expiresAt: Date.now() + (response.data.expires_in * 1000)
    };
    
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown authentication error'
    };
  }
}
