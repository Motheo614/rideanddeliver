import { describe, expect, it } from 'vitest';
import { isTextLedArticleHeaderEnabled } from '../lib/articleHeader';

describe('isTextLedArticleHeaderEnabled', () => {
  it('keeps the hero image in production by default', () => {
    expect(isTextLedArticleHeaderEnabled({ vercelEnv: 'production', nodeEnv: 'production' })).toBe(false);
    expect(isTextLedArticleHeaderEnabled({ nodeEnv: 'production' })).toBe(false);
  });

  it('enables the text-led header in previews by default', () => {
    expect(isTextLedArticleHeaderEnabled({ vercelEnv: 'preview', nodeEnv: 'production' })).toBe(true);
  });

  it('supports local development and an explicit non-production override', () => {
    expect(isTextLedArticleHeaderEnabled({ nodeEnv: 'development' })).toBe(true);
    expect(isTextLedArticleHeaderEnabled({ flag: 'false', vercelEnv: 'preview', nodeEnv: 'production' })).toBe(false);
  });
});
