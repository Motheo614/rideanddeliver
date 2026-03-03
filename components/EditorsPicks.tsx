import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeading from './SectionHeading';
import { getEditorsPicks } from '@/lib/posts';

export default async function EditorsPicks() {
  const picks = await getEditorsPicks();
  
  if (picks.length === 0) {
    return null;
  }

  const mainPick = picks[0];
  const otherPicks = picks.slice(1, 5);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionHeading title="Editor's Picks" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Large Card */}
          {mainPick && (
            <Link href={`/blog/${mainPick.slug}/`} className="group relative h-[400px] lg:h-full min-h-[400px] rounded-2xl overflow-hidden">
              {mainPick.featuredImage && (typeof mainPick.featuredImage === 'string' ? mainPick.featuredImage : (mainPick.featuredImage as any).url) ? (
                <Image
                  src={typeof mainPick.featuredImage === 'string' ? mainPick.featuredImage : (mainPick.featuredImage as any).url}
                  alt={mainPick.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="bg-[#CC0000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full w-fit mb-4">
                  {mainPick.category}
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                  {mainPick.title}
                </h3>
                <span className="text-gray-300 text-xs font-medium">
                  {mainPick.readTime}
                </span>
              </div>
            </Link>
          )}

          {/* Grid of Smaller Cards */}
          <div className="grid grid-cols-2 gap-6">
            {otherPicks.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}/`} className="group flex flex-col">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                  {post.featuredImage && (typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url) ? (
                    <Image
                      src={typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000] mb-1">
                  {post.category}
                </span>
                <h4 className="text-sm font-bold text-[#1a1a1a] line-clamp-2 leading-tight group-hover:text-[#CC0000] transition-colors mb-1">
                  {post.title}
                </h4>
                <span className="text-[10px] text-gray-400 font-medium">
                  {post.readTime}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
