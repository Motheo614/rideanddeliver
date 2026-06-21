import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Admin Dashboard',
  description: 'Internal Rider Complex admin dashboard.',
  path: '/admin',
  noIndex: true,
});

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
