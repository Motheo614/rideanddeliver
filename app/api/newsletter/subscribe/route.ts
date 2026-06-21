import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/mongoose';
import Subscriber from '@/lib/db/models/Subscriber';
import {
  isSendGridConfigured,
  sendNewsletterLeadNotification,
  sendNewsletterVerificationEmail,
  sendNewsletterWelcomeEmail,
} from '@/lib/email/sendgrid';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return rawUrl.replace(/\/$/, '');
}

function createVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashVerificationToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * POST /api/newsletter/subscribe
 */
export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Subscriber.findOne({ email: normalizedEmail });
    const canSendEmail = isSendGridConfigured();
    const normalizedSource = typeof source === 'string' && source.trim() ? source.trim() : 'website';
    const token = createVerificationToken();
    const tokenHash = hashVerificationToken(token);
    const tokenExpiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);
    const verifyUrl = `${getSiteUrl()}/api/newsletter/verify?email=${encodeURIComponent(normalizedEmail)}&token=${token}`;

    if (!canSendEmail) {
      return NextResponse.json(
        { error: 'Email delivery is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    if (existing) {
      const isLegacyOrVerified = existing.isVerified !== false;

      if (existing.status === 'active' && isLegacyOrVerified) {
        try {
          await sendNewsletterWelcomeEmail(normalizedEmail, existing.source);
        } catch (emailError) {
          console.error('Newsletter welcome email error:', emailError);
        }

        return NextResponse.json({
          success: true,
          message: 'You are already subscribed. We sent a confirmation email.',
        });
      }

      if (existing.status === 'unsubscribed' && isLegacyOrVerified) {
        existing.status = 'active';
        existing.isVerified = true;
        existing.source = normalizedSource;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = undefined;
        await existing.save();

        try {
          await sendNewsletterLeadNotification(normalizedEmail, normalizedSource, existing.subscribedAt);
          await sendNewsletterWelcomeEmail(normalizedEmail, existing.source);
        } catch (emailError) {
          console.error('Newsletter welcome email error:', emailError);
        }

        return NextResponse.json({
          success: true,
          message: 'Welcome back. You are subscribed again.',
        });
      }

      existing.status = 'pending';
      existing.isVerified = false;
      existing.source = normalizedSource;
      existing.verificationTokenHash = tokenHash;
      existing.verificationTokenExpiresAt = tokenExpiresAt;
      await existing.save();

      try {
        await sendNewsletterVerificationEmail(normalizedEmail, verifyUrl);
      } catch (emailError) {
        console.error('Newsletter verification email error:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: 'Please check your email and verify your subscription.',
      });
    }

    await Subscriber.create({
      email: normalizedEmail,
      source: normalizedSource,
      status: 'pending',
      isVerified: false,
      verificationTokenHash: tokenHash,
      verificationTokenExpiresAt: tokenExpiresAt,
      subscribedAt: new Date(),
    });

    try {
      await sendNewsletterVerificationEmail(normalizedEmail, verifyUrl);
    } catch (emailError) {
      console.error('Newsletter verification email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Check your inbox and click verify to complete your subscription.',
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'Unable to subscribe right now. Please try again.' },
      { status: 500 }
    );
  }
}
