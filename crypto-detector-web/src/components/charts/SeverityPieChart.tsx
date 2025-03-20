// src/components/charts/SeverityPieChart.tsx
import React from 'react';

interface SeverityPieChartProps {
  high: number;
  medium: number;
  low: number;
}

export default function SeverityPieChart({ high, medium, low }: SeverityPieChartProps) {
  const total = high + medium + low;
  
  // Calculate percentages and angles for the pie chart
  const highPercent = total > 0 ? Math.round((high / total) * 100) : 0;
  const mediumPercent = total > 0 ? Math.round((medium / total) * 100) : 0;
  const lowPercent = total > 0 ? Math.round((low / total) * 100) : 0;
  
  // Calculate stroke dasharray values for the SVG circle
  const circumference = 2 * Math.PI * 40; // radius is 40
  const highDash = (highPercent / 100) * circumference;
  const mediumDash = (mediumPercent / 100) * circumference;
  const lowDash = (lowPercent / 100) * circumference;
  
  // Calculate stroke dashoffset values
  const highOffset = 0;
  const mediumOffset = highDash;
  const lowOffset = highDash + mediumDash;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="transparent" 
            stroke="#f3f4f6" 
            strokeWidth="20"
          />
          
          {/* Low severity segment */}
          {lowPercent > 0 && (
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="transparent" 
              stroke="#3b82f6" 
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - lowDash}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-in-out"
              style={{ 
                strokeDashoffset: circumference - lowDash,
                transform: `rotate(${-90 + (highPercent + mediumPercent) * 3.6}deg)`,
                transformOrigin: 'center'
              }}
            />
          )}
          
          {/* Medium severity segment */}
          {mediumPercent > 0 && (
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="transparent" 
              stroke="#eab308" 
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - mediumDash}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-in-out"
              style={{ 
                strokeDashoffset: circumference - mediumDash,
                transform: `rotate(${-90 + highPercent * 3.6}deg)`,
                transformOrigin: 'center'
              }}
            />
          )}
          
          {/* High severity segment */}
          {highPercent > 0 && (
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="transparent" 
              stroke="#ef4444" 
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - highDash}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-in-out"
            />
          )}
          
          {/* Center text showing total */}
          <text 
            x="50" 
            y="50" 
            textAnchor="middle" 
            dominantBaseline="middle"
            className="font-bold text-lg"
            fill="currentColor"
          >
            {total}
          </text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          <span>High: {highPercent}%</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
          <span>Medium: {mediumPercent}%</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          <span>Low: {lowPercent}%</span>
        </div>
      </div>
    </div>
  );
}
