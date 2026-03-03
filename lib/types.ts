export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  publishedAt: string;
  readTime: string;
  featuredImage: string;
  featured: boolean;
  trending: boolean;
  editorsPick: boolean;
  affiliateLinks?: {
    label: string;
    url: string;
    price?: string;
  }[];
  content: string;
}
