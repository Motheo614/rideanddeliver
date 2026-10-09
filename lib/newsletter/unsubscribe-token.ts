import crypto from 'crypto';
import { getSiteUrl } from '@/lib/site-url';

export interface UnsubscribeTokenPayload {
  subscriberId: string;
  subscribedAt: number;
}

function getSigningSecret() {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('Newsletter unsubscribe signing is not configured. Set NEWSLETTER_UNSUBSCRIBE_SECRET or NEXTAUTH_SECRET.');
  }
  return secret;
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('base64url');
}

export function createUnsubscribeToken(subscriberId: string, subscribedAt: Date) {
  const subscribedAtMs = subscribedAt.getTime();
  if (!/^[a-f\d]{24}$/i.test(subscriberId) || !Number.isFinite(subscribedAtMs)) {
    throw new Error('Cannot create unsubscribe token for an invalid subscriber identity.');
  }

  const payload = Buffer.from(JSON.stringify({ subscriberId, subscribedAt: subscribedAtMs })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyUnsubscribeToken(token: string): UnsubscribeTokenPayload | null {
  const [payload, signature, ...extraParts] = token.split('.');
  if (
    !payload
    || !signature
    || extraParts.length > 0
    || !/^[A-Za-z\d_-]+$/.test(payload)
    || !/^[A-Za-z\d_-]+$/.test(signature)
  ) {
    return null;
  }

  const expectedSignature = sign(payload);
  const actualSignatureBuffer = Buffer.from(signature, 'base64url');
  const expectedSignatureBuffer = Buffer.from(expectedSignature, 'base64url');
  if (
    actualSignatureBuffer.length !== expectedSignatureBuffer.length
    || !crypto.timingSafeEqual(actualSignatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<UnsubscribeTokenPayload>;
    if (
      typeof decoded.subscriberId !== 'string'
      || !/^[a-f\d]{24}$/i.test(decoded.subscriberId)
      || typeof decoded.subscribedAt !== 'number'
      || !Number.isFinite(decoded.subscribedAt)
    ) {
      return null;
    }

    return { subscriberId: decoded.subscriberId, subscribedAt: decoded.subscribedAt };
  } catch {
    return null;
  }
}

export function createUnsubscribeUrl(subscriberId: string, subscribedAt: Date) {
  const token = createUnsubscribeToken(subscriberId, subscribedAt);
  return `${getSiteUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}
