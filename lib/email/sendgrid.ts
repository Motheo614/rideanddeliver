import sgMail from '@sendgrid/mail';
import sendgridClient from '@sendgrid/client';

function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return rawUrl.replace(/\/$/, '');
}

function buildEmailShell(content: string) {
  const siteUrl = getSiteUrl();
  const year = new Date().getFullYear();

  return `
    <div style="margin:0; background:#f4f4f5; padding:24px 12px; font-family:Arial,sans-serif; color:#1a1a1a;">
      <div style="max-width:680px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden;">
        <div style="padding:24px; text-align:center; border-bottom:1px solid #e5e7eb; background:#ffffff;">
          <img src="${siteUrl}/Assets/Logo.png" alt="GearJunkie" width="220" style="max-width:100%; height:auto;" />
        </div>
        <div style="padding:28px 24px; text-align:center;">
          ${content}
        </div>
        <div style="padding:18px 24px; border-top:1px solid #e5e7eb; background:#fafafa; text-align:center; font-size:13px; color:#6b7280;">
          <p style="margin:0;">GearJunkie Newsletter</p>
          <p style="margin:8px 0 0;">&copy;${year} GearJunkie</p>
        </div>
      </div>
    </div>
  `;
}

export function isSendGridConfigured() {
  return Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
}

function configureSendGridClient() {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const residency = (process.env.SENDGRID_DATA_RESIDENCY || 'global').toLowerCase();

  if (!apiKey || !fromEmail) {
    throw new Error('SendGrid is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL.');
  }

  const client = sendgridClient;
  client.setApiKey(apiKey);
  if (residency === 'eu') {
    client.setDataResidency('eu');
  }
  sgMail.setClient(client);

  return { fromEmail };
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { fromEmail } = configureSendGridClient();

  await sgMail.send({
    to: email,
    from: fromEmail,
    subject: 'Reset your Rider Complex admin password',
    text: `You requested a password reset for your Rider Complex admin account.\n\nReset link:\n${resetUrl}\n\nThis link expires in 30 minutes.\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <h2>Reset your password</h2>
        <p>You requested a password reset for your Rider Complex admin account.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #cc0000; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: 700;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 30 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendNewsletterWelcomeEmail(email: string) {
  const { fromEmail } = configureSendGridClient();

  await sgMail.send({
    to: email,
    from: fromEmail,
    subject: 'Subscription confirmed - GearJunkie',
    text: `Your GearJunkie subscription is confirmed. You will receive practical rider guides, gear picks, and updates in your inbox.`,
    html: buildEmailShell(`
      <h1 style="margin:0; font-size:38px; line-height:1.2; font-family:Georgia,serif; color:#111827;">Subscription confirmed</h1>
      <p style="margin:18px 0 0; font-size:20px; line-height:1.6; color:#1f2937;">Thanks for subscribing to GearJunkie.</p>
      <p style="margin:10px 0 0; font-size:20px; line-height:1.6; color:#1f2937;">You will receive practical rider guides, gear picks, and updates in your inbox.</p>
    `),
  });
}

export async function sendNewsletterVerificationEmail(email: string, verifyUrl: string) {
  const { fromEmail } = configureSendGridClient();

  await sgMail.send({
    to: email,
    from: fromEmail,
    subject: 'Verify your GearJunkie subscription',
    text: `Please verify your email to complete your GearJunkie subscription: ${verifyUrl}`,
    html: buildEmailShell(`
      <h1 style="margin:0; font-size:56px; line-height:1.1; font-family:Georgia,serif; color:#111827;">Confirm your email</h1>
      <p style="margin:18px 0 0; font-size:20px; line-height:1.6; color:#1f2937;">Verify your email address to finish subscribing and continue reading.</p>
      <a href="${verifyUrl}" style="display:inline-block; margin-top:24px; background:#1f6f43; color:#ffffff; text-decoration:none; padding:16px 28px; border-radius:8px; font-size:34px; line-height:1; font-family:Impact,Haettenschweiler,'Arial Narrow Bold',sans-serif; letter-spacing:1px; text-transform:uppercase;">
        Verify Email
      </a>
      <p style="margin:18px 0 0; font-size:14px; color:#6b7280;">This verification link expires in 24 hours.</p>
    `),
  });
}

export async function sendNewsletterLeadNotification(
  subscriberEmail: string,
  source: string,
  subscribedAt: Date
) {
  const { fromEmail } = configureSendGridClient();
  const listInbox = process.env.NEWSLETTER_LIST_EMAIL || 'info@ridercomplex.com';

  await sgMail.send({
    to: listInbox,
    from: fromEmail,
    subject: `New newsletter subscriber: ${subscriberEmail}`,
    text: `New newsletter subscriber\n\nEmail: ${subscriberEmail}\nSource: ${source}\nSubscribed At (UTC): ${subscribedAt.toISOString()}\n`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <h2>New newsletter subscriber</h2>
        <p><strong>Email:</strong> ${subscriberEmail}</p>
        <p><strong>Source:</strong> ${source}</p>
        <p><strong>Subscribed At (UTC):</strong> ${subscribedAt.toISOString()}</p>
      </div>
    `,
  });
}

interface ContactNotificationPayload {
  name: string;
  email: string;
  message: string;
  submittedAt: Date;
}

export async function sendContactFormNotification(payload: ContactNotificationPayload) {
  const { fromEmail } = configureSendGridClient();
  const contactInbox = process.env.NEWSLETTER_LIST_EMAIL || 'info@ridercomplex.com';

  await sgMail.send({
    to: contactInbox,
    from: fromEmail,
    subject: `New contact form message from ${payload.name}`,
    text: `New contact form submission\n\nName: ${payload.name}\nEmail: ${payload.email}\nSubmitted At (UTC): ${payload.submittedAt.toISOString()}\n\nMessage:\n${payload.message}\n`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${payload.name}</p>
        <p><strong>Email:</strong> ${payload.email}</p>
        <p><strong>Submitted At (UTC):</strong> ${payload.submittedAt.toISOString()}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${payload.message}</p>
      </div>
    `,
  });
}
