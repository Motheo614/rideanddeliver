import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Posts',
  description: 'Manage published and draft posts in the Rider Complex admin dashboard.',
  path: '/admin/posts',
  noIndex: true,
});

export default function AdminPostsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
