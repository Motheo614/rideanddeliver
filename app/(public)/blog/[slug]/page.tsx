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
  
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const categoryPosts = await getPostsByCategory(post.categorySlug);
  const relatedPosts = categoryPosts
    .filter(p => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      {/* Affiliate Disclosure Banner */}
      <div className="bg-amber-50 border-b border-amber-100 py-3">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs md:text-sm text-amber-900 text-center leading-relaxed">
            <strong className="font-semibold">Disclosure:</strong> This post contains affiliate links. 
            If you make a purchase through these links, we may earn a commission at no extra cost to you.
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-xs md:text-sm">
            <li>
              <Link 
                href="/" 
                className="text-gray-500 hover:text-[#CC0000] transition-colors font-medium"
              >
                Home
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link 
                href={`/${post.categorySlug}/`} 
                className="text-gray-500 hover:text-[#CC0000] transition-colors font-medium"
              >
                {post.category}
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-700 truncate" aria-current="page">
              {post.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Article Container */}
      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12 lg:py-16">
        
        {/* Header Section */}
        <header className="mb-8 md:mb-12">
          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
            <span className="inline-flex items-center bg-[#CC0000] text-white text-xs font-bold uppercase px-4 py-1.5 rounded-full">
              {post.category}
            </span>
            <time 
              dateTime={new Date(post.publishedAt).toISOString()} 
              className="text-sm text-gray-500 font-medium"
            >
              {formatDate(post.publishedAt)}
            </time>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500 font-medium">
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 md:mb-8">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6 md:mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-3 py-4 border-y border-gray-200">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#CC0000] to-red-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">RS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-bold text-gray-900">Rider Section Team</p>
              <p className="text-xs md:text-sm text-gray-500">Expert Gear Reviewers</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <figure className="mb-10 md:mb-14 lg:mb-16">
          <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
            {post.featuredImage && (typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url) ? (
              <Image
                src={typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 896px, 896px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-lg">No image available</span>
              </div>
            )}
          </div>
        </figure>

        {/* Article Content */}
        <div 
          className="prose prose-lg md:prose-xl max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-[#CC0000] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-all
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-ul:my-6 prose-ul:space-y-2
            prose-ol:my-6 prose-ol:space-y-2
            prose-li:text-gray-700 prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-[#CC0000] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
            prose-code:text-[#CC0000] prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Comparison Table Section */}
        <section className="mt-12 md:mt-16 lg:mt-20">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 lg:p-10 border border-gray-200 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Quick Comparison</h2>
            
            {/* Mobile-friendly table wrapper */}
            <div className="overflow-x-auto -mx-6 md:mx-0">
              <div className="inline-block min-w-full align-middle px-6 md:px-0">
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Feature
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Details
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Quality
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          Premium materials
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium hidden sm:table-cell">
                          ★★★★★
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Price
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          Mid-range
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium hidden sm:table-cell">
                          ★★★★☆
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Durability
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          Long-lasting
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium hidden sm:table-cell">
                          ★★★★★
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-600 italic">
              * This comparison table can be customized based on the article content
            </p>
          </div>
        </section>

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <section className="mt-12 md:mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Related Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-[#CC0000] hover:text-white text-gray-700 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer transform hover:scale-105"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 md:mt-20 lg:mt-24 pt-12 border-t border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-10">
              Continue Reading
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedPosts.map((p) => (
                <Link 
                  key={p.slug} 
                  href={`/blog/${p.slug}/`} 
                  className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#CC0000] hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    {p.featuredImage && (typeof p.featuredImage === 'string' ? p.featuredImage : (p.featuredImage as any).url) ? (
                      <Image
                        src={typeof p.featuredImage === 'string' ? p.featuredImage : (p.featuredImage as any).url}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-[#CC0000] transition-colors leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2 flex-1">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-3 text-xs font-semibold text-[#CC0000] group-hover:underline">
                      Read More →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to Top */}
        <div className="mt-16 md:mt-20 text-center">
          <a 
            href="#" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#CC0000] transition-colors"
          >
            <span>↑</span> Back to Top
          </a>
        </div>
      </article>
    </main>
  );
}
