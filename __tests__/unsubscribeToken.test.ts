import { afterEach, describe, expect, it } from 'vitest';
import { createUnsubscribeToken, verifyUnsubscribeToken } from '../lib/newsletter/unsubscribe-token';

const originalSecret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
const originalAuthSecret = process.env.NEXTAUTH_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  } else {
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET = originalSecret;
  }

  if (originalAuthSecret === undefined) {
    delete process.env.NEXTAUTH_SECRET;
  } else {
    process.env.NEXTAUTH_SECRET = originalAuthSecret;
  }
});

describe('newsletter unsubscribe tokens', () => {
  const subscriberId = '507f1f77bcf86cd799439011';
  const subscribedAt = new Date('2026-10-09T00:00:00.000Z');

  it('signs and verifies the subscriber id and subscription timestamp without putting an email in the token', () => {
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET = 'test-only-signing-secret';
    delete process.env.NEXTAUTH_SECRET;

    const token = createUnsubscribeToken(subscriberId, subscribedAt);
    expect(token).not.toContain('@');
    expect(verifyUnsubscribeToken(token)).toEqual({
      subscriberId,
      subscribedAt: subscribedAt.getTime(),
    });
  });

  it('rejects tampered tokens', () => {
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET = 'test-only-signing-secret';
    delete process.env.NEXTAUTH_SECRET;

    const token = createUnsubscribeToken(subscriberId, subscribedAt);
    const tamperedToken = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;
    expect(verifyUnsubscribeToken(tamperedToken)).toBeNull();
  });

  it('rejects tokens signed with a different secret', () => {
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET = 'first-test-secret';
    const token = createUnsubscribeToken(subscriberId, subscribedAt);

    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET = 'second-test-secret';
    expect(verifyUnsubscribeToken(token)).toBeNull();
  });

  it('rejects tokens when no signing secret is configured', () => {
    delete process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
    delete process.env.NEXTAUTH_SECRET;

    expect(() => createUnsubscribeToken(subscriberId, subscribedAt)).toThrow(
      'Newsletter unsubscribe signing is not configured.'
    );
  });
});
