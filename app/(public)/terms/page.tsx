import React from 'react';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Terms of Service',
  description: 'Review Rider Complex terms of service, content usage rights, and liability terms for visitors and subscribers.',
  path: '/terms/',
  keywords: ['terms of service', 'content usage', 'Rider Complex terms'],
});

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-8">Terms of Service</h1>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>By accessing Rider Complex, you agree to comply with these terms of service. All content on this site is for informational purposes only.</p>
          <h2>Intellectual Property</h2>
          <p>All text, images, and logos on this site are the property of Rider Complex unless otherwise stated. You may not reproduce or distribute our content without prior written permission.</p>
          <h2>Limitation of Liability</h2>
          <p>Rider Complex is not liable for any damages or injuries resulting from the use of products or information recommended on this site. Always follow local laws and safety regulations when riding.</p>
        </div>
      </div>
    </main>
  );
}
