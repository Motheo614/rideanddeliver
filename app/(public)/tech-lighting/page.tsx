import HubPage from '@/components/HubPage';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Bike Delivery Tech and Visibility',
  description: 'See the best bike lights, dash cams, and phone mounts to improve rider visibility and shift efficiency.',
  path: '/tech-lighting/',
  keywords: ['delivery rider lights', 'bike dash cams', 'phone mounts for delivery riders'],
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

function parsePageParam(pageParam?: string) {
  const parsed = Number.parseInt(pageParam || '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function TechLightingPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = parsePageParam(page);

  return (
    <HubPage
      title="Tech & Lighting"
      description="Stay connected and stay visible. We review the best dash cams, bike lights, and phone mounts for professional riders."
      categorySlug="tech-lighting"
      intro="Technology is the backbone of a modern delivery business. Whether it's a high-definition dash cam to protect you from liability or a powerful light system that turns night into day, the right tech can make your shifts safer and more efficient. We test the latest gadgets to see which ones actually stand up to the daily grind."
      currentPage={currentPage}
    />
  );
}
