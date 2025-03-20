// src/components/reports/DetectionDetailsTable.tsx
import React, { useState } from 'react';
import { Detection } from '@/lib/types';

interface DetectionDetailsTableProps {
  detections: Detection[];
}

export default function DetectionDetailsTable({ detections }: DetectionDetailsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  
  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          text: 'text-yellow-800 dark:text-yellow-300',
          border: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        };
      case 'LOW':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-800 dark:text-blue-300',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          text: 'text-gray-800 dark:text-gray-300',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Detection Details</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-2 text-left">Severity</th>
              <th className="px-4 py-2 text-left">Source</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Score</th>
              <th className="px-4 py-2 text-left">Matches</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {detections.map((detection) => {
              const severityClass = getSeverityClass(detection.severity);
              const isExpanded = expandedRows[detection.id] || false;
              
              return (
                <React.Fragment key={detection.id}>
                  <tr className="border-b dark:border-gray-700">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${severityClass.badge}`}>
                        {detection.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">{detection.source}</td>
                    <td className="px-4 py-3">{detection.itemType}</td>
                    <td className="px-4 py-3">{detection.score}</td>
                    <td className="px-4 py-3">{detection.matches.length}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRow(detection.id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                      >
                        {isExpanded ? 'Hide' : 'Details'}
                        <svg 
                          className={`w-4 h-4 ml-1 transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className={`${severityClass.bg} border-b dark:border-gray-700`}>
                      <td colSpan={6} className="px-4 py-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Content</h4>
                            <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto">
                              {detection.content}
                            </pre>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Matches</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {detection.matches.map((match, idx) => (
                                <li key={idx} className="text-sm">
                                  <span className="font-mono">{match.match}</span> - {match.category} (weight: {match.weight})
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
