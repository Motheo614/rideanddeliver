import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Settings',
  description: 'Manage Rider Complex admin settings.',
  path: '/admin/settings',
  noIndex: true,
});

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
