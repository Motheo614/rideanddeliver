export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  dbCategorySlug: string; // Database category enum for blog post URLs
  publishedAt: string;
  readTime: string;
  featuredImage: string;
  featured: boolean;
  trending: boolean;
  editorsPick: boolean;
  isEditorsPick?: boolean;
  productBlocks?: Array<{
    blockType: 'accent' | 'hero';
    productId: string;
    product?: {
      _id?: string;
      productName?: string;
      affiliateLink?: string;
      imageUrl?: string;
      awardLabel?: string;
      score?: number;
      reviewCount?: number;
      stars?: number;
      pros?: string[];
      cons?: string[];
      specs?: Array<{ label: string; value: string }>;
      editorNote?: string;
      jumpTargetId?: string;
      description?: string;
    } | null;
  }>;
  tags?: string[];
  affiliateLinks?: {
    label: string;
    url: string;
    price?: string;
  }[];
  cta?: {
    enabled: boolean;
    title?: string;
    description?: string;
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
  };
  content: string;
}
