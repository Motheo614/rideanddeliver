export function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const siteUrl = rawUrl.replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production') {
    try {
      const hostname = new URL(siteUrl).hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1') {
        console.error(`Production site URL resolves to localhost (${siteUrl}). Set NEXT_PUBLIC_SITE_URL or NEXTAUTH_URL to the production URL.`);
      }
    } catch {
      console.error(`Production site URL is invalid (${siteUrl}). Set NEXT_PUBLIC_SITE_URL or NEXTAUTH_URL to the production URL.`);
    }
  }

  return siteUrl;
}
