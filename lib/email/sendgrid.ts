import sgMail from '@sendgrid/mail';
import sendgridClient from '@sendgrid/client';
import { getSiteUrl } from '@/lib/site-url';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildEmailShell(content: string, unsubscribeUrl: string) {
  const siteUrl = getSiteUrl();
  const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl);

  return `
    <div style="margin:0; background:#f4f4f5; padding:24px 12px; font-family:Arial,sans-serif; color:#1a1a1a;">
      <div style="max-width:680px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden;">
        <div style="padding:24px; text-align:center; border-bottom:1px solid #e5e7eb; background:#ffffff;">
          <img src="${siteUrl}/Assets/Logo.png" alt="Rider Complex" width="220" style="max-width:100%; height:auto;" />
        </div>
        <div style="padding:28px 24px; text-align:center;">
          ${content}
        </div>
        <div style="padding:18px 24px; border-top:1px solid #e5e7eb; background:#fafafa; text-align:center; font-size:13px; color:#6b7280;">
          <p style="margin:0;">Rider Complex Newsletter</p>
          <p style="margin:8px 0 0;"><a href="${safeUnsubscribeUrl}" style="color:#6b7280;">Unsubscribe</a></p>
          <p style="margin:8px 0 0;">&copy; 2026 Rider Complex. All rights reserved.</p>
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

  return {
    from: {
      email: fromEmail,
      name: 'Rider Complex',
    },
  };
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { from } = configureSendGridClient();

  await sgMail.send({
    to: email,
    from,
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

export async function sendNewsletterWelcomeEmail(email: string, unsubscribeUrl: string) {
  const { from } = configureSendGridClient();
  const guideUrl = `${getSiteUrl()}/Assets/Starter_Checklist.pdf`;
  const safeGuideUrl = escapeHtml(guideUrl);

  await sgMail.send({
    to: email,
    from,
    subject: 'Your Rider Complex field guide is here',
    text: `You're confirmed\n\nHere is your free guide, What Nobody Tells You Before Your First Delivery. It's a 7 page PDF.\n\nDownload the guide: ${guideUrl}\n\nIf the button doesn't work, copy this link into your browser: ${guideUrl}\n\nUnsubscribe: ${unsubscribeUrl}`,
    html: buildEmailShell(`
      <h1 style="margin:0; font-size:38px; line-height:1.2; font-family:Georgia,serif; color:#111827;">You're confirmed</h1>
      <p style="margin:18px 0 0; font-size:20px; line-height:1.6; color:#1f2937;">Here is your free guide, What Nobody Tells You Before Your First Delivery. It's a 7 page PDF.</p>
      <p style="margin:28px 0 0;">
        <a href="${safeGuideUrl}" style="display:inline-block; background:#CC0000; color:#FFFFFF; text-decoration:none; padding:14px 22px; border-radius:8px; font-size:16px; line-height:1; font-weight:700;">
          Download the guide
        </a>
      </p>
      <p style="margin:18px 0 0; font-size:14px; line-height:1.6; color:#1f2937;">
        If the button doesn't work, copy this link into your browser:<br />
        <a href="${safeGuideUrl}" style="color:#CC0000; word-break:break-all;">${safeGuideUrl}</a>
      </p>
    `, unsubscribeUrl),
  });
}

export async function sendNewsletterVerificationEmail(email: string, verifyUrl: string) {
  const { from } = configureSendGridClient();
  const siteUrl = getSiteUrl();

  await sgMail.send({
    to: email,
    from,
    subject: 'Confirm your Rider Complex subscription',
    text: `Thanks for subscribing to Rider Complex. Verify your email address to complete your subscription: ${verifyUrl}\n\nThis link expires in 24 hours. If you didn't subscribe, you can safely ignore this email.`,
    html: `
      <div style="margin:0; background:#F9F9F9; padding:24px 12px; font-family:system-ui,-apple-system,sans-serif; color:#444444;">
        <style>
          @media only screen and (max-width: 640px) {
            .rc-card {
              padding: 40px 24px !important;
            }
            .rc-button {
              display: block !important;
              width: 100% !important;
              min-width: 0 !important;
              box-sizing: border-box !important;
            }
          }
        </style>
        <div style="max-width:600px; margin:0 auto;">
          <div style="background:#FFFFFF; border:1px solid #E5E5E5; border-radius:8px; box-shadow:0 6px 18px rgba(17,17,17,0.06); overflow:hidden;">
            <div style="padding:24px; text-align:center; border-bottom:1px solid #E5E5E5; background:#FFFFFF;">
              <img src="${siteUrl}/Assets/Logo.png" alt="Rider Complex" width="220" style="max-width:100%; height:auto;" />
            </div>
            <div class="rc-card" style="padding:40px; text-align:center; background:#FFFFFF;">
              <h1 style="margin:0; font-size:28px; line-height:1.2; font-weight:700; font-family:system-ui,-apple-system,sans-serif; color:#111111;">
                Confirm Your Email Address
              </h1>
              <p style="margin:16px 0 0; font-size:16px; line-height:1.6; color:#444444; font-family:system-ui,-apple-system,sans-serif;">
                Thanks for subscribing to Rider Complex. Click the button below to verify your email and start getting the best rider guides, gear picks, and platform tips.
              </p>
              <div style="margin-top:28px; text-align:center;">
                <a
                  href="${verifyUrl}"
                  class="rc-button"
                  style="display:inline-block; min-width:200px; background:#CC0000; color:#FFFFFF; text-decoration:none; padding:14px 22px; border-radius:8px; font-size:16px; line-height:1; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; font-family:system-ui,-apple-system,sans-serif; box-sizing:border-box;"
                >
                  VERIFY MY EMAIL
                </a>
              </div>
              <p style="margin:24px 0 0; font-size:14px; line-height:1.6; color:#444444; font-family:system-ui,-apple-system,sans-serif;">
                This link expires in 24 hours. If you didn't subscribe, you can safely ignore this email.
              </p>
            </div>
            <div style="padding:18px 24px; border-top:1px solid #E5E5E5; background:#FFFFFF; text-align:center; font-size:13px; color:#444444; font-family:system-ui,-apple-system,sans-serif;">
              <p style="margin:0;">&copy; 2026 Rider Complex. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendNewsletterLeadNotification(
  subscriberEmail: string,
  source: string,
  subscribedAt: Date
) {
  const { from } = configureSendGridClient();
  const listInbox = process.env.NEWSLETTER_LIST_EMAIL || 'info@ridercomplex.com';

  await sgMail.send({
    to: listInbox,
    from,
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
  const { from } = configureSendGridClient();
  const contactInbox = process.env.NEWSLETTER_LIST_EMAIL || 'info@ridercomplex.com';

  await sgMail.send({
    to: contactInbox,
    from,
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
