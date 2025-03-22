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

// Your scanO365Tenant function remains unchanged
export async function scanO365Tenant(
  authResult: AuthResult,
  tenant: string,
  options: O365ScanOptions = {}
): Promise<O365ScanResult> {
  // Rest of your function remains the same
