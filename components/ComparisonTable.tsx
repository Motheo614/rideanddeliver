// components/ComparisonTable.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Award, DollarSign } from 'lucide-react';

interface ComparisonItem {
  name: string;
  image?: string;
  rating: number; // 1-5
  price: string;
  bestFor: string;
  keyFeatures: string[];
  affiliateLink?: string;
  badge?: string; // e.g., "Best Overall", "Best Value"
}

interface ComparisonTableProps {
  items?: ComparisonItem[];
  title?: string;
  description?: string;
}

const defaultItems: ComparisonItem[] = [
  {
    name: 'Premium Delivery Backpack',
    rating: 5,
    price: '$89.99',
    bestFor: 'All-weather deliveries',
    keyFeatures: ['Waterproof', '40L capacity', 'Insulated'],
    badge: 'Best Overall'
  },
  {
    name: 'Budget Courier Bag',
    rating: 4,
    price: '$39.99',
    bestFor: 'Light urban deliveries',
    keyFeatures: ['Lightweight', '25L capacity', 'Reflective'],
    badge: 'Best Value'
  },
  {
    name: 'Heavy Duty Carrier',
    rating: 4.5,
    price: '$129.99',
    bestFor: 'Large orders',
    keyFeatures: ['Reinforced', '60L capacity', 'Multiple compartments'],
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < Math.floor(rating) ? 'fill-[#CC0000] text-[#CC0000]' : 'text-gray-300'}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function ComparisonTable({
  items = defaultItems,
  title = 'Our Top Picks',
  description = '* Based on extensive testing and real-world delivery experience'
}: ComparisonTableProps) {
  return (
    <section className="my-12 md:my-16 lg:my-20 w-full max-w-none" style={{ maxWidth: '100%' }}>
      <div className="w-full max-w-none bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Award className="text-[#CC0000]" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        </div>

        <div className="space-y-6 md:space-y-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-5 md:p-6 border border-gray-200 hover:border-[#CC0000] transition-all duration-300 hover:shadow-md"
            >
              {/* Badge */}
              {item.badge && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 bg-[#CC0000] text-white text-xs font-bold uppercase px-3 py-1.5 rounded-full">
                    <Award size={12} />
                    {item.badge}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Image */}
                {item.image && (
                  <div className="md:col-span-3">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-white border border-gray-200">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 200px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className={item.image ? 'md:col-span-9' : 'md:col-span-12'}>
                  <div className="flex flex-col h-full">
                    {/* Product Name */}
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      {item.name}
                    </h3>

                    {/* Rating & Price Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <StarRating rating={item.rating} />
                      <div className="flex items-center gap-1.5 text-lg font-bold text-gray-900">
                        <DollarSign size={18} className="text-gray-500" />
                        {item.price.replace('$', '')}
                      </div>
                    </div>

                    {/* Best For */}
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-gray-700">Best for: </span>
                      <span className="text-sm text-gray-600">{item.bestFor}</span>
                    </div>

                    {/* Key Features */}
                    <div className="mb-4 flex-grow">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Features</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {item.keyFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 bg-[#CC0000] rounded-full flex-shrink-0"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-auto">
                      <a
                        href={item.affiliateLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-[#CC0000] hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg text-sm"
                      >
                        Check Price on Amazon →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {description && (
          <p className="mt-6 text-xs text-gray-500 italic border-t border-gray-200 pt-4">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
