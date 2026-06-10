import HubPage from '@/components/HubPage';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Bike Security for Delivery Riders',
  description: 'Find top U-locks, chain locks, and GPS trackers to prevent theft and protect your delivery income.',
  path: '/bike-security/',
  keywords: ['bike security for delivery riders', 'best bike locks', 'delivery bike theft prevention'],
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

export default async function BikeSecurityPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = parsePageParam(page);

  return (
    <HubPage
      title="Bike Security"
      description="Your bike is your livelihood. Learn how to protect it with the world's toughest locks and smartest GPS trackers."
      categorySlug="bike-security"
      intro="Bike theft is the ultimate nightmare for a delivery rider. A stolen bike doesn't just mean a financial loss; it means you can't work. We review heavy-duty U-locks, chain locks, and the latest in GPS tracking technology to give you peace of mind when you have to leave your bike for a drop-off."
      currentPage={currentPage}
    />
  );
}
