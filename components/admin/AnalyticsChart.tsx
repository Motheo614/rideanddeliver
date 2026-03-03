'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';

interface AnalyticsChartProps {
  data?: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
}

export default function AnalyticsChart({ data = [] }: AnalyticsChartProps) {
  // Transform data for chart display
  const chartData = data.map(item => ({
    name: format(new Date(item.date), 'MMM dd'),
    views: item.views,
    clicks: item.visitors, // Using visitors as clicks for now
  }));

  // Calculate totals
  const totalViews = data.reduce((sum, item) => sum + item.views, 0);
  const totalVisitors = data.reduce((sum, item) => sum + item.visitors, 0);

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-[#1a1a1a] mb-1">Analytics Overview</h3>
          <p className="text-sm text-gray-400 font-medium">
            {data.length > 0 
              ? `${format(new Date(data[0].date), 'MMM dd')} - ${format(new Date(data[data.length - 1].date), 'MMM dd, yyyy')}`
              : 'No data available'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Page Views</span>
            </div>
            <span className="text-lg font-black text-[#1a1a1a] ml-5">{totalViews.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visitors</span>
            </div>
            <span className="text-lg font-black text-[#1a1a1a] ml-5">{totalVisitors.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#6366f1" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#10b981" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[400px] w-full flex items-center justify-center">
          <p className="text-gray-400 text-lg font-medium">No data available for the selected period</p>
        </div>
      )}
    </div>
  );
}
