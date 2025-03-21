// src/app/scan/page.tsx - Updated to include link to O365 scan
import Link from 'next/link';
import React from 'react';

export default function ScanPage() {
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

      {/* Scan Configuration Content */}
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scan Configuration</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                    Select Scan Type
                  </h2>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Office 365 Scan Card */}
                    <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Office 365 Scan</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                        Scan your Office 365 tenant for cryptojacking indicators in Exchange, SharePoint, OneDrive, and Teams.
                      </p>
                      <div className="mt-4">
                        <Link href="/scan/o365" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800">
                          Configure O365 Scan
                        </Link>
                      </div>
                    </div>
                    
                    {/* Local System Scan Card */}
                    <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        </div>
                        <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Local System Scan</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                        Scan your local system for cryptojacking indicators in files, processes, and scheduled tasks.
                      </p>
                      <div className="mt-4">
                        <Link href="/scan" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800">
                          Configure Local Scan
                        </Link>
                      </div>
                    </div>
                    
                    {/* Cloud Services Scan Card */}
                    <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                        </div>
                        <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Cloud Services Scan</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                        Scan your AWS, Azure, or Google Cloud resources for cryptojacking indicators.
                      </p>
                      <div className="mt-4">
                        <Link href="/scan" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-700 dark:hover:bg-purple-800">
                          Configure Cloud Scan
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">About Scanning</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      CryptoDetector scans your selected environment for indicators of cryptojacking activity. 
                      The scan analyzes scripts, files, and configurations for patterns associated with cryptocurrency mining.
                      Select the appropriate scan type above to begin configuring your scan.
                    </p>
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
