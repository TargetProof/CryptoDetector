# O365 Scanning Implementation Documentation

## Overview

This document provides comprehensive documentation for the Office 365 scanning functionality implemented in the CryptoDetector project. The implementation allows users to scan their O365 tenant for cryptojacking indicators across various services including Exchange Online, SharePoint, OneDrive, and Teams.

## Architecture

The O365 scanning functionality follows a modular architecture with clear separation of concerns:

### Backend Components

1. **Authentication Module** (`src/lib/o365/auth.ts`)
   - Handles authentication with Microsoft Graph API
   - Provides interfaces for authentication options and results
   - Includes error handling for authentication failures

2. **Scanner Module** (`src/lib/o365/scanner.ts`)
   - Implements the core scanning logic
   - Contains cryptomining detection patterns
   - Provides content analysis functionality
   - Handles filtering based on scan options

3. **Type Definitions** (`src/lib/o365/types.ts`)
   - Defines TypeScript interfaces for all components
   - Ensures type safety throughout the application
   - Improves code organization and maintainability

4. **API Integration** (`src/lib/o365/index.ts`)
   - Exports all modules for easy importing
   - Provides a convenience function for running scans
   - Handles error cases and ensures consistent response format

5. **API Endpoint** (`src/app/api/o365scan/route.ts`)
   - Implements the Next.js API route for handling scan requests
   - Validates request parameters
   - Connects frontend requests to backend scanning logic

### Frontend Components

1. **O365 Scan Page** (`src/app/scan/o365/page.tsx`)
   - Provides a user interface for configuring and running scans
   - Includes form controls for tenant information and scan options
   - Displays scan results with severity indicators and match details
   - Handles loading states and error conditions

2. **Main Scan Page** (`src/app/scan/page.tsx`)
   - Updated to include links to the O365 scanning functionality
   - Provides a card-based interface for selecting scan types
   - Includes descriptive information about each scan type

## Implementation Details

### Authentication

The authentication module uses the Microsoft Graph API for authenticating with Office 365. For development and testing purposes, a mock authentication implementation is provided that simulates successful authentication without requiring actual credentials.

In production, the commented code in the authentication module should be uncommented to use real authentication with the Microsoft Graph API.

```typescript
// Real authentication implementation (currently commented)
const tokenEndpoint = `https://login.microsoftonline.com/${options.tenantId}/oauth2/v2.0/token`;
const scope = options.scope || 'https://graph.microsoft.com/.default';

const response = await axios.post(tokenEndpoint, 
  new URLSearchParams({
    client_id: options.clientId,
    scope: scope,
    client_secret: options.clientSecret,
    grant_type: 'client_credentials'
  }) ,
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);

return {
  authenticated: true,
  token: response.data.access_token,
  expiresAt: Date.now() + (response.data.expires_in * 1000)
};
