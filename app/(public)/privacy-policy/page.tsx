import React from 'react';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description: 'Learn how Rider Complex collects, uses, and protects personal data for readers and newsletter subscribers.',
  path: '/privacy-policy/',
  keywords: ['privacy policy', 'data policy', 'Rider Complex privacy'],
});

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>At Rider Complex, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.</p>
          <h2>Information We Collect</h2>
          <p>We may collect information such as your email address if you subscribe to our newsletter, and anonymous usage data through cookies to improve our site performance.</p>
          <h2>How We Use Your Information</h2>
          <p>We use your email to send you the latest guides and reviews. We do not sell or share your personal information with third parties for their marketing purposes.</p>
          <h2>Cookies</h2>
          <p>We use cookies to personalize content and ads, and to analyze our traffic. You can choose to disable cookies in your browser settings.</p>
        </div>
      </div>
    </main>
  );
}
