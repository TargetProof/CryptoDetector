// src/components/charts/DetectionBarChart.tsx
import React from 'react';

interface DetectionBarChartProps {
  data: {
    category: string;
    count: number;
  }[];
  maxHeight?: number;
}

export default function DetectionBarChart({ data, maxHeight = 200 }: DetectionBarChartProps) {
  // Find the maximum value to scale the bars
  const maxValue = Math.max(...data.map(item => item.count), 1);
  
  return (
    <div className="w-full">
      <div className="flex items-end justify-around h-64 mb-4">
        {data.map((item, index) => {
          const height = (item.count / maxValue) * maxHeight;
          
          return (
            <div key={index} className="flex flex-col items-center mx-1">
              <div className="text-xs text-center mb-1">{item.count}</div>
              <div 
                className="w-16 bg-blue-500 rounded-t-lg transition-all duration-500 ease-in-out"
                style={{ height: `${height}px` }}
              ></div>
              <div className="text-xs text-center mt-2 w-16 truncate" title={item.category}>
                {item.category}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
