import type { Post } from './types';

export function getPostHref(post: Pick<Post, 'dbCategorySlug' | 'categorySlug' | 'slug'>) {
  return `/${post.dbCategorySlug || post.categorySlug}/${post.slug}`;
}

export function getPostImageUrl(post: Pick<Post, 'featuredImage'>): string {
  const img = post.featuredImage as unknown;
  if (typeof img === 'string') return img;
  return (img as { url?: string } | null | undefined)?.url || '';
}

export function formatReadTime(raw?: string): string {
  const value = (raw || '').toString().trim();
  if (!value) return '5 min read';
  if (/min\s+read/i.test(value)) return value;
  const minutes = value.match(/\d+/)?.[0];
  return minutes ? `${minutes} min read` : value;
}
