import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/lib/posts';

export default async function StartHerePage() {
  const allPosts = await getPosts({ status: 'published' });
  const importantPosts = allPosts.slice(0, 8);
  const hubs = [
    { label: 'Safety Gear', href: '/bike-delivery-rider-gear/', desc: 'Helmets, clothing, and safety tips.' },
    { label: 'Tech & Lighting', href: '/bike-delivery-tech-and-visibility/', desc: 'Dash cams, lights, and gadgets.' },
    { label: 'Bike Security', href: '/bike-security-for-delivery-riders/', desc: 'Locks, trackers, and theft prevention.' },
    { label: 'Delivery Gear', href: '/delivery-rider-equipment/', desc: 'Bags, racks, and equipment.' },
    { label: 'Platform Reviews', href: '/delivery-platform-reviews/', desc: 'Earnings, apps, and platform guides.' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#CC0000] py-24 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
            New to Delivery Riding?
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 leading-relaxed">
            Welcome to Rider Section. We help you find the best gear to stay safe, secure your bike, and maximize your earnings.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-[#1a1a1a] mb-12 text-center">1. Choose Your Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {hubs.map((hub) => (
              <Link key={hub.href} href={hub.href} className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#CC0000] transition-all">
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#CC0000] transition-colors">{hub.label}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{hub.desc}</p>
              </Link>
            ))}
          </div>

          <h2 className="text-3xl font-black text-[#1a1a1a] mb-12 text-center">2. Essential Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {importantPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}/`} className="flex gap-6 group">
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                  {post.featuredImage && (typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url) ? (
                    <Image src={typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url} alt="" fill className="object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-[#1a1a1a] group-hover:text-[#CC0000] transition-colors leading-tight mb-2">
                    {post.title}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{post.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
