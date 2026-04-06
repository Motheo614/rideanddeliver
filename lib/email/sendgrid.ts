import sgMail from '@sendgrid/mail';
import sendgridClient from '@sendgrid/client';

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
    subject: 'You are subscribed to Rider Complex',
    text: `Thanks for subscribing to Rider Complex updates. You will receive practical rider guides, gear picks, and updates in your inbox.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <h2>Subscription confirmed</h2>
        <p>Thanks for subscribing to <strong>Rider Complex</strong>.</p>
        <p>You will receive practical rider guides, gear picks, and updates in your inbox.</p>
      </div>
    `,
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
