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
                  <form className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Target Selection Section */}
                      <div>
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Target Selection</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Select the environments you want to scan for cryptojacking activity.
                          </p>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <fieldset>
                              <legend className="sr-only">Target Selection</legend>
                              <div className="space-y-4">
                                <div className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="local-system"
                                      name="target-selection"
                                      type="checkbox"
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="local-system" className="font-medium text-gray-700 dark:text-gray-300">Local System</label>
                                    <p className="text-gray-500 dark:text-gray-400">Scan the local system for cryptojacking indicators.</p>
                                  </div>
                                </div>

                                <div className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="aws-cloud"
                                      name="target-selection"
                                      type="checkbox"
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="aws-cloud" className="font-medium text-gray-700 dark:text-gray-300">AWS Cloud</label>
                                    <p className="text-gray-500 dark:text-gray-400">Scan AWS EC2, Lambda, ECS, and other services.</p>
                                  </div>
                                </div>

                                <div className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="google-cloud"
                                      name="target-selection"
                                      type="checkbox"
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="google-cloud" className="font-medium text-gray-700 dark:text-gray-300">Google Cloud</label>
                                    <p className="text-gray-500 dark:text-gray-400">Scan GCP Compute Engine, Cloud Functions, and other services.</p>
                                  </div>
                                </div>

                                <div className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="azure"
                                      name="target-selection"
                                      type="checkbox"
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="azure" className="font-medium text-gray-700 dark:text-gray-300">Azure</label>
                                    <p className="text-gray-500 dark:text-gray-400">Scan Azure VMs, Functions, and other services.</p>
                                  </div>
                                </div>

                                <div className="relative flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="custom-directory"
                                      name="target-selection"
                                      type="checkbox"
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="custom-directory" className="font-medium text-gray-700 dark:text-gray-300">Custom Directory</label>
                                    <p className="text-gray-500 dark:text-gray-400">Scan a specific directory for cryptojacking indicators.</p>
                                    <div className="mt-2">
                                      <input
                                        type="text"
                                        name="custom-directory-path"
                                        id="custom-directory-path"
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="/path/to/directory"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </fieldset>
                          </div>
                        </div>
                      </div>

                      {/* Scan Options Section */}
                      <div className="pt-8">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Scan Options</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Configure how the scan should be performed.
                          </p>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="sensitivity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Sensitivity
                            </label>
                            <div className="mt-1">
                              <select
                                id="sensitivity"
                                name="sensitivity"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                              </select>
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Higher sensitivity may result in more false positives.
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="output-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Output Format
                            </label>
                            <div className="mt-1">
                              <select
                                id="output-format"
                                name="output-format"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              >
                                <option>Text</option>
                                <option>JSON</option>
                                <option>CSV</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <div className="relative flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="decode-base64"
                                  name="decode-base64"
                                  type="checkbox"
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                  defaultChecked
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="decode-base64" className="font-medium text-gray-700 dark:text-gray-300">Decode Base64 Content</label>
                                <p className="text-gray-500 dark:text-gray-400">Automatically detect and decode base64-encoded content to uncover obfuscated commands.</p>
                              </div>
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <div className="relative flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="performance-report"
                                  name="performance-report"
                                  type="checkbox"
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="performance-report" className="font-medium text-gray-700 dark:text-gray-300">Generate Performance Report</label>
                                <p className="text-gray-500 dark:text-gray-400">Include detailed performance metrics in the scan results.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Options Section */}
                      <div className="pt-8">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Advanced Options</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Fine-tune the scan parameters for advanced users.
                          </p>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="max-workers" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Max Worker Threads
                            </label>
                            <div className="mt-1">
                              <input
                                type="number"
                                name="max-workers"
                                id="max-workers"
                                min="1"
                                max="32"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Auto"
                              />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Leave empty for auto-detection based on CPU cores.
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="log-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Log Level
                            </label>
                            <div className="mt-1">
                              <select
                                id="log-level"
                                name="log-level"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              >
                                <option>Error</option>
                                <option>Warning</option>
                                <option>Info</option>
                                <option>Debug</option>
                                <option>Verbose</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                          Start Scan
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
