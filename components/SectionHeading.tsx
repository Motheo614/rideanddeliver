import React from 'react';

interface SectionHeadingProps {
  title: string;
  className?: string;
}

export default function SectionHeading({ title, className = "" }: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] relative inline-block">
        {title}
        <span className="absolute -bottom-2 left-0 w-12 h-1 bg-[#CC0000]"></span>
      </h2>
    </div>
  );
}
