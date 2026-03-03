import React from 'react';

export default function FreeRiderChecklistPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-8">Free Rider Checklist</h1>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>Before you head out for your shift, make sure you have everything you need to stay safe and efficient.</p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1.5" />
              <span><strong>Helmet:</strong> Straps tight, no cracks, MIPS enabled.</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1.5" />
              <span><strong>Lights:</strong> Front and rear charged and functioning.</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1.5" />
              <span><strong>Lock:</strong> U-lock and cable/chain ready.</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1.5" />
              <span><strong>Phone:</strong> Fully charged + power bank.</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1.5" />
              <span><strong>Delivery Bag:</strong> Clean and zippers working.</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1.5" />
              <span><strong>Weather Gear:</strong> Waterproofs or layers as needed.</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
