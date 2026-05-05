import React from 'react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import ContactForm from '@/components/ContactForm';

export const metadata = buildPageMetadata({
  title: 'Contact Rider Complex',
  description: 'Contact Rider Complex with product review requests, rider gear questions, and affiliate content feedback.',
  path: '/contact/',
  keywords: ['contact Rider Complex', 'gear review request', 'delivery rider support'],
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-8 text-center">Contact Us</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Have a question about gear? Want us to review a specific product? We&apos;d love to hear from you.
        </p>
        
        <ContactForm />
      </div>
    </main>
  );
}
