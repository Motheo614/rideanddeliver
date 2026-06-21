import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return buildPageMetadata({
    title: 'Edit Post',
    description: 'Edit an existing post in the Rider Complex admin dashboard.',
    path: `/admin/posts/${id}/edit`,
    noIndex: true,
  });
}

export default function AdminEditPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
