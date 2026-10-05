import { describe, expect, it } from 'vitest';
import { checkSchemaHtml } from '../scripts/check-schema';

const blogPosting = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Test article',
  image: ['https://example.com/article.jpg'],
  author: { '@type': 'Person', name: 'Test Author' },
  publisher: { '@type': 'Organization', name: 'Test Publisher' },
  datePublished: '2025-01-01T10:00:00Z',
  dateModified: '2025-01-02T10:00:00Z',
};

const product = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Test product',
  image: ['https://example.com/product.jpg'],
  review: {
    '@type': 'Review',
    reviewRating: { '@type': 'Rating', ratingValue: 4.5 },
  },
};

function jsonLd(value: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
}

function validFixture(overrides: {
  posting?: Record<string, unknown>;
  product?: Record<string, unknown>;
  body?: string;
} = {}): string {
  return `${jsonLd(overrides.posting || blogPosting)}${jsonLd(overrides.product || product)}${overrides.body || '<div>Published January 1, 2025 • Last updated: January 2, 2025</div>'}`;
}

describe('checkSchemaHtml', () => {
  it('accepts valid BlogPosting and Product JSON-LD with matching visible update date', () => {
    expect(checkSchemaHtml(validFixture())).toEqual([]);
  });

  it('reports malformed JSON-LD', () => {
    const html = `<script type="application/ld+json">{not json}</script>${jsonLd(blogPosting)}`;
    expect(checkSchemaHtml(html).some((error) => error.includes('does not parse'))).toBe(true);
  });

  it('reports duplicate types and forbidden nested keys', () => {
    const unsafeProduct = {
      ...product,
      offers: { price: '$12.34' },
    };
    const errors = checkSchemaHtml(`${jsonLd(blogPosting)}${jsonLd(product)}${jsonLd(unsafeProduct)}`);

    expect(errors).toContain('More than one JSON-LD block has @type "Product".');
    expect(errors).toContain('Forbidden structured-data key "offers" found.');
    expect(errors).toContain('Forbidden structured-data key "price" found.');
  });

  it('requires Product name, image, review, and a valid rating value', () => {
    const badProduct = {
      '@type': 'Product',
      review: { '@type': 'Review', reviewRating: { '@type': 'Rating', ratingValue: 5.5 } },
    };
    const errors = checkSchemaHtml(validFixture({ product: badProduct }));

    expect(errors).toContain('Product is missing name.');
    expect(errors).toContain('Product is missing image.');
    expect(errors).toContain('Product ratingValue must be between 1 and 5.');
  });

  it('requires BlogPosting fields, timezone-qualified dates, and correct date order', () => {
    const badPosting = {
      '@type': 'BlogPosting',
      headline: 'Bad dates',
      image: 'https://example.com/article.jpg',
      author: { name: 'Test Author' },
      publisher: { name: 'Test Publisher' },
      datePublished: '2025-01-03T10:00:00',
      dateModified: '2025-01-02T10:00:00Z',
    };
    const errors = checkSchemaHtml(validFixture({ posting: badPosting, body: '' }));

    expect(errors).toContain('BlogPosting datePublished must be ISO 8601 with a timezone.');
    expect(errors).toContain('BlogPosting dateModified is earlier than datePublished.');
  });

  it('rejects a mismatched Last updated label and a label when dates are equal', () => {
    const mismatch = checkSchemaHtml(validFixture({
      body: '<div>Last updated: January 3, 2025</div>',
    }));
    expect(mismatch.some((error) => error.includes('differs from dateModified'))).toBe(true);

    const sameDatePosting = {
      ...blogPosting,
      dateModified: blogPosting.datePublished,
    };
    const equalDates = checkSchemaHtml(validFixture({
      posting: sameDatePosting,
      body: '<div>Last updated: January 1, 2025</div>',
    }));
    expect(equalDates).toContain('A Last updated label is present when dateModified equals datePublished.');
  });

  it('rejects visible currency amounts inside product cards and comparison tables', () => {
    const card = checkSchemaHtml(validFixture({
      body: '<div data-product-card="true"><p>Price $12.34</p></div>',
    }));
    const table = checkSchemaHtml(validFixture({
      body: '<section data-comparison-table="true"><p>€39.99</p></section>',
    }));

    expect(card).toContain('Visible currency amount found inside a product card or comparison table.');
    expect(table).toContain('Visible currency amount found inside a product card or comparison table.');
  });
});
