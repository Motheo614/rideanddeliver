export const dynamic = 'force-dynamic';
export const revalidate = 3600;

import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';

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
    { url: '/safety-gear', priority: '0.8', changefreq: 'weekly' },
    { url: '/tech-lighting', priority: '0.8', changefreq: 'weekly' },
    { url: '/bike-security', priority: '0.8', changefreq: 'weekly' },
    { url: '/delivery-gear', priority: '0.8', changefreq: 'weekly' },
    { url: '/platform-reviews', priority: '0.8', changefreq: 'weekly' },
    { url: '/start-here', priority: '0.9', changefreq: 'monthly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/affiliate-disclaimer', priority: '0.5', changefreq: 'yearly' },
    { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
    { url: '/terms', priority: '0.5', changefreq: 'yearly' },
  ];

  const currentDate = new Date().toISOString();

  let articleEntries = '';
  try {
    await connectDB();

    const articles = await Post.find({ status: 'published' })
      .select('slug category updatedAt publishedAt')
      .sort({ publishedAt: -1 })
      .lean();

    articleEntries = articles
      .filter((article) => Boolean(article?.slug) && Boolean(article?.category))
      .map((article) => {
        const lastModified = new Date((article as any).updatedAt || (article as any).publishedAt || currentDate).toISOString();

        return `  <url>
    <loc>${baseUrl}/${(article as any).category}/${(article as any).slug}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      })
      .join('\n');
  } catch (error) {
    console.error('Failed to include dynamic article URLs in sitemap:', error);
  }

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
${articleEntries ? `\n${articleEntries}` : ''}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
