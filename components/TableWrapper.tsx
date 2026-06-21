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

      // Remove editor inline styles that can fight frontend layout styles
      table.removeAttribute('style');
      table.querySelectorAll('th, td').forEach((cell) => {
        cell.removeAttribute('style');
      });
      
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'overflow-x-auto my-6 w-full';
      
      const innerWrapper = document.createElement('div');
      innerWrapper.className = 'inline-block w-full align-middle';
      
      // Wrap the table
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(innerWrapper);
      innerWrapper.appendChild(table);
      
      // Add responsive styles to table
      table.classList.add(
        'w-full',
        'border-collapse',
        'border',
        'border-gray-200',
        'rounded-lg',
        'bg-white',
        'shadow-sm',
        'table-auto'
      );
      
      // Style table cells
      table.querySelectorAll('th').forEach((th) => {
        th.classList.add(
          'px-4',
          'py-3',
          'lg:px-5',
          'lg:py-4',
          'text-left',
          'text-xs',
          'lg:text-sm',
          'font-bold',
          'text-gray-700',
          'uppercase',
          'tracking-wider',
          'bg-gray-50',
          'border-b',
          'border-gray-200',
          'whitespace-normal',
          'break-words',
          'align-top'
        );
      });
      
      table.querySelectorAll('td').forEach((td) => {
        td.classList.add(
          'px-4',
          'py-3',
          'lg:px-5',
          'lg:py-4',
          'text-sm',
          'lg:text-base',
          'leading-relaxed',
          'text-gray-700',
          'border-b',
          'border-gray-200',
          'whitespace-normal',
          'break-words',
          'align-top'
        );
      });

      // Quill often outputs first row as <td><strong>..</strong></td> without <th>
      const hasHeaderCells = table.querySelectorAll('th').length > 0;
      if (!hasHeaderCells) {
        table.querySelectorAll('tr:first-child td').forEach((cell) => {
          cell.classList.remove('text-sm', 'text-gray-700');
          cell.classList.add('text-xs', 'font-bold', 'text-gray-700', 'uppercase', 'tracking-wider', 'bg-gray-50');
        });
      }
      
      // Remove border from last row
      table.querySelectorAll('tr:last-child td, tr:last-child th').forEach((cell) => {
        cell.classList.remove('border-b');
      });
    });
  }, [children]);

  return <div ref={containerRef} className="w-full">{children}</div>;
}
