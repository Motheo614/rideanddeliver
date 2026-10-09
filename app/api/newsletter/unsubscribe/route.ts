import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Subscriber from '@/lib/db/models/Subscriber';
import { verifyUnsubscribeToken } from '@/lib/newsletter/unsubscribe-token';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function htmlPage(title: string, message: string, token?: string, status = 200) {
  const content = token
    ? `
      <p>${message}</p>
      <form method="post" action="/api/newsletter/unsubscribe">
        <input type="hidden" name="token" value="${escapeHtml(token)}" />
        <button type="submit" style="background:#CC0000;color:#FFFFFF;border:0;border-radius:4px;padding:12px 20px;font-size:16px;font-weight:700;cursor:pointer;">
          Confirm unsubscribe
        </button>
      </form>
    `
    : `<p>${message}</p>`;

  return new NextResponse(
    `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
      </head>
      <body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
        <main style="max-width:640px;margin:48px auto;padding:0 16px;">
          <section style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;text-align:center;">
            <h1 style="margin:0 0 16px;font-size:32px;">${title}</h1>
            ${content}
          </section>
        </main>
      </body>
    </html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  );
}

function invalidTokenPage() {
  return htmlPage(
    'Unsubscribe link invalid',
    'This unsubscribe link is invalid or has been changed. No changes were made.',
    undefined,
    400
  );
}

function signingUnavailablePage() {
  return htmlPage(
    'Unsubscribe temporarily unavailable',
    'Unsubscribe could not be completed right now. Please try again later or contact Rider Complex support.',
    undefined,
    503
  );
}

async function findTokenSubscriber(token: string) {
  const payload = verifyUnsubscribeToken(token);
  if (!payload) {
    return { payload: null, subscriber: null };
  }

  await connectDB();
  const subscriber = await Subscriber.findById(payload.subscriberId);
  if (!subscriber || subscriber.subscribedAt?.getTime() !== payload.subscribedAt) {
    return { payload: null, subscriber: null };
  }

  return { payload, subscriber };
}

/**
 * GET /api/newsletter/unsubscribe?token=<signed-token>
 * GET only displays the confirmation step; it never changes subscription state.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';

  try {
    const { payload, subscriber } = await findTokenSubscriber(token);
    if (!payload || !subscriber) {
      return invalidTokenPage();
    }

    if (subscriber.status === 'unsubscribed') {
      return htmlPage('Already unsubscribed', 'This email address is already unsubscribed.');
    }

    return htmlPage(
      'Unsubscribe from Rider Complex emails?',
      'Confirm below to stop receiving emails from Rider Complex.',
      token
    );
  } catch (error) {
    console.error('Newsletter unsubscribe page error:', error);
    return signingUnavailablePage();
  }
}

/**
 * POST /api/newsletter/unsubscribe
 * Only the explicit form submission changes the subscriber status.
 */
export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return invalidTokenPage();
  }

  const token = formData.get('token');
  if (typeof token !== 'string' || !token) {
    return invalidTokenPage();
  }

  try {
    const { payload, subscriber } = await findTokenSubscriber(token);
    if (!payload || !subscriber) {
      return invalidTokenPage();
    }

    if (subscriber.status === 'unsubscribed') {
      return htmlPage('You are unsubscribed', 'This email address is unsubscribed from Rider Complex emails.');
    }

    if (subscriber.status !== 'active' && subscriber.status !== 'pending') {
      return invalidTokenPage();
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    subscriber.verificationTokenHash = undefined;
    subscriber.verificationTokenExpiresAt = undefined;
    await subscriber.save();

    return htmlPage('You are unsubscribed', 'You will no longer receive emails from Rider Complex.');
  } catch (error) {
    console.error('Newsletter unsubscribe request error:', error);
    return signingUnavailablePage();
  }
}
