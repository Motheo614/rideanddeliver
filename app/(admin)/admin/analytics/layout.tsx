import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Analytics',
  description: 'Review site analytics in the Rider Complex admin dashboard.',
  path: '/admin/analytics',
  noIndex: true,
});

export default function AdminAnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
