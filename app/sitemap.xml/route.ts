export const dynamic = 'force-dynamic';
export const revalidate = 3600;

function normalizeBaseUrl(siteUrl?: string) {
  const fallback = 'https://www.ridercomplex.com';
  const rawValue = siteUrl?.trim() || fallback;
  const valueWithProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(rawValue)
    ? rawValue
    : `https://${rawValue}`;

  try {
    const parsed = new URL(valueWithProtocol);

    if (parsed.hostname === 'ridercomplex.com') {
      parsed.hostname = 'www.ridercomplex.com';
    }

    return parsed.origin.replace(/\/$/, '');
  } catch {
    return fallback;
  }
}

export async function GET() {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL);
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/bike-delivery-rider-gear', priority: '0.8', changefreq: 'weekly' },
    { url: '/bike-delivery-tech-and-visibility', priority: '0.8', changefreq: 'weekly' },
    { url: '/bike-security-for-delivery-riders', priority: '0.8', changefreq: 'weekly' },
    { url: '/delivery-rider-equipment', priority: '0.8', changefreq: 'weekly' },
    { url: '/delivery-platform-reviews', priority: '0.8', changefreq: 'weekly' },
    { url: '/start-here', priority: '0.9', changefreq: 'monthly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/affiliate-disclaimer', priority: '0.5', changefreq: 'yearly' },
    { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
    { url: '/terms', priority: '0.5', changefreq: 'yearly' },
  ];

  const currentDate = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
