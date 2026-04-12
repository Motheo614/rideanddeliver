import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'New Post',
  description: 'Create a new post in the Rider Complex admin dashboard.',
  path: '/admin/posts/new',
  noIndex: true,
});

export default function AdminNewPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
