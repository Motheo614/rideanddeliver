import React from 'react';
import AffiliateBox from '@/components/AffiliateBox';

interface AccentCardProps {
  id?: string;
  productName?: string;
  affiliateUrl?: string;
  imageUrl?: string;
  awardLabel?: string;
  score?: number;
  reviewCount?: number;
  stars?: number;
}

export default function AccentCard({
  id,
  productName,
  affiliateUrl,
  imageUrl,
  awardLabel,
  score,
  reviewCount,
  stars,
}: AccentCardProps) {
  return (
    <div id={id} className="my-8 md:my-10 scroll-mt-24">
      <AffiliateBox
        productName={productName}
        affiliateUrl={affiliateUrl}
        image={imageUrl}
        awardLabel={awardLabel}
        score={score}
        reviewCount={reviewCount}
        stars={stars}
      />
    </div>
  );
}
