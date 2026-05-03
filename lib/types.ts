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
