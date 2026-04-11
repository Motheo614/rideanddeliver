import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Authentication Error',
  description: 'Authentication error page for Rider Complex admin access.',
  path: '/auth-error',
  noIndex: true,
});

export default function AuthErrorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
