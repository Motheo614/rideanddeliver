import { describe, expect, it } from 'vitest';
import { resolveAmazonAffiliateUrl } from '@/lib/affiliate/amazonLink';

const TAG = 'example-20';

describe('resolveAmazonAffiliateUrl', () => {
  it('appends our tag to an Amazon product URL without one', () => {
    expect(resolveAmazonAffiliateUrl(' https://www.amazon.com/dp/B00EXAMPLE ', '', TAG).url)
      .toBe('https://www.amazon.com/dp/B00EXAMPLE?tag=example-20');
  });

  it('keeps a URL that already carries our tag', () => {
    const url = 'https://www.amazon.com/dp/B00EXAMPLE?tag=example-20';
    expect(resolveAmazonAffiliateUrl(url, '', TAG)).toEqual({ url });
  });

  it('replaces a different tag and flags it', () => {
    const result = resolveAmazonAffiliateUrl('https://www.amazon.com/dp/B00EXAMPLE?tag=other-20', '', TAG);
    expect(result).toEqual({ url: 'https://www.amazon.com/dp/B00EXAMPLE?tag=example-20', replacedTag: true });
  });

  it('leaves shortened links untouched', () => {
    expect(resolveAmazonAffiliateUrl('https://amzn.to/abc123', '', TAG).url).toBe('https://amzn.to/abc123');
    expect(resolveAmazonAffiliateUrl('https://a.co/d/abc123', '', TAG).url).toBe('https://a.co/d/abc123');
  });

  it('builds a URL from the ASIN when no link is stored', () => {
    expect(resolveAmazonAffiliateUrl('', 'b00example', TAG).url)
      .toBe('https://www.amazon.com/dp/B00EXAMPLE?tag=example-20');
  });

  it.each([
    ['#'],
    ['javascript:alert(1)'],
    ['http://www.amazon.com/dp/B00EXAMPLE'],
    ['https://evil.example/amazon.com/dp/B00EXAMPLE'],
    ['https://www.amazon.com.evil.example/dp/B00EXAMPLE'],
    ['https://user:pass@www.amazon.com/dp/B00EXAMPLE'],
    ['not a url'],
  ])('rejects %s', (link) => {
    expect(resolveAmazonAffiliateUrl(link, '', TAG).url).toBeNull();
  });

  it('rejects everything that needs a tag when none is configured', () => {
    expect(resolveAmazonAffiliateUrl('https://www.amazon.com/dp/B00EXAMPLE', '', '').url).toBeNull();
    expect(resolveAmazonAffiliateUrl('', 'B00EXAMPLE', '').url).toBeNull();
  });
});
