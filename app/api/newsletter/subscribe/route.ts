import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Subscriber from '@/lib/db/models/Subscriber';
import {
  isSendGridConfigured,
  sendNewsletterLeadNotification,
  sendNewsletterWelcomeEmail,
} from '@/lib/email/sendgrid';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    if (existing) {
      if (existing.status === 'active') {
        if (canSendEmail) {
          try {
            await sendNewsletterWelcomeEmail(normalizedEmail);
          } catch (emailError) {
            console.error('Newsletter welcome email error:', emailError);
          }
        }

        return NextResponse.json({
          success: true,
          message: canSendEmail
            ? 'You are already subscribed. We sent a confirmation email.'
            : 'You are already subscribed.',
        });
      }

      existing.status = 'active';
      existing.source = normalizedSource;
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = undefined;
      await existing.save();

      if (canSendEmail) {
        try {
          await sendNewsletterLeadNotification(normalizedEmail, normalizedSource, existing.subscribedAt);
          await sendNewsletterWelcomeEmail(normalizedEmail);
        } catch (emailError) {
          console.error('Newsletter welcome email error:', emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Welcome back. You are subscribed again.',
      });
    }

    await Subscriber.create({
      email: normalizedEmail,
      source: normalizedSource,
      status: 'active',
      subscribedAt: new Date(),
    });

    if (canSendEmail) {
      try {
        await sendNewsletterLeadNotification(normalizedEmail, normalizedSource, new Date());
        await sendNewsletterWelcomeEmail(normalizedEmail);
      } catch (emailError) {
        console.error('Newsletter welcome email error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing.',
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'Unable to subscribe right now. Please try again.' },
      { status: 500 }
    );
  }
}
