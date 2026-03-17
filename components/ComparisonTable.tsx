// components/ComparisonTable.tsx
'use client';

import React from 'react';

interface ComparisonItem {
  feature: string;
  details: string;
  rating: string;
}

interface ComparisonTableProps {
  items?: ComparisonItem[];
  title?: string;
  description?: string;
}

const defaultItems: ComparisonItem[] = [
  { feature: 'Quality', details: 'Premium materials', rating: '★★★★★' },
  { feature: 'Price', details: 'Mid-range', rating: '★★★★☆' },
  { feature: 'Durability', details: 'Long-lasting', rating: '★★★★★' },
];

export default function ComparisonTable({ 
  items = defaultItems, 
  title = 'Quick Comparison',
  description = '* This comparison table can be customized based on the article content'
}: ComparisonTableProps) {
  return (
    <section className="my-12 md:my-16 lg:my-20">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 border border-gray-200">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{title}</h2>
        
        {/* Mobile-responsive table with horizontal scroll */}
        <div className="-mx-6 md:mx-0 overflow-x-auto">
          <div className="inline-block min-w-full align-middle px-6 md:px-0">
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Feature
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Details
                    </th>
                    <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {item.feature}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.details}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-900 font-medium">
                        {item.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Mobile-only rating summary */}
        <div className="mt-4 sm:hidden space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm border-b border-gray-200 pb-2 last:border-0">
              <span className="font-medium text-gray-700">{item.feature}:</span>
              <span className="text-gray-900">{item.rating}</span>
            </div>
          ))}
        </div>
        
        {description && (
          <p className="mt-6 text-sm text-gray-600 italic border-t border-gray-200 pt-4">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
