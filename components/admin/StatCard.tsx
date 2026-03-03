'use client';

import React from 'react';
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  data: { value: number }[];
}

export default function StatCard({ label, value, change, isPositive, data }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </span>
        <button className="text-gray-400 hover:text-[#1a1a1a]">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-3xl font-black text-[#1a1a1a] mb-2">{value}</h3>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            VS Last Month
          </span>
        </div>
      </div>

      <div className="mt-auto h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${label})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
