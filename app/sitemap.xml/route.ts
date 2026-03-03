import { getPosts } from '@/lib/posts';

export async function GET() {
  const posts = await getPosts({ status: 'published' });
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  
  const staticPages = [
    '',
    '/bike-delivery-rider-gear/',
    '/bike-delivery-tech-and-visibility/',
    '/bike-security-for-delivery-riders/',
    '/delivery-rider-equipment/',
    '/delivery-platform-reviews/',
    '/start-here/',
    '/contact/',
    '/affiliate-disclaimer/',
    '/privacy-policy/',
    '/terms/',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages
        .map((page) => {
          return `
            <url>
              <loc>${baseUrl}${page}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>0.8</priority>
            </url>
          `;
        })
        .join('')}
      ${posts
        .map((post) => {
          return `
            <url>
              <loc>${baseUrl}/blog/${post.slug}/</loc>
              <lastmod>${new Date(post.publishedAt).toISOString()}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>1.0</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
