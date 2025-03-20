// src/components/charts/TimeSeriesChart.tsx
import React from 'react';

interface DataPoint {
  date: string;
  value: number;
}

interface TimeSeriesChartProps {
  data: DataPoint[];
  title: string;
  height?: number;
  lineColor?: string;
}

export default function TimeSeriesChart({ 
  data, 
  title, 
  height = 200, 
  lineColor = '#3b82f6' 
}: TimeSeriesChartProps) {
  // Find min and max values for scaling
  const values = data.map(point => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  
  // Calculate points for the polyline
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = valueRange > 0 
      ? 100 - ((point.value - minValue) / valueRange) * 100 
      : 50;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div style={{ height: `${height}px` }} className="relative">
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          className="w-full h-full"
        >
          {/* Grid lines */}
          <line x1="0" y1="0" x2="100" y2="0" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
          
          {/* Line chart */}
          <polyline
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            points={points}
            className="transition-all duration-1000 ease-in-out"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = valueRange > 0 
              ? 100 - ((point.value - minValue) / valueRange) * 100 
              : 50;
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill={lineColor}
                className="transition-all duration-1000 ease-in-out"
              />
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-gray-500 pointer-events-none">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        {data.length > 0 && (
          <>
            <span>{new Date(data[0].date).toLocaleDateString()}</span>
            {data.length > 2 && (
              <span>{new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString()}</span>
            )}
            <span>{new Date(data[data.length - 1].date).toLocaleDateString()}</span>
          </>
        )}
      </div>
    </div>
  );
}
