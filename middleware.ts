import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
      try {
        // Fetch the post to get its category
        const apiUrl = new URL('/api/posts/' + slug, request.url);
        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.post && data.post.dbCategorySlug) {
            // Redirect to new category-based URL
            const canonicalSlug = data.post.slug || slug;
            const newUrl = new URL(`/${data.post.dbCategorySlug}/${canonicalSlug}`, request.url);
            return withSecurityHeaders(NextResponse.redirect(newUrl, 301)); // Permanent redirect
          }
        }
      } catch (error) {
        console.error('Error fetching post for redirect:', error);
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
  matcher: ['/admin/:path*', '/blog/:path*'],
};
