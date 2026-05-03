import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { Tag, ChevronRight } from 'lucide-react';
import { getPostBySlug, getPostsByCategory } from '@/lib/posts';
import { formatDateAbsolute, stripHeadMetadataTags } from '@/lib/utils';
import { CATEGORY_MAP } from '@/lib/categoryMap';
import ArticleAuthorBox from '@/components/ArticleAuthorBox';
import TableWrapper from '@/components/TableWrapper';
import SeoJsonLd from '@/components/SeoJsonLd';
import ArticleBottomCta from '@/components/ArticleBottomCta';
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  buildProductSchema,
} from '@/lib/seo/schema';
import { buildArticleMetadata } from '@/lib/seo/metadata';

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  const featuredImageUrl = typeof post.featuredImage === 'string'
    ? post.featuredImage
    : (post.featuredImage as any)?.url;

  return buildArticleMetadata({
    title: `${post.title} | Rider Complex`,
    description: post.excerpt,
    path: `/${category}/${post.slug}`,
    image: featuredImageUrl,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: (post as any).updatedAt,
    section: post.category,
    tags: post.tags,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { category, slug } = await params;

  if (!CATEGORY_MAP[category]) {
    notFound();
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  if (post.dbCategorySlug !== category) {
    notFound();
  }

  if (post.slug !== slug) {
    redirect(`/${post.dbCategorySlug}/${post.slug}`);
  }

  const categoryPosts = await getPostsByCategory(post.categorySlug);
  const relatedPosts = categoryPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const featuredImageUrl = typeof post.featuredImage === 'string'
    ? post.featuredImage
    : (post.featuredImage as any)?.url;

  const renderContent = () => {
    if (!post.content) return null;
    return stripHeadMetadataTags(
      post.content
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/â€“|–/g, '-')
      .replace(/â€”|—/g, '-')
    );
  };

  const estimateReadTimeFromHtml = (html: string) => {
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = text ? text.split(' ').length : 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  const toIsoDate = (value?: string | Date) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  };

  const upgradeLegacyAffiliateBlocks = (html: string) => {
    if (!html) return html;

    const buildAffiliateCard = (
      name: string,
      imageTag: string,
      href: string,
      description?: string
    ) => {
      const trimmedName = String(name || '').trim();
      const trimmedHref = String(href || '').trim();
      const trimmedDescription = String(description || '').trim();

      if (!trimmedName || !trimmedHref || !imageTag) {
        return '';
      }

      const card = [
        '<div class="affiliate-product-card">',
        imageTag,
        `<h3>${trimmedName}</h3>`,
        `<div class="affiliate-card-cta"><a href="${trimmedHref}" target="_blank" rel="noopener noreferrer sponsored">CHECK PRICE ON AMAZON</a></div>`,
        '</div>',
      ].join('');

      return trimmedDescription ? `${card}<p>${trimmedDescription}</p>` : card;
    };

    // Convert old inline-formatted product chunks (title/asin/price/image/link)
    // into the new affiliate-product-card wrapper so global styling applies.
    const legacyBlockPattern = /<h3[^>]*>\s*<strong[^>]*>([^<]+?)<\/strong>\s*<\/h3>\s*<p[^>]*>\s*(?:<span[^>]*>)?\s*ASIN:\s*([^<]+?)\s*(?:<\/span>)?\s*<\/p>\s*<p[^>]*>\s*(?:<strong[^>]*>)?\s*([^<]+?)\s*(?:<\/strong>)?\s*<\/p>\s*<p[^>]*>\s*(?:<span[^>]*>)?\s*(<img[^>]+>)\s*(?:<\/span>)?\s*<\/p>\s*(?:<p[^>]*>\s*(?:<span[^>]*>)?([^<]+?)(?:<\/span>)?\s*<\/p>\s*)?<p[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?<\/p>/gi;

    let upgraded = html.replace(
      legacyBlockPattern,
      (_match, name, _asin, _price, imageTag, description, href) => {
        return buildAffiliateCard(name, imageTag, href, description) || _match;
      }
    );

    // Handle live legacy variant where image and description are mixed in the same paragraph.
    const mixedParagraphLegacyPattern = /<h3[^>]*>\s*<strong[^>]*>([^<]+?)<\/strong>\s*<\/h3>\s*<p[^>]*>[\s\S]*?ASIN:\s*([^<]+?)\s*(?:<\/span>)?\s*<\/p>\s*<p[^>]*>[\s\S]*?(?:<strong[^>]*>)?\s*([^<]+?)\s*(?:<\/strong>)?\s*<\/p>\s*<p[^>]*>[\s\S]*?(<img[^>]+>)[\s\S]*?(?:<\/span>)?\s*(?:<span[^>]*>)?([^<]*?)?(?:<\/span>)?\s*<\/p>\s*<p[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?<\/p>/gi;

    upgraded = upgraded.replace(
      mixedParagraphLegacyPattern,
      (_match, name, _asin, _price, imageTag, description, href) => {
        return buildAffiliateCard(name, imageTag, href, description) || _match;
      }
    );

    // Fallback: broad matcher for legacy chunks where CTA is wrapped in <strong><a>
    // and image/description may share one paragraph.
    const broadLegacyPattern = /<h3[^>]*>\s*<strong[^>]*>([^<]+?)<\/strong>\s*<\/h3>\s*<p[^>]*>[\s\S]*?ASIN:\s*([^<]+?)[\s\S]*?<\/p>\s*<p[^>]*>[\s\S]*?(\$[^<]+?)[\s\S]*?<\/p>\s*<p[^>]*>[\s\S]*?(<img[^>]+>)[\s\S]*?(?:<span[^>]*>)?([^<]*?)?(?:<\/span>)?[\s\S]*?<\/p>\s*<p[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?<\/p>/gi;

    upgraded = upgraded.replace(
      broadLegacyPattern,
      (_match, name, _asin, _price, imageTag, description, href) => {
        return buildAffiliateCard(name, imageTag, href, description) || _match;
      }
    );

    // Final cleanup for legacy chunks that still pass through:
    // remove ASIN and standalone price lines when they are attached to affiliate CTA blocks.
    upgraded = upgraded
      .replace(
        /<p[^>]*>\s*(?:<span[^>]*>)?\s*ASIN:\s*[^<]+(?:<\/span>)?\s*<\/p>(?=[\s\S]{0,500}<a[^>]*href="[^"]*(?:amzn\.to|amazon\.)[^"]*"[^>]*>)/gi,
        ''
      )
      .replace(
        /<p[^>]*>\s*(?:<strong[^>]*>)?\s*\$\s*[0-9][0-9,\.]*(?:<\/strong>)?\s*<\/p>(?=[\s\S]{0,250}<a[^>]*href="[^"]*(?:amzn\.to|amazon\.)[^"]*"[^>]*>)/gi,
        ''
      )
      .replace(
        /(<a[^>]*href="[^"]*(?:amzn\.to|amazon\.)[^"]*"[^>]*>)([\s\S]*?)(<\/a>)/gi,
        '$1CHECK PRICE ON AMAZON$3'
      );

    return upgraded;
  };

  const normalizedContent = upgradeLegacyAffiliateBlocks(renderContent() || '');
  const cmsCta = (post as any).cta;
  const articleCta = cmsCta?.enabled
    ? {
        title: cmsCta.title || 'Ready To Upgrade Your Riding Gear?',
        description: cmsCta.description || 'Check the latest prices and deals before your next shift.',
        primaryHref: cmsCta.primaryHref || '',
        primaryLabel: cmsCta.primaryLabel || 'Compare All Options',
        secondaryHref: cmsCta.secondaryHref || undefined,
        secondaryLabel: cmsCta.secondaryLabel || undefined,
      }
    : null;
  const estimatedReadTime =
    typeof post.readTime === 'number' && post.readTime > 0
      ? post.readTime
      : estimateReadTimeFromHtml(normalizedContent);
  const publishedIso = toIsoDate(post.publishedAt) || '1970-01-01T00:00:00.000Z';
  const updatedIso = toIsoDate((post as any).updatedAt || post.publishedAt) || publishedIso;

  const articlePath = `/${category}/${slug}`;
  const articleSchemas: Array<Record<string, unknown>> = [
    buildBlogPostingSchema({
      url: articlePath,
      title: post.title,
      description: post.excerpt,
      image: featuredImageUrl,
      datePublished: publishedIso,
      dateModified: updatedIso,
      category: post.category,
      tags: post.tags,
    }),
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: post.category, url: `/category/${post.categorySlug}` },
      { name: post.title, url: articlePath },
    ]),
  ];

  const amazonProducts = (post as any).amazonProducts;
  if (Array.isArray(amazonProducts)) {
    amazonProducts.forEach((product) => {
      if (!product?.productTitle || !product?.affiliateLink) return;
      articleSchemas.push(
        buildProductSchema({
          name: product.productTitle,
          url: product.affiliateLink,
          image: product.image,
          description: product.description,
          price: product.price,
        })
      );
    });
  }

  return (
    <main className="bg-white" id="top">
      <SeoJsonLd data={articleSchemas} />
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-xs sm:text-sm text-amber-900 text-center">
            <strong className="font-semibold">Disclosure:</strong> This post contains affiliate links.
            If you make a purchase through these links, we may earn a commission at no extra cost to you.
          </p>
        </div>
      </div>

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
                href={`/category/${post.categorySlug}`}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div>
          <article className="w-full min-w-0">
            <header className="mb-8 md:mb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              )}

              <div className="py-4 border-t border-b border-gray-200">
                <ArticleAuthorBox
                  publishedLabel={formatDateAbsolute(post.publishedAt)}
                  readTimeLabel={`${estimatedReadTime} min read`}
                />
              </div>
            </header>

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

            <div className="w-full max-w-full" style={{ maxWidth: '100%' }}>
              <TableWrapper>
                <div
                className="
                  w-full
                  prose prose-base sm:prose-lg !max-w-none
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
                  [&>*]:!max-w-none [&_table]:w-full
                  break-words
                "
                  dangerouslySetInnerHTML={{ __html: normalizedContent }}
                />
              </TableWrapper>
            </div>

            {articleCta && articleCta.primaryHref && (
              <ArticleBottomCta
                title={articleCta.title}
                description={articleCta.description}
                primaryHref={articleCta.primaryHref}
                primaryLabel={articleCta.primaryLabel}
                secondaryHref={articleCta.secondaryHref}
                secondaryLabel={articleCta.secondaryLabel}
              />
            )}

            {post.tags && post.tags.length > 0 && (
              <section className="mt-12 md:mt-16 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  Tags
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

            <div className="mt-16 md:mt-20 text-center">
              <a
                href="#top"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#CC0000] transition-colors"
              >
                Back to Top
              </a>
            </div>
          </article>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-16 md:mt-20 lg:mt-24 pt-12 border-t border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#CC0000] rounded-full" />
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
                    href={`/${p.dbCategorySlug}/${p.slug}`}
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
                        Read More -&gt;
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
