import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'New Product',
  description: 'Create a new product in the Rider Complex admin dashboard.',
  path: '/admin/products/new',
  noIndex: true,
});

export default function AdminNewProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
