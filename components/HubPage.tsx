import React from 'react';
import ArticleCard from '@/components/ArticleCard';
import SectionHeading from '@/components/SectionHeading';
import { getPostsByCategory } from '@/lib/posts';
import Link from 'next/link';

interface HubPageProps {
  title: string;
  description: string;
  categorySlug: string;
  intro: string;
}

export default async function HubPage({ title, description, categorySlug, intro }: HubPageProps) {
  // Fetch posts from API
  const categoryPosts = await getPostsByCategory(categorySlug);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gray-50 py-20 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1a] mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
            {description}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Intro Paragraph */}
          <div className="prose prose-lg max-w-none mb-16 text-gray-600 leading-relaxed">
            <p>{intro}</p>
          </div>

          <SectionHeading title={`Latest in ${title}`} />
          
          <div className="flex flex-col">
            {categoryPosts.length > 0 ? (
              categoryPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))
            ) : (
              <p className="text-gray-400 italic">No articles found in this category yet.</p>
            )}
          </div>

          {/* Browse More Categories */}
          <div className="mt-20 pt-12 border-t border-gray-100">
            <h3 className="text-2xl font-black text-[#1a1a1a] mb-8 text-center">Browse More Categories</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'Safety Gear', href: '/bike-delivery-rider-gear/' },
                { label: 'Tech & Lighting', href: '/bike-delivery-tech-and-visibility/' },
                { label: 'Bike Security', href: '/bike-security-for-delivery-riders/' },
                { label: 'Delivery Gear', href: '/delivery-rider-equipment/' },
                { label: 'Platform Reviews', href: '/delivery-platform-reviews/' },
              ].filter(c => c.href !== `/${categorySlug}/`).map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="bg-white border border-gray-200 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:border-[#CC0000] hover:text-[#CC0000] transition-all"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
