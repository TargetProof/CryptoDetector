// src/components/reports/ScanSummaryReport.tsx
import React from 'react';
import { ScanResults } from '@/lib/types';
import SeverityPieChart from '@/components/charts/SeverityPieChart';

interface ScanSummaryReportProps {
  scanResults: ScanResults;
}

export default function ScanSummaryReport({ scanResults }: ScanSummaryReportProps) {
  const { summary, timestamp, duration, scanId } = scanResults;
  const date = new Date(timestamp).toLocaleString();
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Scan Summary Report</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Scan Information</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium text-gray-500 dark:text-gray-400">Scan ID</td>
                <td className="py-2">{scanId}</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium text-gray-500 dark:text-gray-400">Date</td>
                <td className="py-2">{date}</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium text-gray-500 dark:text-gray-400">Duration</td>
                <td className="py-2">{duration}</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium text-gray-500 dark:text-gray-400">Status</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {scanResults.status.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium text-gray-500 dark:text-gray-400">Total Detections</td>
                <td className="py-2">{summary.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Detection Severity</h3>
          <div className="flex justify-center">
            <SeverityPieChart 
              high={summary.high} 
              medium={summary.medium} 
              low={summary.low} 
            />
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Key Findings</h3>
        
        {summary.high > 0 && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
              High Severity Findings ({summary.high})
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Critical issues that require immediate attention. These findings indicate active cryptocurrency mining or highly suspicious activity.
            </p>
          </div>
        )}
        
        {summary.medium > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              Medium Severity Findings ({summary.medium})
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Suspicious activities that should be investigated. These may indicate potential cryptocurrency mining or preparation for such activities.
            </p>
          </div>
        )}
        
        {summary.low > 0 && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              Low Severity Findings ({summary.low})
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Items that match some indicators but are likely benign. These findings should be reviewed but are less likely to represent actual threats.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
