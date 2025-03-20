// src/components/reports/ReportGenerator.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScanResults } from '@/lib/types';
import { generateReport } from '@/lib/scanService';

interface ReportGeneratorProps {
  scanResults: ScanResults;
}

export default function ReportGenerator({ scanResults }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async (format: 'pdf' | 'csv') => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await generateReport(scanResults.scanId, format);
      
      if (response.success && response.results) {
        setReportUrl(response.results);
      } else {
        setError(response.message || 'Failed to generate report');
      }
    } catch (err) {
      setError('An error occurred while generating the report');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-4">Generate Report</h2>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate a comprehensive report of the scan results in your preferred format.
        </p>
        
        <div className="flex space-x-4">
          <Button
            onClick={() => handleGenerateReport('pdf')}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? 'Generating...' : 'PDF Report'}
          </Button>
          
          <Button
            onClick={() => handleGenerateReport('csv')}
            disabled={isGenerating}
            variant="outline"
          >
            {isGenerating ? 'Generating...' : 'CSV Export'}
          </Button>
        </div>
        
        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}
        
        {reportUrl && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-sm mb-2">Your report is ready:</p>
            <a 
              href={reportUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Report
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
