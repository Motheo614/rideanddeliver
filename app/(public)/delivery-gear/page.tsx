import HubPage from '@/components/HubPage';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Delivery Rider Equipment Reviews',
  description: 'Compare delivery bags, backpacks, and rider equipment that improve speed, durability, and customer ratings.',
  path: '/delivery-gear/',
  keywords: ['delivery rider equipment', 'best delivery bags', 'rider backpack reviews'],
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

export default async function DeliveryGearPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = parsePageParam(page);

  return (
    <HubPage
      title="Delivery Gear"
      description="The tools of the trade. From insulated bags to ergonomic backpacks, we find the gear that helps you deliver better."
      categorySlug="delivery-gear"
      intro="The right delivery gear can be the difference between a 5-star rating and a cold meal. We look at the best insulated bags, waterproof panniers, and comfortable backpacks designed to carry heavy loads across the city. Efficiency and durability are our top priorities when testing this equipment."
      currentPage={currentPage}
    />
  );
}
