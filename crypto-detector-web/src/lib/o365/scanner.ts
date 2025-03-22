import axios from 'axios';
import { O365ScanOptions, O365ScanResult } from './types';
import { AuthResult } from './auth';

// Comprehensive implementation for crypto mining detection
function analyzeCryptoMiningIndicators(content: string): { score: number; matches: any[] } {
  // Common crypto mining indicators
  const indicators = [
    // Mining software names
    { pattern: /xmrig|cpuminer|claymore|ethminer|phoenixminer/i, category: 'MinerSoftware', weight: 8 },
    { pattern: /monero|xmr miner|cryptonight/i, category: 'MinerSoftware', weight: 7 },
    
    // Mining protocols and pools
    { pattern: /stratum\+tcp|pool\.supportxmr\.com|pool\.minexmr\.com/i, category: 'MiningPool', weight: 9 },
    { pattern: /nanopool|ethermine|f2pool|nicehash/i, category: 'MiningPool', weight: 8 },
    
    // Browser-based miners
    { pattern: /coinhive|cryptoloot|jsecoin|webminepool|cryptonoter/i, category: 'BrowserMiner', weight: 7 },
    
    // Wallet addresses
    { pattern: /4[0-9AB][123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{93}/i, category: 'MoneroWallet', weight: 6 },
    { pattern: /0x[a-fA-F0-9]{40}/i, category: 'EthereumWallet', weight: 5 },
    
    // Command line arguments
    { pattern: /--donate-level|--max-cpu-usage|--cpu-priority/i, category: 'MinerConfig', weight: 8 },
    
    // Configuration files
    { pattern: /config\.json.*"url"\s*:\s*"stratum/i, category: 'MinerConfig', weight: 9 },
    
    // Suspicious behaviors
    { pattern: /schtasks.*create.*powershell/i, category: 'SuspiciousBehavior', weight: 7 },
    { pattern: /hidden.*startup/i, category: 'SuspiciousBehavior', weight: 6 }
  ];
  
  const matches = [];
  let score = 0;
  
  // Check content against all indicators
  for (const { pattern, category, weight } of indicators) {
    if (pattern.test(content)) {
      const matchText = content.match(pattern)?.[0] || '';
      matches.push({
        match: matchText,
        category,
        weight
      });
      score += weight;
    }
  }
  
  // Normalize score to 0-100 range
  score = Math.min(100, score);
  
  return { score, matches };
}

// Function to scan O365 tenant
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
