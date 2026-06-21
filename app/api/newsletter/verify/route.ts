import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/mongoose';
import Subscriber from '@/lib/db/models/Subscriber';
import {
  isSendGridConfigured,
  sendNewsletterLeadNotification,
  sendNewsletterWelcomeEmail,
} from '@/lib/email/sendgrid';

function htmlPage(title: string, message: string, success: boolean) {
  const buttonBg = success ? '#1f6f43' : '#cc0000';
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
      </head>
      <body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
        <main style="max-width:720px;margin:28px auto;padding:0 12px;">
          <section style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <header style="padding:24px;text-align:center;border-bottom:1px solid #e5e7eb;">
              <img src="/Assets/Logo.png" alt="Rider Complex" width="220" style="max-width:100%;height:auto;" />
            </header>
            <div style="padding:28px 24px;text-align:center;">
              <h1 style="margin:0;font-size:42px;line-height:1.15;font-family:Georgia,serif;">${title}</h1>
              <p style="margin:16px 0 0;font-size:22px;line-height:1.5;">${message}</p>
              <a href="/" style="display:inline-block;margin-top:24px;background:${buttonBg};color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;">
                Continue
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  `;
}

function hashVerificationToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * GET /api/newsletter/verify?email=<email>&token=<token>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  const token = (searchParams.get('token') || '').trim();

  if (!email || !token) {
    return new NextResponse(
      htmlPage('Verification failed', 'Your verification link is invalid. Please subscribe again.', false),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  try {
    await connectDB();

    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return new NextResponse(
        htmlPage('Verification failed', 'Subscriber was not found. Please subscribe again.', false),
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    if (subscriber.status === 'active' && subscriber.isVerified) {
      return new NextResponse(
        htmlPage('Already verified', 'Your subscription is already verified.', true),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const tokenHash = hashVerificationToken(token);
    const isTokenValid = Boolean(
      subscriber.verificationTokenHash
      && subscriber.verificationTokenExpiresAt
      && subscriber.verificationTokenHash === tokenHash
      && subscriber.verificationTokenExpiresAt.getTime() > Date.now()
    );

    if (!isTokenValid) {
      return new NextResponse(
        htmlPage('Verification expired', 'Your verification link expired. Please subscribe again.', false),
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    subscriber.status = 'active';
    subscriber.isVerified = true;
    subscriber.verifiedAt = new Date();
    subscriber.subscribedAt = new Date();
    subscriber.unsubscribedAt = undefined;
    subscriber.verificationTokenHash = undefined;
    subscriber.verificationTokenExpiresAt = undefined;
    await subscriber.save();

    if (isSendGridConfigured()) {
      try {
        await sendNewsletterLeadNotification(subscriber.email, subscriber.source || 'website', subscriber.subscribedAt);
        await sendNewsletterWelcomeEmail(subscriber.email, subscriber.source);
      } catch (emailError) {
        console.error('Newsletter post-verify email error:', emailError);
      }
    }

    return new NextResponse(
      htmlPage('Email verified', 'Thanks. Your subscription is now active.', true),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error) {
    console.error('Newsletter verify error:', error);
    return new NextResponse(
      htmlPage('Verification failed', 'Something went wrong. Please try subscribing again.', false),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
