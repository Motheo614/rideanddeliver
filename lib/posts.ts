import { Post } from './types';

// Base API URL - use environment variable or default to current domain
// During build, use APP_URL, otherwise use empty string for relative URLs
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.APP_URL || 'http://localhost:3000';

/**
 * Fetch options with ISR revalidation (60 seconds)
 */
const fetchOptions: RequestInit = {
  next: { revalidate: 60 },
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
      return [];
    }

    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const url = `${API_BASE}/api/posts/${slug}`;
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
  return getPosts({ status: 'published', category: categorySlug });
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
