import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { formatDate, formatDateAbsolute } from '@/lib/utils';

interface ArticleCardProps {
  post: Post;
  replaceDateWithReadTime?: boolean;
  useAbsoluteUpperDate?: boolean;
  swapDateWithReadTime?: boolean;
}

export default function ArticleCard({
  post,
  replaceDateWithReadTime = false,
  useAbsoluteUpperDate = false,
  swapDateWithReadTime = false,
}: ArticleCardProps) {
  const normalizedReadTime = (() => {
    const raw = (post.readTime || '').toString().trim();
    if (!raw) return '5 min read';
    if (/min\s+read/i.test(raw)) return raw;

    const minutes = raw.match(/\d+/)?.[0];
    return minutes ? `${minutes} min read` : raw;
  })();
  const formattedDate = useAbsoluteUpperDate
    ? formatDateAbsolute(post.publishedAt).toUpperCase()
    : formatDate(post.publishedAt);

  return (
    <Link href={`/${post.dbCategorySlug}/${post.slug}`} className="group flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
      <div className="w-full md:w-[60%] flex flex-col justify-center order-2 md:order-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {post.category}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            {replaceDateWithReadTime
              ? normalizedReadTime.toUpperCase()
              : swapDateWithReadTime
                ? normalizedReadTime.toUpperCase()
                : formattedDate}
          </span>
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a] mb-3 group-hover:text-[#CC0000] transition-colors leading-tight">
          {post.title}
        </h2>
        
        <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>
        
        {!replaceDateWithReadTime && (
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {swapDateWithReadTime ? formattedDate : normalizedReadTime}
          </span>
        )}
      </div>
      
      <div className="w-full md:w-[40%] aspect-video relative overflow-hidden rounded-lg order-1 md:order-2">
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
    </Link>
  );
}
