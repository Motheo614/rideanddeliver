import React from 'react';
import ArticleCard from '@/components/ArticleCard';
import ResearchHero from '@/components/ResearchHero';
import DepartmentGrid from '@/components/DepartmentGrid';
import TopPicksSection from '@/components/TopPicksSection';
import MethodologySection from '@/components/MethodologySection';
import Sidebar from '@/components/Sidebar';
import EditorialPledge from '@/components/EditorialPledge';
import SeoJsonLd from '@/components/SeoJsonLd';
import { getLatestPosts } from '@/lib/posts';
import { getPostHref } from '@/lib/postDisplay';
import { buildCollectionPageSchema, buildItemListSchema } from '@/lib/seo/schema';

// Revalidate every 30 seconds
export const revalidate = 30;

export default async function HomePage() {
  const latestArticles = await getLatestPosts(10);

  const homeSchemas = [
    buildCollectionPageSchema(
      '/',
      'Rider Section Home',
      'Independent gear reviews and buying guides for bike delivery couriers.'
    ),
    buildItemListSchema(latestArticles.map((post) => ({ name: post.title, url: getPostHref(post) }))),
  ];

  return (
    <main className="min-h-screen bg-white text-charcoal">
      <SeoJsonLd data={homeSchemas} />

      <ResearchHero />
      <DepartmentGrid />
      <TopPicksSection />
      <MethodologySection />

      <section aria-labelledby="latest-heading" className="section-y bg-white">
        <div className="container-page">
          <div className="mb-10 max-w-[65ch]">
            <p className="eyebrow">Latest research</p>
            <h2 id="latest-heading" className="mt-3 text-h2 font-bold text-charcoal">
              Latest Buying Guides
            </h2>
          </div>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] lg:gap-16">
            <div className="flex flex-col">
              {latestArticles.length > 0 ? (
                latestArticles.map((post) => <ArticleCard key={post.slug} post={post} />)
              ) : (
                <p className="italic text-body">No guides available yet.</p>
              )}
            </div>
            <Sidebar />
          </div>
        </div>
      </section>

      <EditorialPledge />
    </main>
  );
}
