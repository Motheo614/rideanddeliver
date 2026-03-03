import React from 'react';
import HeroBanner from '@/components/HeroBanner';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import TrendingNow from '@/components/TrendingNow';
import EditorsPicks from '@/components/EditorsPicks';
import SectionHeading from '@/components/SectionHeading';
import { getFeaturedPost, getLatestPosts } from '@/lib/posts';

// Force dynamic rendering since we need database data
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch data server-side with ISR
  const featuredPost = await getFeaturedPost();
  const latestArticles = await getLatestPosts(10);

  return (
    <main className="min-h-screen bg-white">
      {featuredPost && <HeroBanner post={featuredPost} />}

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
          {/* Left Column: Latest Articles */}
          <div>
            <SectionHeading title="Latest Articles" />
            <div className="flex flex-col">
              {latestArticles.length > 0 ? (
                latestArticles.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))
              ) : (
                <p className="text-gray-400 italic">No articles available yet.</p>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <Sidebar />
        </div>
      </div>

      <TrendingNow />
      
      <EditorsPicks />
    </main>
  );
}
