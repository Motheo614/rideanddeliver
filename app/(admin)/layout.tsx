import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Admin Dashboard',
  description: 'Internal Rider Complex admin dashboard.',
  path: '/admin',
  noIndex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
