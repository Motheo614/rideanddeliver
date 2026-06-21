import HubPage from '@/components/HubPage';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Delivery Platform Reviews for Gig Riders',
  description: 'Read rider-focused platform comparisons and earnings breakdowns for Uber Eats, DoorDash, Grubhub, and more.',
  path: '/platform-reviews/',
  keywords: ['delivery platform reviews', 'Uber Eats vs DoorDash', 'gig rider earnings'],
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

export default async function PlatformReviewsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = parsePageParam(page);

  return (
    <HubPage
      title="Platform Reviews"
      description="Know where to work. Honest reviews and earning breakdowns for Uber Eats, DoorDash, Deliveroo, and more."
      categorySlug="platform-reviews"
      intro="Not all delivery platforms are created equal. Pay structures, bonus incentives, and app reliability vary wildly between companies. We provide transparent reviews and real-world data from riders on the ground to help you decide which platforms are worth your time and which ones to avoid."
      currentPage={currentPage}
    />
  );
}
