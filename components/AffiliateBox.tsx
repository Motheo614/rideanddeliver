import React from 'react';

interface AffiliateBoxProps {
  name: string;
  price?: string;
  url: string;
}

export default function AffiliateBox({ name, price, url }: AffiliateBoxProps) {
  return (
    <div className="my-12 p-8 bg-gray-50 border border-gray-200 rounded-2xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{name}</h3>
          {price && <p className="text-2xl font-black text-[#CC0000]">{price}</p>}
        </div>
        
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="bg-[#CC0000] text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 text-center whitespace-nowrap"
        >
          Check Price on Amazon →
        </a>
      </div>
      
      <p className="mt-6 text-[10px] text-gray-400 italic text-center">
        As an Amazon Associate I earn from qualifying purchases.
      </p>
    </div>
  );
}
