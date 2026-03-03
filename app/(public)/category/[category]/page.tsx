import React from 'react';
import ArticleCard from '@/components/ArticleCard';
import SectionHeading from '@/components/SectionHeading';
import { getPostsByCategory } from '@/lib/posts';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;
  
  // Fetch posts from API
  const categoryPosts = await getPostsByCategory(categorySlug);

  if (categoryPosts.length === 0) {
    notFound();
  }

  const categoryName = categoryPosts[0]?.category || 'Category';

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <SectionHeading title={`Category: ${categoryName}`} />
        <div className="max-w-4xl">
          {categoryPosts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}
