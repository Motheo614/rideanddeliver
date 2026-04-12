import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Users',
  description: 'Manage admin users and roles in the Rider Complex dashboard.',
  path: '/admin/users',
  noIndex: true,
});

export default function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
