import React from 'react';
import { Metadata } from 'next';
import ArticleCard from '@/components/ArticleCard';
import SectionHeading from '@/components/SectionHeading';
import { getPostsByCategory } from '@/lib/posts';
import { notFound } from 'next/navigation';
import SeoJsonLd from '@/components/SeoJsonLd';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildItemListSchema,
} from '@/lib/seo/schema';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const posts = await getPostsByCategory(category);
  const categoryName = posts[0]?.category || category.replace(/-/g, ' ');

  return buildPageMetadata({
    title: `${categoryName} Guides for Delivery Riders`,
    description: `Explore ${categoryName} recommendations, comparisons, and buyer-focused reviews for US gig riders.`,
    path: `/category/${category}`,
    image: '/Assets/Logo.png',
    keywords: ['delivery rider guides', `${categoryName} gear`, 'gig rider buying guide'],
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;
  
  // Fetch posts from API
  const categoryPosts = await getPostsByCategory(categorySlug);

  if (categoryPosts.length === 0) {
    notFound();
  }

  const categoryName = categoryPosts[0]?.category || 'Category';
  const categoryPath = `/category/${categorySlug}`;

  const categorySchemas = [
    buildCollectionPageSchema(
      categoryPath,
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
        <SectionHeading title={`Category: ${categoryName}`} />
        <div className="max-w-4xl">
          {categoryPosts.map((post) => (
            <ArticleCard key={post.slug} post={post} useAbsoluteUpperDate swapDateWithReadTime />
          ))}
        </div>
      </div>
    </main>
  );
}
