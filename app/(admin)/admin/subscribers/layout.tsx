import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Subscribers',
  description: 'Manage newsletter subscribers in the Rider Complex admin dashboard.',
  path: '/admin/subscribers',
  noIndex: true,
});

export default function AdminSubscribersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
