import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { Tag, ChevronRight } from 'lucide-react';
import { getPostBySlug, getPostsByCategory } from '@/lib/posts';
import { formatDateAbsolute, stripHeadMetadataTags } from '@/lib/utils';
import { CATEGORY_MAP } from '@/lib/categoryMap';
import ArticleAuthorBox from '@/components/ArticleAuthorBox';
import TableWrapper from '@/components/TableWrapper';
import SeoJsonLd from '@/components/SeoJsonLd';
import ArticleBottomCta from '@/components/ArticleBottomCta';
import NewsletterSignupForm from '@/components/NewsletterSignupForm';
import HeroProductCard from '@/components/HeroProductCard';
import AccentCard from '@/components/AccentCard';
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  buildProductReviewSchema,
  buildRoundupItemListSchema,
  toReviewRatingValue,
  isAmazonHostedImage,
  toAbsoluteUrl,
} from '@/lib/seo/schema';
import { buildArticleMetadata } from '@/lib/seo/metadata';
import { getEditorialDates } from '@/lib/dates';

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

interface ProductRecord {
  _id?: string;
  productName?: string;
  affiliateLink?: string;
  imageUrl?: string;
  awardLabel?: string;
  score?: number;
  pros?: string[];
  cons?: string[];
  specs?: Array<{ label: string; value: string }>;
  editorNote?: string;
  jumpTargetId?: string;
  description?: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  const featuredImageUrl = typeof post.featuredImage === 'string'
    ? post.featuredImage
    : (post.featuredImage as any)?.url;

  return buildArticleMetadata({
    title: `${post.title} | Rider Complex`,
    description: post.excerpt,
    path: `/${category}/${post.slug}`,
    image: featuredImageUrl,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: getEditorialDates(post.publishedAt, (post as any).contentUpdatedAt).dateModified,
    section: post.category,
    tags: post.tags,
  });
}

function normalizeHtmlFragment(input: string) {
  return stripHeadMetadataTags(
    String(input || '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/â€“|–/g, '-')
      .replace(/â€”|—/g, '-')
  );
}

function escapeHtml(value: string) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function BlogPostPage({ params }: Props) {
  const { category, slug } = await params;
  const articlePath = `/${category}/${slug}`;

  if (!CATEGORY_MAP[category]) {
    notFound();
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  if (post.dbCategorySlug !== category) {
    notFound();
  }

  if (post.slug !== slug) {
    redirect(`/${post.dbCategorySlug}/${post.slug}`);
  }

  const categoryPosts = await getPostsByCategory(post.categorySlug);
  const relatedPosts = categoryPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const featuredImageUrl = typeof post.featuredImage === 'string'
    ? post.featuredImage
    : (post.featuredImage as any)?.url;

  const renderContent = () => {
    if (!post.content || typeof post.content !== 'string') return null;
    return normalizeHtmlFragment(post.content);
  };

  const estimateReadTimeFromHtml = (html: string) => {
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = text ? text.split(' ').length : 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  const toIsoDate = (value?: string | Date) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  };

  const amazonProducts = Array.isArray((post as any).amazonProducts)
    ? (post as any).amazonProducts
    : [];
  const productBlocks = Array.isArray((post as any).productBlocks)
    ? (post as any).productBlocks
    : [];
  const isEditorsPick = Boolean((post as any).isEditorsPick ?? (post as any).editorsPick);

  const productMap = Object.fromEntries(
    productBlocks
      .map((block: any) => [
        String(block?.productId || block?.product?._id || '').trim().toLowerCase(),
        block,
      ])
      .filter(([productId]: [string, any]) => Boolean(productId))
  ) as Record<string, { blockType?: 'accent' | 'hero'; productId?: string; product?: ProductRecord }>;

  const toFiniteNumber = (value: unknown, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const productBlockById = new Map(
    productBlocks.map((block: any) => [String(block.productId || block?.product?._id || ''), block])
  );

  const upgradeLegacyAffiliateBlocks = (html: string) => {
    if (!html) return html;
    let heroRenderedFromBlock = false;

    const renderAccentCardHtml = (params: {
      productName: string;
      affiliateUrl: string;
      imageUrl?: string;
      awardLabel?: string;
      score?: number;
      jumpTargetId?: string;
    }) => {
      const safe = (value: string) =>
        String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

      const safeName = safe(params.productName);
      const safeUrl = safe(params.affiliateUrl);
      const safeImageUrl = params.imageUrl ? safe(params.imageUrl) : '';
      const safeAwardLabel = params.awardLabel ? safe(params.awardLabel) : '';
      const scoreValue = Number.isFinite(Number(params.score)) ? Number(params.score) : undefined;
      const ratingValue = scoreValue !== undefined ? toReviewRatingValue(scoreValue) : null;
      const hasMeta = Boolean(safeAwardLabel && scoreValue !== undefined && ratingValue !== null);

      if (!hasMeta) {
        return [
          '<div class="affiliate-product-card" data-product-card="true">',
          safeImageUrl ? `<img src="${safeImageUrl}" alt="${safeName}" />` : '',
          `<h3>${safeName}</h3>`,
          `<div class="affiliate-card-cta"><a href="${safeUrl}" target="_blank" rel="noopener noreferrer sponsored">Check Price</a></div>`,
          '</div>',
        ].join('');
      }

      const starsHtml = Array.from({ length: 5 }, (_unused, index) => {
        const color = index < (ratingValue ?? 0) ? '#CC0000' : '#ddd';
        return `<span style="color:${color};">★</span>`;
      }).join('');

      const jumpHref = params.jumpTargetId ? `#${safe(String(params.jumpTargetId))}` : '#top';
      const scoreColor = Number(scoreValue) >= 8.5 ? '#CC0000' : '#6b7280';

      return `
<div data-product-card="true" style="margin:40px 0;background:#fff;border:1px solid #e2e2e2;border-left:5px solid #CC0000;border-radius:0 8px 8px 0;overflow:hidden;">
  <div style="padding:24px;">
    <div style="display:inline-block;background:#CC0000;color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 10px;border-radius:4px;">${safeAwardLabel}</div>
    <div style="margin-top:16px;background:#f4f4f4;border-radius:6px;height:160px;display:flex;align-items:center;justify-content:center;padding:12px;">
      ${safeImageUrl ? `<img src="${safeImageUrl}" alt="${safeName}" style="max-height:160px;width:auto;object-fit:contain;" />` : '<span style="font-size:14px;color:#9ca3af;">No image available</span>'}
    </div>
    <h3 style="margin:16px 0 0;font-family:'Barlow Condensed',system-ui,-apple-system,sans-serif;font-size:20px;font-weight:800;line-height:1.2;color:#111;text-decoration:underline;">${safeName}</h3>
    <div style="margin-top:10px;display:flex;align-items:center;gap:8px;">
      <span style="font-size:18px;line-height:1;">${starsHtml}</span>
    </div>
    <p style="margin:8px 0 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:${scoreColor};">${Number(scoreValue).toFixed(1)} / 10 Rating</p>
    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer sponsored" style="display:block;margin-top:16px;text-align:center;background:#CC0000;color:#fff;text-decoration:none;border-radius:6px;padding:14px 12px;font-family:'Barlow Condensed',system-ui,-apple-system,sans-serif;font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;">BUY OPTIONS ▾</a>
    <a href="${jumpHref}" style="display:block;margin-top:8px;text-align:center;font-size:12px;color:#6b7280;text-decoration:none;">Jump to review ↓</a>
  </div>
</div>`;
    };

    const renderHeroCardHtml = (product: any) => {
      const safe = (value: string) =>
        String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

      const productName = safe(String(product?.productName || 'Top Pick'));
      const productDescription = safe(String(product?.description || post.excerpt || ''));
      const authorName = safe(String((post as any).author?.name || 'Rider Complex Team'));
      const rawScore = Number(product?.score ?? product?.rating);
      const score = Number.isFinite(rawScore) ? rawScore : undefined;
      const ratingValue = score !== undefined ? toReviewRatingValue(score) : null;
      const imageUrl = safe(String(product?.imageUrl || ''));
      const amazonUrl = safe(String(product?.affiliateLink || '#'));
      const reviewUrl = safe(String(product?.jumpTargetId ? `#${product.jumpTargetId}` : articlePath));
      const editorNote = safe(String(product?.editorNote || 'Top pick selected by the Rider Complex editorial team.'));
      const awardLabel = safe(String(product?.awardLabel || 'Best Overall'));
      const specs = Array.isArray(product?.specs) ? product.specs.slice(0, 8) : [];
      const pros = Array.isArray(product?.pros) ? product.pros.slice(0, 6) : [];
      const cons = Array.isArray(product?.cons) ? product.cons.slice(0, 6) : [];
      const ratingHtml = score !== undefined && ratingValue !== null
        ? `<div style="margin-top:16px;background:#f4f4f4;border-radius:6px;padding:16px;display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start;">
        <div style="color:#CC0000;font-family:'Barlow Condensed',system-ui,-apple-system,sans-serif;font-size:40px;font-weight:900;line-height:1;">${score.toFixed(1)}</div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:#6b7280;">${Array.from({ length: 5 }, (_unused, index) => (index < ratingValue ? '<span style="color:#CC0000;">★</span>' : '<span style="color:#ddd;">★</span>')).join('')}</div>
          <div style="margin-top:8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:${score >= 8.5 ? '#CC0000' : '#6b7280'};">${score.toFixed(1)} / 10 Rating</div>
        </div>
      </div>`
        : '';

      return `
<section data-product-card="true" style="width:100%;border:2px solid #CC0000;border-radius:10px;background:#fff;overflow:hidden;margin:40px 0;">
  <div style="background:#111;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
    <span style="display:inline-block;background:#CC0000;color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 10px;border-radius:4px;">#1 Pick ${new Date(post.publishedAt || Date.now()).getFullYear()}</span>
    <span style="font-size:12px;color:#9ca3af;">Reviewed by ${authorName}</span>
  </div>
  <div style="display:grid;grid-template-columns:1fr;">
    <div style="padding:24px;border-bottom:1px solid #e5e7eb;">
      <h2 style="margin:0;color:#111;font-family:'Barlow Condensed',system-ui,-apple-system,sans-serif;font-size:32px;line-height:1.1;font-weight:900;">${productName}</h2>
      <p style="margin:12px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">${productDescription}</p>
      ${ratingHtml}
      ${specs.length > 0 ? `<div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:8px;">${specs.map((spec: any) => `<span style=\"display:inline-flex;align-items:center;padding:4px 10px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;font-size:11px;font-weight:600;color:#4b5563;\">${safe(`${spec.label}: ${spec.value}`)}</span>`).join('')}</div>` : ''}
      <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <a href="${amazonUrl}" target="_blank" rel="noopener noreferrer sponsored" style="display:inline-flex;align-items:center;justify-content:center;background:#CC0000;color:#fff;text-decoration:none;border-radius:6px;padding:12px 10px;font-family:'Barlow Condensed',system-ui,-apple-system,sans-serif;font-size:18px;font-weight:900;text-transform:uppercase;">BUY ON AMAZON</a>
        <a href="${reviewUrl}" style="display:inline-flex;align-items:center;justify-content:center;border:1px solid #111;color:#111;text-decoration:none;border-radius:6px;padding:12px 10px;font-family:'Barlow Condensed',system-ui,-apple-system,sans-serif;font-size:18px;font-weight:900;text-transform:uppercase;">READ FULL REVIEW</a>
      </div>
    </div>
    <div style="padding:24px;">
      <div style="background:#f4f4f4;border-radius:6px;min-height:220px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
        ${imageUrl ? `<img src="${imageUrl}" alt="${productName}" style="max-height:260px;width:auto;object-fit:contain;" />` : '<span style="font-size:14px;color:#9ca3af;">No image available</span>'}
      </div>
      <div style="margin-top:16px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
        <div style="background:#111;color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:8px 12px;">Quick Verdict</div>
        <div style="padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">Pros</div>
            ${(pros.length > 0 ? pros : ['Strong all-around performance']).map((pro: string) => `<div style=\"font-size:12px;color:#374151;line-height:1.5;margin-bottom:4px;\"><span style=\"color:#CC0000;font-weight:700;\">✓</span> ${safe(pro)}</div>`).join('')}
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">Cons</div>
            ${(cons.length > 0 ? cons : ['Premium pricing']).map((con: string) => `<div style=\"font-size:12px;color:#374151;line-height:1.5;margin-bottom:4px;\"><span style=\"color:#6b7280;font-weight:700;\">✗</span> ${safe(con)}</div>`).join('')}
          </div>
        </div>
      </div>
      <div style="margin-top:14px;background:#fff8f8;border:1px solid #f5c0c0;border-radius:6px;padding:12px;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#7f1d1d;font-style:italic;">🏆 ${editorNote}</p>
      </div>
      <div style="margin-top:8px;font-size:10px;font-weight:700;text-transform:uppercase;color:#CC0000;letter-spacing:.05em;">${awardLabel}</div>
    </div>
  </div>
</section>`;
    };

    const replaceProductPlaceholders = (input: string) => {
      return input.replace(
        /<div[^>]*data-product-block=["']true["'][^>]*>[\s\S]*?blockType:\s*(?:accent|hero)\s*·\s*productId:[\s\S]*?<\/div>/gi,
        (placeholderHtml) => {
          const productIdMatch = placeholderHtml.match(/data-product-id=["']([^"']+)["']/i);
          const blockTypeMatch = placeholderHtml.match(/data-block-type=["'](accent|hero)["']/i);
          const productNameMatch = placeholderHtml.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);

          const productId = String(productIdMatch?.[1] || '').trim();
          const placeholderName = String(productNameMatch?.[1] || 'Product').replace(/<[^>]*>/g, '').trim();
          const requestedType = (blockTypeMatch?.[1]?.toLowerCase() === 'hero' ? 'hero' : 'accent') as 'accent' | 'hero';
          const effectiveType = !isEditorsPick
            ? 'accent'
            : (requestedType === 'hero' && !heroRenderedFromBlock ? 'hero' : 'accent');

          if (effectiveType === 'hero') {
            heroRenderedFromBlock = true;
          }

          const block = productBlockById.get(productId) as any;
          const product = block?.product || null;

          if (effectiveType === 'hero') {
            return renderHeroCardHtml(product || { productName: placeholderName, affiliateLink: '#' });
          }

          return renderAccentCardHtml({
            productName: String(product?.productName || placeholderName || 'Product'),
            affiliateUrl: String(product?.affiliateLink || '#'),
            imageUrl: String(product?.imageUrl || ''),
            awardLabel: product?.awardLabel,
            score: toFiniteNumber(product?.score ?? product?.rating, NaN),
            jumpTargetId: String(product?.jumpTargetId || ''),
          });
        }
      );
    };

    const buildAffiliateCard = (
      name: string,
      imageTag: string,
      href: string,
      description?: string
    ) => {
      const trimmedName = String(name || '').trim();
      const trimmedHref = String(href || '').trim();
      const trimmedDescription = String(description || '').trim();

      if (!trimmedName || !trimmedHref || !imageTag) {
        return '';
      }

      const extractImageSrc = (rawImageTag: string) => {
        const match = rawImageTag.match(/src=["']([^"']+)["']/i);
        return match?.[1]?.trim();
      };

      const escapeHtml = (value: string) => {
        return value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      };

      const toNumberOrUndefined = (value: unknown) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      };

      const matchedProduct = amazonProducts.find((product: any) => {
        const productLink = String(product?.affiliateLink || '').trim();
        const productTitle = String(product?.productTitle || '').trim().toLowerCase();

        return productLink === trimmedHref || productTitle === trimmedName.toLowerCase();
      });

      const score = toNumberOrUndefined(matchedProduct?.score ?? matchedProduct?.ratingScore ?? matchedProduct?.rating);
      const awardLabel = String(matchedProduct?.awardLabel || matchedProduct?.award || '').trim() || undefined;
      const imageSrc = String(matchedProduct?.image || '').trim() || extractImageSrc(imageTag) || undefined;

      if (awardLabel && typeof score === 'number' && toReviewRatingValue(score) !== null) {
        const ratingValue = toReviewRatingValue(score) ?? 1;
        const starsHtml = Array.from({ length: 5 }, (_unused, index) => {
          const color = index < ratingValue ? '#CC0000' : '#ddd';
          return `<span style="color:${color};">★</span>`;
        }).join('');
        const safeName = escapeHtml(trimmedName);
        const safeHref = escapeHtml(trimmedHref);
        const safeAwardLabel = escapeHtml(awardLabel);
        const safeImageSrc = imageSrc ? escapeHtml(imageSrc) : '';
        const scoreColor = score >= 8.5 ? '#CC0000' : '#6b7280';

        const upgradedCard = `
<div data-product-card="true" style="margin:40px 0;background:#fff;border:1px solid #e2e2e2;border-left:5px solid #CC0000;border-radius:0 8px 8px 0;overflow:hidden;">
  <div style="padding:24px;">
    <div style="display:inline-block;background:#CC0000;color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 10px;border-radius:4px;">${safeAwardLabel}</div>
    <div style="margin-top:16px;background:#f4f4f4;border-radius:6px;height:160px;display:flex;align-items:center;justify-content:center;padding:12px;">
      ${safeImageSrc ? `<img src="${safeImageSrc}" alt="${safeName}" style="max-height:160px;width:auto;object-fit:contain;" />` : '<span style="font-size:14px;color:#9ca3af;">No image available</span>'}
    </div>
    <h3 style="margin:16px 0 0;font-family:'Barlow Condensed',system-ui,-apple-system,sans-serif;font-size:20px;font-weight:800;line-height:1.2;color:#111;text-decoration:underline;">${safeName}</h3>
    <div style="margin-top:10px;display:flex;align-items:center;gap:8px;">
      <span style="font-size:18px;line-height:1;">${starsHtml}</span>
    </div>
    <p style="margin:8px 0 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:${scoreColor};">${score.toFixed(1)} / 10 Rating</p>
    <a href="${safeHref}" target="_blank" rel="noopener noreferrer sponsored" style="display:block;margin-top:16px;text-align:center;background:#CC0000;color:#fff;text-decoration:none;border-radius:6px;padding:14px 12px;font-family:'Barlow Condensed',system-ui,-apple-system,sans-serif;font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;">BUY OPTIONS ▾</a>
    <a href="#top" style="display:block;margin-top:8px;text-align:center;font-size:12px;color:#6b7280;text-decoration:none;">Jump to review ↓</a>
  </div>
</div>`;

        return trimmedDescription ? `${upgradedCard}<p>${trimmedDescription}</p>` : upgradedCard;
      }

      const card = [
        '<div class="affiliate-product-card" data-product-card="true">',
        imageTag,
        `<h3>${trimmedName}</h3>`,
        `<div class="affiliate-card-cta"><a href="${trimmedHref}" target="_blank" rel="noopener noreferrer sponsored">Check Price</a></div>`,
        '</div>',
      ].join('');

      return trimmedDescription ? `${card}<p>${trimmedDescription}</p>` : card;
    };

    // Convert old inline-formatted product chunks (title/asin/price/image/link)
    // into the new affiliate-product-card wrapper so global styling applies.
    const legacyBlockPattern = /<h3[^>]*>\s*<strong[^>]*>([^<]+?)<\/strong>\s*<\/h3>\s*<p[^>]*>\s*(?:<span[^>]*>)?\s*ASIN:\s*([^<]+?)\s*(?:<\/span>)?\s*<\/p>\s*<p[^>]*>\s*(?:<strong[^>]*>)?\s*([^<]+?)\s*(?:<\/strong>)?\s*<\/p>\s*<p[^>]*>\s*(?:<span[^>]*>)?\s*(<img[^>]+>)\s*(?:<\/span>)?\s*<\/p>\s*(?:<p[^>]*>\s*(?:<span[^>]*>)?([^<]+?)(?:<\/span>)?\s*<\/p>\s*)?<p[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?<\/p>/gi;

    let upgraded = replaceProductPlaceholders(html);

    upgraded = upgraded.replace(
      legacyBlockPattern,
      (_match, name, _asin, _price, imageTag, description, href) => {
        return buildAffiliateCard(name, imageTag, href, description) || _match;
      }
    );

    // Handle live legacy variant where image and description are mixed in the same paragraph.
    const mixedParagraphLegacyPattern = /<h3[^>]*>\s*<strong[^>]*>([^<]+?)<\/strong>\s*<\/h3>\s*<p[^>]*>[\s\S]*?ASIN:\s*([^<]+?)\s*(?:<\/span>)?\s*<\/p>\s*<p[^>]*>[\s\S]*?(?:<strong[^>]*>)?\s*([^<]+?)\s*(?:<\/strong>)?\s*<\/p>\s*<p[^>]*>[\s\S]*?(<img[^>]+>)[\s\S]*?(?:<\/span>)?\s*(?:<span[^>]*>)?([^<]*?)?(?:<\/span>)?\s*<\/p>\s*<p[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?<\/p>/gi;

    upgraded = upgraded.replace(
      mixedParagraphLegacyPattern,
      (_match, name, _asin, _price, imageTag, description, href) => {
        return buildAffiliateCard(name, imageTag, href, description) || _match;
      }
    );

    // Fallback: broad matcher for legacy chunks where CTA is wrapped in <strong><a>
    // and image/description may share one paragraph.
    const broadLegacyPattern = /<h3[^>]*>\s*<strong[^>]*>([^<]+?)<\/strong>\s*<\/h3>\s*<p[^>]*>[\s\S]*?ASIN:\s*([^<]+?)[\s\S]*?<\/p>\s*<p[^>]*>[\s\S]*?(\$[^<]+?)[\s\S]*?<\/p>\s*<p[^>]*>[\s\S]*?(<img[^>]+>)[\s\S]*?(?:<span[^>]*>)?([^<]*?)?(?:<\/span>)?[\s\S]*?<\/p>\s*<p[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?<\/p>/gi;

    upgraded = upgraded.replace(
      broadLegacyPattern,
      (_match, name, _asin, _price, imageTag, description, href) => {
        return buildAffiliateCard(name, imageTag, href, description) || _match;
      }
    );

    // Final cleanup for legacy chunks that still pass through:
    // remove ASIN and standalone price lines when they are attached to affiliate CTA blocks.
    upgraded = upgraded
      .replace(
        /<p[^>]*>\s*(?:<span[^>]*>)?\s*ASIN:\s*[^<]+(?:<\/span>)?\s*<\/p>(?=[\s\S]{0,500}<a[^>]*href="[^"]*(?:amzn\.to|amazon\.)[^"]*"[^>]*>)/gi,
        ''
      )
      .replace(
        /<p[^>]*>\s*(?:<strong[^>]*>)?\s*\$\s*[0-9][0-9,\.]*(?:<\/strong>)?\s*<\/p>(?=[\s\S]{0,250}<a[^>]*href="[^"]*(?:amzn\.to|amazon\.)[^"]*"[^>]*>)/gi,
        ''
      );

    return upgraded;
  };

  const normalizedContent = upgradeLegacyAffiliateBlocks(renderContent() || '');

  const renderHtmlSegment = (html: string, key: string) => {
    if (!html || !html.trim()) return null;

    return (
      <div key={key} className="w-full max-w-full" style={{ maxWidth: '100%' }}>
        <TableWrapper>
          <div
            className="
              w-full
              prose prose-base sm:prose-lg !max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
              prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-[#CC0000] prose-a:font-medium prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-ul:my-6 prose-ul:space-y-2
              prose-ol:my-6 prose-ol:space-y-2
              prose-li:text-gray-700
              prose-blockquote:border-l-4 prose-blockquote:border-[#CC0000] prose-blockquote:pl-4 sm:prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:pr-4 sm:prose-blockquote:pr-6
              prose-img:rounded-xl prose-img:shadow-md prose-img:my-8
              prose-code:text-[#CC0000] prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:overflow-x-auto
              prose-hr:my-12 prose-hr:border-gray-200
              [&>*]:!max-w-none [&_table]:w-full
              break-words
            "
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </TableWrapper>
      </div>
    );
  };

  const renderMixedContentFromHtml = (html: string) => {
    const normalizedHtml = String(html || '')
      .replace(/\[\[PRODUCT_BLOCK\|(accent|hero)\|([a-f0-9]{24})(?:\|[^\]]*)?\]\]/gi, (_match, blockType: string, productId: string) => {
        const normalizedType = String(blockType).toLowerCase() === 'hero' ? 'hero' : 'accent';
        const normalizedId = String(productId || '').toLowerCase();
        return `<div data-product-block="true" data-block-type="${normalizedType}" data-product-id="${normalizedId}"></div>`;
      })
      .replace(/blockType:\s*(accent|hero)\s*(?:\u00B7|\u00C2\u00B7)\s*productId:\s*([a-f0-9]{24})/gi, (_match, blockType: string, productId: string) => {
        const normalizedType = String(blockType).toLowerCase() === 'hero' ? 'hero' : 'accent';
        const normalizedId = String(productId || '').toLowerCase();
        return `<div data-product-block="true" data-block-type="${normalizedType}" data-product-id="${normalizedId}"></div>`;
      });

    const elements: React.ReactNode[] = [];
    const cardBuffer: React.ReactNode[] = [];
    const placeholderRegex = /<div\b[^>]*\bdata-product-block(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*\bdata-block-type=["'](accent|hero)["'][^>]*\bdata-product-id=["']([a-f0-9]{24})["'][^>]*>[\s\S]*?<\/div>/gi;

    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let segmentIndex = 0;
    let gridIndex = 0;

    const flushCardGrid = () => {
      if (cardBuffer.length === 0) return;

      elements.push(
        <div
          key={`product-grid-${gridIndex}`}
          className="my-8 grid grid-cols-1 gap-6 md:my-10 md:grid-cols-2 lg:grid-cols-4"
        >
          {cardBuffer.splice(0, cardBuffer.length)}
        </div>
      );

      gridIndex += 1;
    };

    while ((match = placeholderRegex.exec(normalizedHtml)) !== null) {
      const [rawPlaceholder, blockTypeFromHtml, productId] = match;
      const htmlBefore = normalizedHtml.slice(lastIndex, match.index);

      const upgradedBefore = upgradeLegacyAffiliateBlocks(htmlBefore);
      const htmlSegment = renderHtmlSegment(upgradedBefore, `html-segment-${segmentIndex}`);
      if (htmlSegment) {
        flushCardGrid();
        elements.push(htmlSegment);
      }

      const block = productMap[String(productId || '').trim().toLowerCase()];
      const product = block?.product;

      if (product) {
        const jumpTargetId = String(product.jumpTargetId || '').trim() || undefined;
        const blockType = (String(blockTypeFromHtml || block?.blockType).toLowerCase() === 'hero' ? 'hero' : 'accent') as 'hero' | 'accent';

        if (blockType === 'hero') {
          flushCardGrid();
          const score = toFiniteNumber(product.score, 9.0);
          const specs = Array.isArray(product.specs)
            ? product.specs
                .map((spec) => `${String(spec?.label || '').trim()}: ${String(spec?.value || '').trim()}`)
                .filter((value) => value !== ': ')
            : [];

          elements.push(
            <div key={`hero-block-${segmentIndex}`} id={jumpTargetId} className="my-8 md:my-10 scroll-mt-24">
              <HeroProductCard
                productName={String(product.productName || 'Top Pick')}
                year={new Date(post.publishedAt || Date.now()).getFullYear()}
                awardLabel={String(product.awardLabel || 'Best Overall')}
                overallScore={score}
                metrics={[
                  { label: 'Value', score },
                  { label: 'Durability', score },
                  { label: 'Comfort', score },
                ]}
                specs={specs}
                pros={Array.isArray(product.pros) && product.pros.length > 0 ? product.pros : ['Strong all-around performance']}
                cons={Array.isArray(product.cons) && product.cons.length > 0 ? product.cons : ['Premium pricing']}
                affiliateUrl={String(product.affiliateLink || '#')}
                jumpTargetId={jumpTargetId}
                imageUrl={String(product.imageUrl || '') || undefined}
              />
            </div>
          );
        } else {
          cardBuffer.push(
            <AccentCard
              key={`accent-block-${segmentIndex}`}
              jumpTargetId={jumpTargetId}
              productName={String(product.productName || 'Product')}
              affiliateUrl={String(product.affiliateLink || '#')}
              imageUrl={String(product.imageUrl || '')}
              awardLabel={product.awardLabel}
              score={Number.isFinite(Number(product.score)) ? Number(product.score) : undefined}
              specs={Array.isArray(product.specs)
                ? product.specs
                    .map((spec) => `${String(spec?.label || '').trim()}: ${String(spec?.value || '').trim()}`)
                    .map((value) => value.replace(/^:\s*/, '').trim())
                    .filter(Boolean)
                : []}
            />
          );
        }
      } else {
        // Intentionally omit unresolved placeholders to avoid rendering raw editor labels publicly.
      }

      lastIndex = match.index + rawPlaceholder.length;
      segmentIndex += 1;
    }

    const htmlAfter = normalizedHtml.slice(lastIndex);
    const upgradedAfter = upgradeLegacyAffiliateBlocks(htmlAfter);
    const trailingSegment = renderHtmlSegment(upgradedAfter, `html-tail-${segmentIndex}`);
    if (trailingSegment) {
      flushCardGrid();
      elements.push(trailingSegment);
    }

    flushCardGrid();

    return elements;
  };
  const cmsCta = (post as any).cta;
  const articleCta = cmsCta?.enabled
    ? {
        title: cmsCta.title || 'Ready To Upgrade Your Riding Gear?',
        description: cmsCta.description || 'Check the latest prices and deals before your next shift.',
        primaryHref: cmsCta.primaryHref || '',
        primaryLabel: cmsCta.primaryLabel || 'Compare All Options',
        secondaryHref: cmsCta.secondaryHref || undefined,
        secondaryLabel: cmsCta.secondaryLabel || undefined,
      }
    : null;
  const estimatedReadTime =
    typeof post.readTime === 'number' && post.readTime > 0
      ? post.readTime
      : estimateReadTimeFromHtml(normalizedContent);
  const { datePublished: publishedIso, dateModified: updatedIso, showUpdatedLabel } =
    getEditorialDates(post.publishedAt, (post as any).contentUpdatedAt);
  const updatedLabel = showUpdatedLabel ? formatDateAbsolute(updatedIso) : undefined;
  // Matches the hardcoded byline in ArticleAuthorBox — keep these in sync if that ever becomes
  // a real per-post field.
  const authorName = 'Marcus Webb';

  const articleSchemas: Array<Record<string, unknown>> = [
    buildBlogPostingSchema({
      url: articlePath,
      title: post.title,
      description: post.excerpt,
      image: featuredImageUrl,
      datePublished: publishedIso,
      dateModified: updatedIso,
      category: post.category,
      tags: post.tags,
      authorName,
    }),
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: post.category, url: `/category/${post.categorySlug}` },
      { name: post.title, url: articlePath },
    ]),
  ];

  // Editorial Product + Review schema.
  // ratingValue comes from toReviewRatingValue(score) — the shared helper that also drives
  // visible stars. The `stars` DB field is ignored (may be Amazon customer data).
  // buildProductReviewSchema returns null when name, image, or ratingValue is missing/invalid,
  // so partial markup never reaches Google.
  // Amazon-hosted images are skipped by the builder's own guard (isAmazonHostedImage).
  const AUTHOR_URL = toAbsoluteUrl('/about');

  const uniqueReviewedProducts = Array.from(
    new Map(
      Object.values(productMap)
        .map((block) => block?.product)
        .filter((product): product is ProductRecord => Boolean(product && product.productName))
        .map((product) => [String(product._id || product.productName), product])
    ).values()
  ).filter((product) => toReviewRatingValue(product.score) !== null);

  // Flag Amazon-hosted product images so they can be replaced (logged server-side only).
  uniqueReviewedProducts.forEach((product) => {
    if (product.imageUrl && isAmazonHostedImage(product.imageUrl)) {
      console.warn(
        `[schema] Product "${product.productName}" has an Amazon-hosted image and will be excluded from JSON-LD. ` +
        `Re-upload to Cloudinary and update the imageUrl field.`
      );
    }
  });

  const productReviewSchemas = uniqueReviewedProducts
    .map((product) =>
      buildProductReviewSchema({
        name: String(product.productName),
        image: String(product.imageUrl || ''),
        description: product.description,
        ratingValue: toReviewRatingValue(product.score) as number,
        authorName,
        authorUrl: AUTHOR_URL,
        reviewDatePublished: publishedIso,
        pros: product.pros,
        cons: product.cons,
      })
    )
    .filter((s): s is Record<string, unknown> => s !== null);

  // Schema structure decision (owner-approved):
  //   - Exactly 1 product block (uniqueReviewedProducts.length === 1) AND its schema is
  //     non-null → emit Product+Review directly (eligible for star snippet).
  //   - 2+ product blocks → always emit plain ItemList regardless of how many schemas
  //     are null. Google does not award review snippets for multi-product pages.
  //   - ItemList items use on-page anchor (#jumpTargetId) when available; omit url
  //     entirely when there is no anchor (never repeat the article URL, never use
  //     affiliate links).
  if (uniqueReviewedProducts.length === 1 && productReviewSchemas.length === 1) {
    articleSchemas.push(productReviewSchemas[0]);
  } else if (uniqueReviewedProducts.length > 1) {
    // Build plain ItemList from all product blocks (including those that failed schema
    // validation — they still deserve a list entry with name + optional anchor).
    const listItems = Object.values(productMap)
      .map((block) => block?.product)
      .filter((p): p is ProductRecord => Boolean(p?.productName))
      .map((p) => {
        const anchor = String(p.jumpTargetId || '').trim();
        return anchor
          ? { name: String(p.productName), url: `${articlePath}#${anchor}` }
          : { name: String(p.productName) };
      });
    if (listItems.length > 0) {
      articleSchemas.push(buildRoundupItemListSchema(listItems as Array<{ name: string; url?: string }>));
    }
  }

  return (
    <main className="bg-white" id="top">
      <SeoJsonLd data={articleSchemas} />
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-xs sm:text-sm text-amber-900 text-center">
            <strong className="font-semibold">Disclosure:</strong> This post contains affiliate links.
            If you make a purchase through these links, we may earn a commission at no extra cost to you.
          </p>
        </div>
      </div>

      <nav className="bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-[#CC0000] transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight size={14} className="text-gray-400" />
            <li>
              <Link
                href={`/category/${post.categorySlug}`}
                className="text-gray-500 hover:text-[#CC0000] transition-colors"
              >
                {post.category}
              </Link>
            </li>
            <ChevronRight size={14} className="text-gray-400" />
            <li className="text-gray-700 truncate max-w-[200px] sm:max-w-xs font-medium" title={post.title}>
              {post.title}
            </li>
          </ol>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="w-full max-w-7xl mx-auto box-border grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,300px)] gap-10 lg:gap-12 items-start">
          <div className="min-w-0 box-border">
            <article className="w-full min-w-0">
            <header className="mb-8 md:mb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              )}

              <div className="py-4 border-t border-b border-gray-200">
                <ArticleAuthorBox
                  publishedLabel={formatDateAbsolute(post.publishedAt)}
                  readTimeLabel={`${estimatedReadTime} min read`}
                  updatedLabel={updatedLabel}
                />
              </div>
            </header>

            {featuredImageUrl && (
              <figure className="mb-10 md:mb-12">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                  <Image
                    src={featuredImageUrl}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </figure>
            )}

            {renderMixedContentFromHtml(normalizedContent)}

            {articleCta && articleCta.primaryHref && (
              <ArticleBottomCta
                title={articleCta.title}
                description={articleCta.description}
                primaryHref={articleCta.primaryHref}
                primaryLabel={articleCta.primaryLabel}
                secondaryHref={articleCta.secondaryHref}
                secondaryLabel={articleCta.secondaryLabel}
              />
            )}

            {post.tags && post.tags.length > 0 && (
              <section className="mt-12 md:mt-16 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-[#CC0000] hover:text-white text-gray-700 text-sm font-medium rounded-full transition-all duration-200 cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-16 md:mt-20 text-center">
              <a
                href="#top"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#CC0000] transition-colors"
              >
                Back to Top
              </a>
            </div>
          </article>
        </div>

        <aside
          aria-label="Article sidebar"
          className="hidden box-border lg:block lg:self-start lg:sticky lg:top-20 lg:pt-1 lg:pr-1"
        >
          <div className="space-y-6">
            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Get the Best Stories First</h2>
              <div className="w-10 h-1 bg-[#CC0000] mt-3 mb-4" />
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                Subscribe for the latest rider guides, gear picks, and platform updates.
              </p>
              <NewsletterSignupForm
                source="article-sidebar"
                inputId="article-sidebar-newsletter-email"
                inputPlaceholder="your@email.com"
                buttonText="SUBSCRIBE"
                rowClassName="flex flex-col gap-3"
                inputClassName="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#CC0000] transition-colors"
                buttonClassName="w-full bg-[#CC0000] text-white py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded"
                messageClassName="mt-3 text-sm"
              />
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Related</h2>
              <div className="w-10 h-1 bg-[#CC0000] mt-3 mb-4" />
              <ul className="space-y-3">
                {relatedPosts.map((p) => (
                  <li key={`sidebar-${p.slug}`}>
                    <Link
                      href={`/${p.dbCategorySlug}/${p.slug}`}
                      className="block text-sm font-medium text-gray-700 hover:text-[#CC0000] transition-colors"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-16 md:mt-20 lg:mt-24 pt-12 border-t border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#CC0000] rounded-full" />
              Continue Reading
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((p) => {
                const relatedImageUrl = typeof p.featuredImage === 'string'
                  ? p.featuredImage
                  : (p.featuredImage as any)?.url;

                return (
                  <Link
                    key={p.slug}
                    href={`/${p.dbCategorySlug}/${p.slug}`}
                    className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#CC0000] hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      {relatedImageUrl ? (
                        <Image
                          src={relatedImageUrl}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#CC0000] transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                      {p.excerpt && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {p.excerpt}
                        </p>
                      )}
                      <div className="mt-3 text-xs font-semibold text-[#CC0000] group-hover:underline">
                        Read More -&gt;
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
