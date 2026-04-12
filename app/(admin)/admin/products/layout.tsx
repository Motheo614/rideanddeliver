import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Products',
  description: 'Manage products in the Rider Complex admin dashboard.',
  path: '/admin/products',
  noIndex: true,
});

export default function AdminProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
