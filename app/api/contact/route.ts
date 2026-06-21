import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import ContactSubmission from '@/lib/db/models/ContactSubmission';
import { isSendGridConfigured, sendContactFormNotification } from '@/lib/email/sendgrid';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/contact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 120 characters.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 5000 characters.' },
        { status: 400 }
      );
    }

    await connectDB();

    const submission = await ContactSubmission.create({
      name,
      email,
      message,
      source: 'contact-page',
      submittedAt: new Date(),
    });

    if (isSendGridConfigured()) {
      try {
        await sendContactFormNotification({
          name,
          email,
          message,
          submittedAt: submission.submittedAt,
        });
      } catch (emailError) {
        console.error('Contact form notification email error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thanks for reaching out. We received your message.',
    });
  } catch (error) {
    console.error('Contact form submit error:', error);
    return NextResponse.json(
      { error: 'Unable to send your message right now. Please try again.' },
      { status: 500 }
    );
  }
}