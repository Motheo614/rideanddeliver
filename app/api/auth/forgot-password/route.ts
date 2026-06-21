import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { isSendGridConfigured, sendPasswordResetEmail } from '@/lib/email/sendgrid';

/**
 * POST /api/auth/forgot-password
 * Always returns a generic success message to avoid account enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordResetToken +passwordResetExpires');

    // Return success regardless of account existence.
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If that email exists, a password reset link has been sent.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresAt;
    await user.save();

    const baseUrl = request.nextUrl.origin || process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

    if (!isSendGridConfigured()) {
      console.warn('SendGrid is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in .env.local.');
      if (process.env.NODE_ENV !== 'production') {
        console.info(`Password reset link for ${normalizedEmail}: ${resetUrl}`);
      }
    } else {
      try {
        await sendPasswordResetEmail(normalizedEmail, resetUrl);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        if (process.env.NODE_ENV !== 'production') {
          console.info(`Password reset link for ${normalizedEmail}: ${resetUrl}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
