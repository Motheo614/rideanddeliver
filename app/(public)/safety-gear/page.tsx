import HubPage from '@/components/HubPage';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Safety Gear for Delivery Riders',
  description: 'MIPS helmets, protective clothing, and high-visibility gear tested for real delivery shifts in US cities.',
  path: '/safety-gear/',
  keywords: ['delivery rider safety gear', 'best helmets for delivery riders', 'bike safety equipment'],
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

export default async function SafetyGearPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = parsePageParam(page);

  return (
    <HubPage
      title="Safety Gear"
      description="Protect your most valuable asset: yourself. Expert reviews on helmets, protective clothing, and safety practices."
      categorySlug="safety-gear"
      intro="For bike delivery riders, safety isn't just a priority-it's a necessity. Navigating busy city streets for hours on end exposes you to risks that casual cyclists rarely face. In this section, we dive deep into the gear that keeps you safe, from MIPS-equipped helmets to high-visibility apparel that ensures you're seen by every driver on the road."
      currentPage={currentPage}
    />
  );
}
