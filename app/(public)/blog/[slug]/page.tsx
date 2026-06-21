import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getPostBySlug } from '@/lib/posts';
import { buildArticleMetadata } from '@/lib/seo/metadata';

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

  return buildArticleMetadata({
    title: `${post.title} | Rider Complex`,
    description: post.excerpt,
    path: `/${post.dbCategorySlug || post.categorySlug}/${slug}`,
    image: featuredImageUrl,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: (post as any).updatedAt,
    section: post.category,
    tags: post.tags,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const canonicalPath = `/${post.dbCategorySlug || post.categorySlug}/${slug}`;
  permanentRedirect(canonicalPath);
}
