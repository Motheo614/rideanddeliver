import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import TrendingNow from '@/components/TrendingNow';
import EditorsPicks from '@/components/EditorsPicks';
import NewsletterSignupForm from '@/components/NewsletterSignupForm';
import SectionHeading from '@/components/SectionHeading';
import SeoJsonLd from '@/components/SeoJsonLd';
import { getFeaturedPost, getLatestPosts } from '@/lib/posts';
import {
  buildCollectionPageSchema,
  buildItemListSchema,
} from '@/lib/seo/schema';

// Revalidate every 30 seconds
export const revalidate = 30;

export default async function HomePage() {
  const featuredPost = await getFeaturedPost();
  const latestArticles = await getLatestPosts(10);
  const heroPost = featuredPost ?? latestArticles[0] ?? null;

  const homeSchemas = [
    buildCollectionPageSchema(
      '/',
      'Rider Complex Home',
      'Gear reviews and buying guides for bike delivery riders.'
    ),
    buildItemListSchema(
      latestArticles.map((post) => ({
        name: post.title,
        url: `/${post.dbCategorySlug || post.categorySlug}/${post.slug}`,
      }))
    ),
  ];

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <SeoJsonLd data={homeSchemas} />
      {heroPost && (
        <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden md:h-[78vh] md:min-h-[560px]">
          <article className="group h-full w-full bg-black">
            <Link href={`/${heroPost.dbCategorySlug}/${heroPost.slug}`} className="relative block h-full w-full">
              <div className="absolute inset-0">
                {heroPost.featuredImage &&
                (typeof heroPost.featuredImage === 'string'
                  ? heroPost.featuredImage
                  : (heroPost.featuredImage as any).url) ? (
                  <Image
                    src={typeof heroPost.featuredImage === 'string' ? heroPost.featuredImage : (heroPost.featuredImage as any).url}
                    alt={heroPost.title}
                    fill
                    priority
                    className="object-cover transition duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />
              </div>

              <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 pb-8 md:px-6 md:pb-12">
                <div className="max-w-4xl">
                  <div className="mb-4 text-[11px] font-bold uppercase tracking-wide text-white/80">
                    <span className="text-white">{heroPost.category}</span>
                  </div>
                  <h1 className="text-4xl font-black leading-[1.05] text-white transition-colors md:text-6xl lg:text-7xl group-hover:text-[#ffe3e3]">
                    {heroPost.title}
                  </h1>
                  <p className="mt-4 line-clamp-2 max-w-3xl text-base leading-relaxed text-white/85 md:text-xl">
                    {heroPost.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </article>
        </section>
      )}

      <div className="container mx-auto px-4 py-16">
        <div>
          <SectionHeading title="Top Picks & Buying Guides" />
          <p className="mb-8 max-w-2xl text-gray-600">
            Start with the latest rider-first recommendations, comparisons, and setup advice for real delivery conditions.
          </p>
          <div className="flex flex-col">
            {latestArticles.length > 0 ? (
              latestArticles.map((post) => (
                <ArticleCard key={post.slug} post={post} replaceDateWithReadTime />
              ))
            ) : (
              <p className="text-gray-400 italic">No guides available yet.</p>
            )}
          </div>
        </div>
      </div>

      <TrendingNow />

      <EditorsPicks />

      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-black md:text-4xl">Get Better Gear Decisions In Your Inbox</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Weekly buyer tips, comparison shortcuts, and practical riding upgrades with zero fluff.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <label htmlFor="bottom-email" className="mb-2 block text-left text-xs font-bold uppercase tracking-[0.14em] text-gray-600">
              Subscribe For New Guides
            </label>
            <NewsletterSignupForm
              source="homepage-footer"
              inputId="bottom-email"
              inputPlaceholder="Email Address"
              buttonText="Subscribe"
              rowClassName="flex flex-col gap-3 sm:flex-row"
              inputClassName="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-[#CC0000] focus:outline-none"
              buttonClassName="rounded-xl bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#CC0000]"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
