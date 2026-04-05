import React from 'react';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Affiliate Disclaimer',
  description: 'Read how affiliate links work on Rider Complex and how commissions support independent gear reviews for delivery riders.',
  path: '/affiliate-disclaimer/',
  keywords: ['affiliate disclaimer', 'Amazon Associate disclosure', 'Rider Complex transparency'],
});

export default function AffiliateDisclaimerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-8">Affiliate Disclaimer</h1>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>Rider Complex is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</p>
          <p>As an Amazon Associate, we earn from qualifying purchases. This means that if you click on a link to a product on this site and make a purchase, we may receive a small commission at no extra cost to you.</p>
          <p>Our reviews are based on our own research and testing. We only recommend products that we believe will provide value to our readers. The commissions we earn help us to keep the site running and continue providing high-quality content for the delivery rider community.</p>
          <p>If you have any questions about our affiliate relationships, please feel free to contact us.</p>
        </div>
      </div>
    </main>
  );
}
