import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User, ArrowUp, Tag, ChevronRight } from 'lucide-react';
import { getPostBySlug, getPostsByCategory } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import ComparisonTable from '@/components/ComparisonTable';
import TableWrapper from '@/components/TableWrapper';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  const featuredImageUrl = typeof post.featuredImage === 'string'
    ? post.featuredImage
    : (post.featuredImage as any)?.url;

  return {
    title: `${post.title} | Rider Section`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: featuredImageUrl ? [featuredImageUrl] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const categoryPosts = await getPostsByCategory(post.categorySlug);
  const relatedPosts = categoryPosts
    .filter(p => p.slug !== post.slug)
    .slice(0, 3);

  const featuredImageUrl = typeof post.featuredImage === 'string'
    ? post.featuredImage
    : (post.featuredImage as any)?.url;

  // Helper to safely render content
  const renderContent = () => {
    if (!post.content) return null;
    // You can add any necessary content sanitization or transformation here
    return post.content;
  };

  return (
    <>
      {/* Affiliate Disclosure Banner */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-xs sm:text-sm text-amber-900 text-center">
            <strong className="font-semibold">Disclosure:</strong> This post contains affiliate links. 
            If you make a purchase through these links, we may earn a commission at no extra cost to you.
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-[#CC0000] transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight size={14} className="text-gray-400" />
            <li>
              <Link
                href={`/category/${post.categorySlug}/`}
                className="text-gray-500 hover:text-[#CC0000] transition-colors"
              >
                {post.category}
              </Link>
            </li>
            <ChevronRight size={14} className="text-gray-400" />
            <li className="text-gray-700 truncate max-w-[200px] sm:max-w-xs font-medium" title={post.title}>
              {post.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Main Layout: 3-Column Grid on Large Screens */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12">

          {/* LEFT COLUMN: Spacer / Optional Navigation (hidden on smaller screens) */}
          <aside className="hidden lg:block lg:col-span-1"></aside>

          {/* CENTER COLUMN: Main Article Content */}
          <article className="lg:col-span-7 xl:col-span-7">
            {/* Header Section */}
            <header className="mb-8 md:mb-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex bg-[#CC0000] text-white text-xs font-bold uppercase px-3 py-1.5 rounded-full">
                  {post.category}
                </span>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <time dateTime={new Date(post.publishedAt).toISOString()} className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(post.publishedAt)}
                  </time>
                  <span className="text-gray-300" aria-hidden="true">•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    {post.readTime || '5'} min read
                  </span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center gap-3 py-4 border-t border-b border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#CC0000] to-red-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-base">RS</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-1.5">
                    <User size={14} className="text-gray-400" />
                    Rider Section Team
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">Expert Gear Reviewers</p>
                </div>
              </div>
                </header>

            {/* Featured Image */}
            {featuredImageUrl && (
              <figure className="mb-10 md:mb-12">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                  <Image
                    src={featuredImageUrl}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </figure>
            )}

            {/* Article Content Body */}
            <TableWrapper>
              <div
                className="
                  prose prose-base sm:prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                  prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-[#CC0000] prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-ul:my-6 prose-ul:space-y-2
                  prose-ol:my-6 prose-ol:space-y-2
                  prose-li:text-gray-700
                  prose-blockquote:border-l-4 prose-blockquote:border-[#CC0000] prose-blockquote:pl-4 sm:prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:pr-4 sm:prose-blockquote:pr-6
                  prose-img:rounded-xl prose-img:shadow-md prose-img:my-8
                  prose-code:text-[#CC0000] prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:overflow-x-auto
                  prose-hr:my-12 prose-hr:border-gray-200
                  break-words
                "
                dangerouslySetInnerHTML={{ __html: renderContent() || '' }}
              />
            </TableWrapper>

            {/* Comparison Table Section (Static Example - can be made dynamic) */}
            <ComparisonTable />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <section className="mt-12 md:mt-16 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-[#CC0000] hover:text-white text-gray-700 text-sm font-medium rounded-full transition-all duration-200 cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Back to Top */}
            <div className="mt-16 md:mt-20 text-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#CC0000] transition-colors group cursor-pointer"
              >
                <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
                Back to Top
              </button>
            </div>
          </article>

          {/* RIGHT COLUMN: Sidebar with Ads and Related Content */}
          <aside className="lg:col-span-4 xl:col-span-4 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-8 space-y-8">
              {/* Ad Placeholder 1 - Leaderboard or Large Rectangle */}
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Advertisement</p>
                <div className="bg-gray-200 w-full h-[250px] flex items-center justify-center rounded-lg">
                  <span className="text-gray-400">Google Ad (300x250)</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Ad placeholder</p>
              </div>

              {/* Ad Placeholder 2 */}
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Advertisement</p>
                <div className="bg-gray-200 w-full h-[600px] flex items-center justify-center rounded-lg">
                  <span className="text-gray-400">Google Ad (300x600)</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Skyscraper ad placeholder</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Posts Section - Full width below the grid */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 md:mt-20 lg:mt-24 pt-12 border-t border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#CC0000] rounded-full"></span>
              Continue Reading
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((p) => {
                const relatedImageUrl = typeof p.featuredImage === 'string'
                  ? p.featuredImage
                  : (p.featuredImage as any)?.url;

                return (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}/`}
                    className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#CC0000] hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      {relatedImageUrl ? (
                        <Image
                          src={relatedImageUrl}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#CC0000] transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                      {p.excerpt && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {p.excerpt}
                        </p>
                      )}
                      <div className="mt-3 text-xs font-semibold text-[#CC0000] group-hover:underline">
                        Read More →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
