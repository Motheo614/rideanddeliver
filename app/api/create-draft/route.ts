import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import { generateSlugFromTitle } from '@/lib/slug';
import { CATEGORY_MAP } from '@/lib/categoryMap';

const VALID_CATEGORIES = [
  'safety-gear',
  'tech-lighting',
  'bike-security',
  'delivery-gear',
  'platform-reviews',
] as const;

type ValidCategory = (typeof VALID_CATEGORIES)[number];

function stripMarkdown(md: string): string {
  return (md || '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_`~]+/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>+\s?/gm, '')
    .replace(/---+/g, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateExcerpt(content: string): string {
  const plain = stripMarkdown(content);
  if (plain.length <= 800) return plain;
  const truncated = plain.slice(0, 797);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 600 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

/**
 * POST /api/create-draft
 * Internal endpoint for n8n automation to create draft blog posts.
 * Authenticated via DRAFT_API_KEY bearer token.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.DRAFT_API_KEY;

  if (!apiKey) {
    console.error('[create-draft] DRAFT_API_KEY is not configured');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization') || '';
  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { title, content, metaDescription, heroImageUrl, altText, focusKeyword, category, products } = body as {
    title?: string;
    content?: string;
    metaDescription?: string;
    heroImageUrl?: string;
    altText?: string;
    focusKeyword?: string;
    category?: string;
    products?: unknown[];
  };

  // Validate required fields
  const missing: string[] = [];
  if (!title) missing.push('title');
  if (!content) missing.push('content');
  if (!metaDescription) missing.push('metaDescription');
  if (!heroImageUrl) missing.push('heroImageUrl');
  if (!category) missing.push('category');

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    );
  }

  if (!VALID_CATEGORIES.includes(category as ValidCategory)) {
    return NextResponse.json(
      { error: `Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}` },
      { status: 400 }
    );
  }

  const amazonProducts = Array.isArray(products)
    ? products.map((p: any) => ({
        productTitle: String(p.productTitle || p.name || ''),
        asin: String(p.asin || ''),
        affiliateLink: String(p.affiliateLink || p.link || ''),
        price: String(p.price || ''),
        image: String(p.image || p.imageUrl || ''),
        description: String(p.description || ''),
      }))
    : [];

  try {
    await connectDB();

    const categoryInfo = CATEGORY_MAP[category as ValidCategory];
    const excerpt = generateExcerpt(content as string);
    const slug = generateSlugFromTitle(title as string);

    const post = new Post({
      title,
      slug,
      excerpt,
      content,
      featuredImage: {
        url: heroImageUrl,
        alt: altText || title,
      },
      category,
      categoryLabel: categoryInfo?.displayName || category,
      tags: focusKeyword ? [focusKeyword] : [],
      amazonProducts,
      seoMetadata: {
        metaTitle: title,
        metaDescription,
        keywords: focusKeyword ? [focusKeyword] : [],
      },
      status: 'draft',
      views: 0,
      featured: false,
      trending: false,
      editorsPick: false,
    });

    await post.save();

    const postId = String(post._id);
    const canonicalUrl = `/${categoryInfo?.urlSlug || category}/${post.slug}`;

    return NextResponse.json(
      {
        id: postId,
        slug: post.slug,
        url: canonicalUrl,
        message: 'Draft created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[create-draft] Error saving post:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A post with this title/slug already exists' },
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {})
        .map((e: any) => e.message)
        .join(', ');
      return NextResponse.json({ error: `Validation failed: ${messages}` }, { status: 400 });
    }

    return NextResponse.json(
      { error: `Failed to create draft: ${error.message}` },
      { status: 500 }
    );
  }
}
