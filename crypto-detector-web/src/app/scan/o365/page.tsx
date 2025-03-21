'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { O365ScanOptions, O365ScanResult } from '@/lib/o365/types';

export default function O365ScanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<O365ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [tenantId, setTenantId] = useState('targetproof.com');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [scanOptions, setScanOptions] = useState<O365ScanOptions>({
    includeEmail: true,
    includeSharePoint: true,
    includeOneDrive: true,
    includeTeams: true,
    scanDepth: 'standard',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setScanResult(null);
    
    try {
      const response = await fetch('/api/o365scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          clientId: clientId || undefined,
          clientSecret: clientSecret || undefined,
          scanOptions,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to run scan');
      }
      
      setScanResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value, type } = e.target;
    
    setScanOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setScanOptions(prev => ({
      ...prev,
      [name]: value,
    }));
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
                <Link href="/scan" className="border-blue-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Scan
                </Link>
                <Link href="/results" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Results
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* O365 Scan Configuration Content */}
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Office 365 Scan</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Scan your Office 365 tenant for cryptojacking indicators
            </p>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Tenant Configuration Section */}
                      <div>
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Tenant Configuration</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Enter your Office 365 tenant information
                          </p>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-4">
                            <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tenant ID or Domain
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="tenantId"
                                id="tenantId"
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="contoso.com or tenant-id"
                                required
                              />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Your Office 365 tenant domain or ID
                            </p>
                          </div>

                          <div className="sm:col-span-4">
                            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Client ID (Required)
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="clientId"
                                id="clientId"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Azure AD Application ID"
                                required
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-4">
                            <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Client Secret (Required)
                            </label>
                            <div className="mt-1">
                              <input
                                type="password"
                                name="clientSecret"
                                id="clientSecret"
                                value={clientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Azure AD Application Secret"
                                required
                              />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Enter the Client ID and Secret from your Azure AD application registration
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Scan Options Section */}
                      <div className="pt-8">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Scan Options</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Configure what to include in the scan
                          </p>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <fieldset>
                              <legend className="sr-only">Services to scan</legend>
                              <div className="space-y-4">
                                <div className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="includeEmail"
                                      name="includeEmail"
                                      type="checkbox"
                                      checked={scanOptions.includeEmail}
                                      onChange={handleOptionChange}
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="includeEmail" className="font-medium text-gray-700 dark:text-gray-300">Exchange Online</label>
                                    <p className="text-gray-500 dark:text-gray-400">Scan emails and attachments for cryptomining indicators</p>
                                  </div>
                                </div>

                                <div className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="includeSharePoint"
                                      name="includeSharePoint"
                                      type="checkbox"
                                      checked={scanOptions.includeSharePoint}
                                      onChange={handleOptionChange}
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="includeSharePoint" className="font-medium text-gray-700 dark:text-gray-300">SharePoint Online</label>
                                    <p className="text-gray-500 dark:text-gray-400">Scan SharePoint sites and documents</p>
                                  </div>
                                </div>

                                <div className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="includeOneDrive"
                                      name="includeOneDrive"
                                      type="checkbox"
                                      checked={scanOptions.includeOneDrive}
                                      onChange={handleOptionChange}
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="includeOneDrive" className="font-medium text-gray-700 dark:text-gray-300">OneDrive</label>
                                    <p className="text-gray-500 dark:text-gray-400">Scan OneDrive files and folders</p>
                                  </div>
                                </div>

                                <div className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="includeTeams"
                                      name="includeTeams"
                                      type="checkbox"
                                      checked={scanOptions.includeTeams}
                                      onChange={handleOptionChange}
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="includeTeams" className="font-medium text-gray-700 dark:text-gray-300">Teams</label>
                                    <p className="text-gray-500 dark:text-gray-400">Scan Teams chats and shared files</p>
                                  </div>
                                </div>
                              </div>
                            </fieldset>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="scanDepth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Scan Depth
                            </label>
                            <div className="mt-1">
                              <select
                                id="scanDepth"
                                name="scanDepth"
                                value={scanOptions.scanDepth}
                                onChange={handleSelectChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              >
                                <option value="light">Light (Faster)</option>
                                <option value="standard">Standard</option>
                                <option value="deep">Deep (Thorough)</option>
                              </select>
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Deeper scans take longer but are more thorough
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setScanOptions({
                              includeEmail: true,
                              includeSharePoint: true,
                              includeOneDrive: true,
                              includeTeams: true,
                              scanDepth: 'standard',
                            });
                            setTenantId('targetproof.com');
                            setClientId('');
                            setClientSecret('');
                          }}
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                            isLoading 
                              ? 'bg-blue-400 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          } dark:bg-blue-700 dark:hover:bg-blue-800`}
                        >
                          {isLoading ? 'Scanning...' : 'Start Scan'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Scan Results Section */}
            {error && (
              <div className="mt-8 px-4 sm:px-0">
                <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {scanResult && (
              <div className="mt-8 px-4 sm:px-0">
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Scan Results
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                      Scan ID: {scanResult.scanId}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200 sm:dark:divide-gray-700">
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Tenant
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {scanResult.tenant}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Timestamp
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {new Date(scanResult.timestamp).toLocaleString()}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            scanResult.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                              : scanResult.status === 'failed'
                                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`}>
                            {scanResult.status.toUpperCase()}
                          </span>
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Summary
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          <div className="flex space-x-4">
                            <div>
                              <span className="block font-medium">Total</span>
                              <span className="block text-lg">{scanResult.summary.total}</span>
                            </div>
                            <div>
                              <span className="block font-medium text-red-600 dark:text-red-400">High</span>
                              <span className="block text-lg">{scanResult.summary.high}</span>
                            </div>
                            <div>
                              <span className="block font-medium text-yellow-600 dark:text-yellow-400">Medium</span>
                              <span className="block text-lg">{scanResult.summary.medium}</span>
                            </div>
                            <div>
                              <span className="block font-medium text-blue-600 dark:text-blue-400">Low</span>
                              <span className="block text-lg">{scanResult.summary.low}</span>
                            </div>
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Detections List */}
                {scanResult.detections.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                      Detections
                    </h3>
                    <div className="space-y-4">
                      {scanResult.detections.map((detection) => (
                        <div key={detection.id} className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <div>
                              <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                                <span className={`mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  detection.severity === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                                  detection.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                }`}>
                                  {detection.severity}
                                </span>
                                {detection.source} - {detection.itemType}
                              </h4>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Score: {detection.score}
                              </span>
                            </div>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <p className="font-medium mb-2">Content:</p>
                              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                                <p className="whitespace-pre-wrap font-mono text-sm">{detection.content}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <p className="font-medium text-sm text-gray-900 dark:text-white mb-2">Matches:</p>
                              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {detection.matches.map((match, idx) => (
                                  <li key={idx} className="py-2 flex justify-between">
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
