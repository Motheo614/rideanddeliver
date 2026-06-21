import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Affiliate Links',
  description: 'Manage Rider Complex affiliate links in the admin dashboard.',
  path: '/admin/affiliate-links',
  noIndex: true,
});

export default function AdminAffiliateLinksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
