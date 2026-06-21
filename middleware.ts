import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const RESERVED_SINGLE_SEGMENT_ROUTES = new Set([
  'about',
  'admin',
  'affiliate-disclaimer',
  'api',
  'Assets',
  'auth-error',
  'bike-delivery-rider-gear',
  'bike-delivery-tech-and-visibility',
  'bike-security',
  'bike-security-for-delivery-riders',
  'blog',
  'category',
  'contact',
  'delivery-gear',
  'delivery-platform-reviews',
  'delivery-rider-equipment',
  'favicon.ico',
  'forgot-password',
  'free-rider-checklist',
  'llms.txt',
  'login',
  'night-delivery-riding-safety',
  'platform-reviews',
  'privacy-policy',
  'reset-password',
  'robots.txt',
  'safety-gear',
  'sitemap.xml',
  'start-here',
  'tech-lighting',
  'terms',
]);

async function getCanonicalPostUrl(request: NextRequest, slug: string): Promise<URL | null> {
  try {
    const apiUrl = new URL('/api/posts/' + slug, request.url);
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.post || !data.post.dbCategorySlug) {
      return null;
    }

    const canonicalSlug = data.post.slug || slug;
    return new URL(`/${data.post.dbCategorySlug}/${canonicalSlug}`, request.url);
  } catch (error) {
    console.error('Error fetching post for redirect:', error);
    return null;
  }
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /blog/* redirects to new category-based URLs
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '').replace(/\/$/, '');

    if (slug) {
      const canonicalUrl = await getCanonicalPostUrl(request, slug);
      if (canonicalUrl) {
        return withSecurityHeaders(NextResponse.redirect(canonicalUrl, 301));
      }
    }
  }

  // Handle legacy /:slug article URLs and redirect to /:category/:slug
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length === 1) {
    const slug = pathSegments[0];
    const hasFileExtension = slug.includes('.');
    if (!hasFileExtension && !RESERVED_SINGLE_SEGMENT_ROUTES.has(slug)) {
      const canonicalUrl = await getCanonicalPostUrl(request, slug);
      if (canonicalUrl) {
        return withSecurityHeaders(NextResponse.redirect(canonicalUrl, 301));
      }
    }
  }

  // Handle admin routes protection
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request });
    
    if (!token || token.role !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/admin/:path*', '/blog/:path*', '/:slug'],
};
