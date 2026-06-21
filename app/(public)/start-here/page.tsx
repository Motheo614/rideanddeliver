import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/lib/posts';
import { buildPageMetadata } from '@/lib/seo/metadata';
import NewsletterSignupForm from '@/components/NewsletterSignupForm';

export const metadata = buildPageMetadata({
  title: 'Start Here: New Delivery Rider Guide',
  description: 'A practical start-here guide for US gig riders with essential gear categories, setup tips, and first-shift recommendations.',
  path: '/start-here',
  keywords: ['new delivery rider guide', 'start delivery riding', 'gig rider setup'],
});

const checklistBullets = [
  'What actually surprises new riders in their first 90 days, including pay, app rules, and hazards',
  'The pain points that wear down veteran riders over time, like burnout, shrinking pay, and no safety net',
  'Cross platform risks every rider faces no matter which app you drive for',
  "The gear riders say they wish they'd bought sooner, and why",
];

const comparisonCategories = ['Helmets', 'Gloves', 'Cameras', 'Locks', 'Rain Gear', 'Power Banks', 'Shoe Covers'];

function PostCard({ post }: { post: any }) {
  const imageUrl = post.featuredImage && (typeof post.featuredImage === 'string' ? post.featuredImage : post.featuredImage.url);

  return (
    <Link
      href={`/${post.dbCategorySlug}/${post.slug}`}
      className="group flex gap-4 bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#CC0000] transition-colors"
    >
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 relative">
        {imageUrl ? (
          <Image src={imageUrl} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center py-3 pr-4">
        <span className="text-[10px] text-[#CC0000] font-bold uppercase tracking-widest mb-1">{post.category}</span>
        <h3 className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#CC0000] transition-colors leading-snug">
          {post.title}
        </h3>
      </div>
    </Link>
  );
}

function MidListCapture() {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 my-4">
      <div>
        <p className="font-bold text-[#1a1a1a]">Get weekly gear picks in your inbox</p>
        <p className="text-sm text-gray-500">Budget-first recommendations for working delivery riders. No fluff.</p>
      </div>
      <div className="w-full md:w-auto md:min-w-[320px]">
        <NewsletterSignupForm
          source="start-here-midlist"
          buttonText="Join free"
          rowClassName="flex flex-col sm:flex-row gap-2"
          inputClassName="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
          buttonClassName="bg-[#CC0000] text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition-colors whitespace-nowrap"
        />
      </div>
    </div>
  );
}

export default async function StartHerePage() {
  const allPosts = await getPosts({ status: 'published' });
  const importantPosts = allPosts.slice(0, 8);
  const firstPosts = importantPosts.slice(0, 4);
  const restPosts = importantPosts.slice(4, 8);

  const hubs = [
    { label: 'Safety Gear', href: '/safety-gear', desc: 'Helmets, clothing, and safety tips.' },
    { label: 'Tech & Lighting', href: '/tech-lighting', desc: 'Dash cams, lights, and gadgets.' },
    { label: 'Bike Security', href: '/bike-security', desc: 'Locks, trackers, and theft prevention.' },
    { label: 'Delivery Gear', href: '/delivery-gear', desc: 'Bags, racks, and equipment.' },
    { label: 'Platform Reviews', href: '/platform-reviews', desc: 'Earnings, apps, and platform guides.' },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Zone 1: hero */}
      <section className="bg-[#CC0000] py-20 md:py-24 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90 mb-4">
            New to delivery riding?
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Everything you need to<br />ride smarter, earn more.
          </h1>
          <p className="text-lg md:text-2xl font-medium opacity-90 leading-relaxed mb-8">
            RiderComplex reviews the gear, tests the platforms, and breaks down the tech — so you spend less time guessing and more time earning.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm opacity-80">
            <span> <strong className="font-bold">4.8/5</strong> avg. gear rating</span>
            <span> <strong className="font-bold">120+</strong> products reviewed</span>
            <span> <strong className="font-bold">Safety-first</strong> recommendations</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Zone 1: category grid */}
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-8 text-center">Browse by category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {hubs.map((hub) => (
              <Link key={hub.href} href={hub.href} className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#CC0000] transition-all">
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#CC0000] transition-colors">{hub.label}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{hub.desc}</p>
              </Link>
            ))}
          </div>

          {/* Zone 2: lead magnet */}
          <div className="bg-gray-50 border border-gray-100 border-l-4 border-l-[#CC0000] rounded-2xl p-8 md:p-10 mb-16">
            <span className="inline-flex items-center gap-1 bg-red-50 border border-[#CC0000] text-[#CC0000] text-xs font-bold uppercase tracking-widest rounded px-3 py-1 mb-4">
              📋 Free guide
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-3">What Nobody Tells You Before Your First Delivery</h2>
            <p className="text-gray-600 mb-6 max-w-2xl leading-relaxed">
              The pay traps, safety blind spots, and gear regrets real US delivery riders report. Written for brand new riders and for veterans who&apos;ve been doing this for years.
            </p>
            <ul className="space-y-2 mb-6 max-w-xl">
              {checklistBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="max-w-md">
              <NewsletterSignupForm
                source="start-here-lead-magnet"
                buttonText="Get the checklist"
                rowClassName="flex flex-col sm:flex-row gap-3"
              />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              We&apos;ll email it to you shortly after you confirm your subscription. No spam, unsubscribe any time.
            </p>
            {/* TODO: once the starter checklist PDF is hosted, link it directly here (and/or attach it in sendNewsletterWelcomeEmail) instead of the "shortly" messaging above. */}
          </div>

          {/* Zone 3: gear comparison teaser */}
          <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
            <div>
              <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-2"> AI-powered tool</p>
              <h2 className="text-xl md:text-2xl font-black text-[#1a1a1a] mb-2">Can&apos;t decide between two products?</h2>
              <p className="text-gray-600 text-sm mb-4 max-w-md">
                Pick any two pieces of gear and get a side-by-side AI breakdown — pros, cons, head-to-head scores, and a straight verdict. Uses our real reviews.
              </p>
              <div className="flex flex-wrap gap-2">
                {comparisonCategories.map((cat) => (
                  <span key={cat} className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href="/tools/gear-comparison"
              className="bg-[#CC0000] text-white rounded-xl px-6 py-4 font-bold text-center hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Compare gear now 
              <span className="block text-xs font-normal opacity-80 mt-1">Free · No sign-in needed</span>
            </Link>
          </div>

          {/* Zone 4: essential reading */}
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-8 text-center">Essential Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {firstPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          <MidListCapture />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
