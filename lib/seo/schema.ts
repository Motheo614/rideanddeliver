type JsonLd = Record<string, unknown>;

type BreadcrumbItem = {
  name: string;
  url: string;
};

type ArticleSchemaInput = {
  url: string;
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  category?: string;
  tags?: string[];
  authorName?: string;
};

type ItemListInput = {
  name: string;
  url: string;
};

type ProductSchemaInput = {
  name: string;
  url: string;
  image?: string;
  description?: string;
  price?: string;
};

const FALLBACK_SITE_URL = 'http://localhost:3000';
const SITE_NAME = 'Rider Complex';
const ORG_ID = '#organization';
const WEBSITE_ID = '#website';
const DEFAULT_LOGO_PATH = '/Assets/Logo.png';

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || FALLBACK_SITE_URL;
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

export function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalized = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${normalized}`;
}

export function buildOrganizationSchema(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': toAbsoluteUrl(ORG_ID),
    name: SITE_NAME,
    url: toAbsoluteUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: toAbsoluteUrl(DEFAULT_LOGO_PATH),
    },
  };
}

export function buildWebSiteSchema(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': toAbsoluteUrl(WEBSITE_ID),
    url: toAbsoluteUrl('/'),
    name: SITE_NAME,
    publisher: {
      '@id': toAbsoluteUrl(ORG_ID),
    },
  };
}

export function buildSiteGraphSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationSchema(), buildWebSiteSchema()],
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    })),
  };
}

export function buildBlogPostingSchema(input: ArticleSchemaInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': toAbsoluteUrl(input.url),
    },
    headline: input.title,
    description: input.description,
    image: input.image ? [toAbsoluteUrl(input.image)] : undefined,
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    articleSection: input.category,
    keywords: input.tags && input.tags.length > 0 ? input.tags.join(', ') : undefined,
    author: {
      '@type': 'Person',
      name: input.authorName || 'Rider Complex Team',
    },
    publisher: {
      '@id': toAbsoluteUrl(ORG_ID),
    },
  };
}

export function buildCollectionPageSchema(url: string, name: string, description?: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: toAbsoluteUrl(url),
    name,
    description,
    isPartOf: {
      '@id': toAbsoluteUrl(WEBSITE_ID),
    },
  };
}

export function buildItemListSchema(items: ItemListInput[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: toAbsoluteUrl(item.url),
      name: item.name,
    })),
  };
}

function extractPriceValue(raw?: string) {
  if (!raw) return undefined;
  const parsed = raw.replace(/,/g, '').match(/\d+(\.\d{1,2})?/);
  return parsed?.[0];
}

export function buildProductSchema(input: ProductSchemaInput): JsonLd {
  const normalizedPrice = extractPriceValue(input.price);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    image: input.image ? [toAbsoluteUrl(input.image)] : undefined,
    description: input.description,
    offers: {
      '@type': 'Offer',
      url: input.url,
      priceCurrency: 'USD',
      price: normalizedPrice,
      availability: 'https://schema.org/InStock',
    },
  };
}
