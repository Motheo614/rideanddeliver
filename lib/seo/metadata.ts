import type { Metadata } from 'next';

type MetadataType = 'website' | 'article';

interface BaseMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: MetadataType;
  keywords?: string[];
  noIndex?: boolean;
}

interface ArticleMetadataInput extends BaseMetadataInput {
  type: 'article';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

const FALLBACK_SITE_URL = 'http://localhost:3000';
const SITE_NAME = 'Rider Complex';
const DEFAULT_SOCIAL_IMAGE = '/Assets/Logo.png';

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || FALLBACK_SITE_URL;
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalized = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${normalized}`;
}

export function buildPageMetadata(input: BaseMetadataInput): Metadata {
  const absoluteUrl = toAbsoluteUrl(input.path);
  const image = toAbsoluteUrl(input.image || DEFAULT_SOCIAL_IMAGE);

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: input.path,
    },
    robots: input.noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : undefined,
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: input.type || 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export function buildArticleMetadata(input: ArticleMetadataInput): Metadata {
  const metadata = buildPageMetadata({
    ...input,
    type: 'article',
  });

  const image = toAbsoluteUrl(input.image || DEFAULT_SOCIAL_IMAGE);
  metadata.openGraph = {
    ...metadata.openGraph,
    type: 'article',
    publishedTime: input.publishedTime,
    modifiedTime: input.modifiedTime,
    section: input.section,
    tags: input.tags,
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: input.title,
      },
    ],
  };

  return metadata;
}
