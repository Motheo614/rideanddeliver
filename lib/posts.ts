import { Post } from './types';
import { getCategoryInfoByUrlSlug } from './categoryMap';

export interface PostsPageResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

function isLocalhostUrl(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

function getApiBase() {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const appUrl = process.env.APP_URL;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  // Browser can use relative URLs unless explicitly configured.
  if (typeof window !== 'undefined') {
    return publicApiUrl || '';
  }

  // In local dev, always prefer the active runtime port when available.
  if (!isProduction && process.env.PORT) {
    return `http://localhost:${process.env.PORT}`;
  }

  // In production server contexts, ignore localhost-style URLs.
  if (publicApiUrl && !(isProduction && isLocalhostUrl(publicApiUrl))) {
    return publicApiUrl;
  }

  if (siteUrl && !(isProduction && isLocalhostUrl(siteUrl))) {
    return siteUrl;
  }

  // Prefer explicit canonical site URLs before Vercel deployment hostnames.
  if (appUrl && !(isProduction && isLocalhostUrl(appUrl))) {
    return appUrl;
  }

  if (nextAuthUrl && !(isProduction && isLocalhostUrl(nextAuthUrl))) {
    return nextAuthUrl;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (isProduction) {
    return 'https://www.ridercomplex.com';
  }

  return 'http://localhost:3000';
}

const API_BASE = getApiBase();

/**
 * Fetch options with ISR revalidation (30 seconds)
 */
const fetchOptions: RequestInit = {
  next: { revalidate: 30 },
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Fetch all posts with optional filters
 */
export async function getPosts(options?: {
  status?: string;
  category?: string;
  limit?: number;
  page?: number;
}): Promise<Post[]> {
  const data = await getPostsPage(options);
  return data.posts;
}

/**
 * Fetch posts with pagination metadata
 */
export async function getPostsPage(options?: {
  status?: string;
  category?: string;
  limit?: number;
  page?: number;
}): Promise<PostsPageResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.category) params.append('category', options.category);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.page) params.append('page', options.page.toString());

    const url = `${API_BASE}/api/posts${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      console.error('Failed to fetch posts:', response.statusText);
      return {
        posts: [],
        total: 0,
        page: options?.page || 1,
        totalPages: 0,
      };
    }

    const data = await response.json();
    return {
      posts: data.posts || [],
      total: data.total || 0,
      page: data.page || options?.page || 1,
      totalPages: data.totalPages || 0,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      posts: [],
      total: 0,
      page: options?.page || 1,
      totalPages: 0,
    };
  }
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const url = `${API_BASE}/api/posts/${encodeURIComponent(slug)}`;
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.post || null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

/**
 * Fetch posts by category slug
 */
export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  // Convert URL slug to database category enum
  const categoryInfo = getCategoryInfoByUrlSlug(categorySlug);
  const dbCategory = categoryInfo?.slug || categorySlug;
  
  return getPosts({ status: 'published', category: dbCategory });
}

/**
 * Fetch posts by category slug with pagination metadata
 */
export async function getPostsByCategoryPage(
  categorySlug: string,
  page = 1,
  limit = 10
): Promise<PostsPageResponse> {
  const categoryInfo = getCategoryInfoByUrlSlug(categorySlug);
  const dbCategory = categoryInfo?.slug || categorySlug;

  return getPostsPage({
    status: 'published',
    category: dbCategory,
    page,
    limit,
  });
}

/**
 * Fetch latest published posts
 */
export async function getLatestPosts(limit = 10): Promise<Post[]> {
  return getPosts({ status: 'published', limit });
}

/**
 * Fetch featured post
 */
export async function getFeaturedPost(): Promise<Post | null> {
  try {
    const url = `${API_BASE}/api/posts/featured`;
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.post || null;
  } catch (error) {
    console.error('Error fetching featured post:', error);
    return null;
  }
}

/**
 * Fetch trending posts
 */
export async function getTrendingPosts(): Promise<Post[]> {
  try {
    const url = `${API_BASE}/api/posts/trending`;
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return [];
  }
}

/**
 * Fetch editor's picks
 */
export async function getEditorsPicks(): Promise<Post[]> {
  try {
    const url = `${API_BASE}/api/posts/editors-picks`;
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching editor\'s picks:', error);
    return [];
  }
}

/**
 * Increment post view count (client-side)
 */
export async function incrementPostViews(postId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
}
