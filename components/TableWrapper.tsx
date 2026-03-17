// components/TableWrapper.tsx
'use client';

import React, { useEffect, useRef } from 'react';

interface TableWrapperProps {
  children: React.ReactNode;
}

export default function TableWrapper({ children }: TableWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find all tables in the content and wrap them if not already wrapped
    const tables = containerRef.current.querySelectorAll('table:not(.wrapped)');
    
    tables.forEach((table) => {
      // Mark as wrapped to avoid double wrapping
      table.classList.add('wrapped');
      
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'overflow-x-auto my-6 -mx-4 sm:mx-0';
      
      const innerWrapper = document.createElement('div');
      innerWrapper.className = 'inline-block min-w-full align-middle px-4 sm:px-0';
      
      // Wrap the table
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(innerWrapper);
      innerWrapper.appendChild(table);
      
      // Add responsive styles to table
      table.classList.add('min-w-full', 'border-collapse', 'border', 'border-gray-200', 'rounded-lg', 'bg-white', 'shadow-sm');
      
      // Style table cells
      table.querySelectorAll('th').forEach((th) => {
        th.classList.add('px-4', 'py-3', 'text-left', 'text-xs', 'font-bold', 'text-gray-700', 'uppercase', 'tracking-wider', 'bg-gray-50', 'border-b', 'border-gray-200', 'whitespace-nowrap');
      });
      
      table.querySelectorAll('td').forEach((td) => {
        td.classList.add('px-4', 'py-3', 'text-sm', 'text-gray-700', 'border-b', 'border-gray-200');
      });
      
      // Remove border from last row
      table.querySelectorAll('tr:last-child td, tr:last-child th').forEach((cell) => {
        cell.classList.remove('border-b');
      });
    });
  }, [children]);

  return <div ref={containerRef}>{children}</div>;
}
