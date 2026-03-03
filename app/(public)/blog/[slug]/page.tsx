import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPostsByCategory } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | Rider Section`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch post from API (this increments view count server-side)
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Fetch related posts
  const categoryPosts = await getPostsByCategory(post.categorySlug);
  const relatedPosts = categoryPosts
    .filter(p => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      {/* Affiliate Disclosure Banner */}
      <div className="bg-[#fffbea] border-b border-yellow-100 py-2 px-4">
        <div className="container mx-auto">
          <p className="text-[10px] md:text-xs text-yellow-800 text-center">
            Disclosure: This post contains affiliate links. If you click through and make a purchase, we may earn a commission at no extra cost to you.
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-4 border-b border-gray-100">
        <div className="container mx-auto px-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">
          <Link href="/" className="hover:text-[#CC0000]">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${post.categorySlug}/`} className="hover:text-[#CC0000]">{post.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{post.title}</span>
        </div>
      </div>

      {/* Title Section */}
      <div className="container mx-auto px-4 pt-8 md:pt-12 pb-6 max-w-[1400px]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-[#CC0000] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-gray-400 text-xs font-medium">
              {formatDate(post.publishedAt)} • {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-[#1a1a1a] mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-[#CC0000] font-bold">
              RS
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a1a]">By Rider Section Team</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Expert Gear Reviewers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[300px] md:h-[600px]">
        {post.featuredImage && (typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url) ? (
          <Image
            src={typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url}
            alt={post.title}
            fill
            priority
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gray-800" />
        )}
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 xl:gap-12">
          {/* Main Content */}
          <article className="w-full max-w-3xl">
            <div 
              className="prose prose-lg prose-headings:text-[#1a1a1a] prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-[#CC0000] prose-a:no-underline hover:prose-a:underline prose-img:w-full prose-img:h-auto [&>*]:max-w-full [&_*]:max-w-full"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-20 pt-12 border-t border-gray-100">
                <h3 className="text-2xl font-black text-[#1a1a1a] mb-8">Related Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}/`} className="group">
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                        {p.featuredImage && (typeof p.featuredImage === 'string' ? p.featuredImage : (p.featuredImage as any).url) ? (
                          <Image
                            src={typeof p.featuredImage === 'string' ? p.featuredImage : (p.featuredImage as any).url}
                            alt={p.title}
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
                      <h4 className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#CC0000] transition-colors leading-snug">
                        {p.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar with Google Ads */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              {/* Google Ad Slot 1 - Top */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-1 border-b border-gray-200">
                  <p className="text-[10px] text-gray-400 text-center font-medium">ADVERTISEMENT</p>
                </div>
                <div className="aspect-square flex items-center justify-center text-gray-400 text-sm">
                  {/* Replace with your Google Ad code */}
                  Google Ad 300x250
                </div>
              </div>

              {/* Google Ad Slot 2 - Middle */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-1 border-b border-gray-200">
                  <p className="text-[10px] text-gray-400 text-center font-medium">ADVERTISEMENT</p>
                </div>
                <div className="aspect-square flex items-center justify-center text-gray-400 text-sm">
                  {/* Replace with your Google Ad code */}
                  Google Ad 300x250
                </div>
              </div>

              {/* Google Ad Slot 3 - Bottom */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-1 border-b border-gray-200">
                  <p className="text-[10px] text-gray-400 text-center font-medium">ADVERTISEMENT</p>
                </div>
                <div className="aspect-[300/600] flex items-center justify-center text-gray-400 text-sm">
                  {/* Replace with your Google Ad code */}
                  Google Ad 300x600
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
