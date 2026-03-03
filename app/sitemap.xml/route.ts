import { connectToDatabase } from '@/lib/db/mongoose';
import { Post } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  let posts: any[] = [];
  
  // Fetch posts directly from database during generation
  try {
    await connectToDatabase();
    posts = await Post.find({ status: 'published' })
      .select('slug publishedAt')
      .sort({ publishedAt: -1 })
      .lean();
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://motheo614-ride-and-deliver.vercel.app';
  
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
