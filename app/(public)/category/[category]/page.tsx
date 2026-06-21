import React from 'react';
import { Metadata } from 'next';
import ArticleCard from '@/components/ArticleCard';
import CategoryPagination from '@/components/CategoryPagination';
import SectionHeading from '@/components/SectionHeading';
import { getPostsByCategoryPage } from '@/lib/posts';
import { notFound } from 'next/navigation';
import SeoJsonLd from '@/components/SeoJsonLd';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildItemListSchema,
} from '@/lib/seo/schema';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getCategoryInfoByUrlSlug } from '@/lib/categoryMap';

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

const POSTS_PER_PAGE = 10;

function parsePageParam(pageParam?: string) {
  const parsed = Number.parseInt(pageParam || '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category } = await params;
  const { page } = await searchParams;
  const currentPage = parsePageParam(page);
  const categoryInfo = getCategoryInfoByUrlSlug(category);
  const categoryName = categoryInfo?.displayName || category.replace(/-/g, ' ');
  const pageSuffix = currentPage > 1 ? ` - Page ${currentPage}` : '';

  return buildPageMetadata({
    title: `${categoryName} Guides for Delivery Riders${pageSuffix}`,
    description: `Explore ${categoryName} recommendations, comparisons, and buyer-focused reviews for US gig riders.`,
    path: `/category/${category}`,
    image: '/Assets/Logo.png',
    keywords: ['delivery rider guides', `${categoryName} gear`, 'gig rider buying guide'],
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: categorySlug } = await params;
  const { page } = await searchParams;
  const currentPage = parsePageParam(page);
  
  // Fetch posts from API with pagination.
  const categoryData = await getPostsByCategoryPage(categorySlug, currentPage, POSTS_PER_PAGE);
  const categoryPosts = categoryData.posts;

  if (categoryData.totalPages > 0 && currentPage > categoryData.totalPages) {
    notFound();
  }

  if (categoryPosts.length === 0 && currentPage === 1) {
    notFound();
  }

  const categoryInfo = getCategoryInfoByUrlSlug(categorySlug);
  const categoryName = categoryInfo?.displayName || categoryPosts[0]?.category || 'Category';
  const categoryPath = `/category/${categorySlug}`;
  const categoryPagePath = currentPage > 1 ? `${categoryPath}?page=${currentPage}` : categoryPath;

  const categorySchemas = [
    buildCollectionPageSchema(
      categoryPagePath,
      `Category: ${categoryName}`,
      `Latest guides and recommendations for ${categoryName}.`
    ),
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: categoryName, url: categoryPath },
    ]),
    buildItemListSchema(
      categoryPosts.map((post) => ({
        name: post.title,
        url: `/${post.dbCategorySlug || post.categorySlug}/${post.slug}`,
      }))
    ),
  ];

  return (
    <main className="min-h-screen bg-white">
      <SeoJsonLd data={categorySchemas} />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] mb-6 leading-tight">
          {categoryName} Guides for Delivery Riders
        </h1>
        <SectionHeading title={`Latest in ${categoryName}`} />
        <div className="max-w-4xl">
          {categoryPosts.map((post) => (
            <ArticleCard key={post.slug} post={post} useAbsoluteUpperDate swapDateWithReadTime />
          ))}

          <CategoryPagination
            currentPage={currentPage}
            totalPages={categoryData.totalPages}
            basePath={categoryPath}
          />
        </div>
      </div>
    </main>
  );
}
