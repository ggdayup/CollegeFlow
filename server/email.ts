import nodemailer from 'nodemailer';
import type { Transporter, SentMessageInfo } from 'nodemailer';

/**
 * Create a nodemailer transporter from environment variables.
 * Falls back to console transport in dev mode.
 */
export function createTransporter(): {
  transporter: Transporter<SentMessageInfo>;
  isDevMode: boolean;
} {
  const isDevMode = process.env.EMAIL_DEV_MODE === 'true'
    || (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_HOST);

  if (isDevMode) {
    // Dev mode: use ethereal or fallback to a no-op transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
      },
    });

    return { transporter, isDevMode: true };
  }

  // Production mode: use configured SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return { transporter, isDevMode: false };
}

/**
 * Send a verification email with branded HTML template.
 */
export async function sendVerificationEmail(
  transporter: Transporter<SentMessageInfo>,
  isDevMode: boolean,
  to: string,
  url: string,
  userName?: string,
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:38030';

  // Extract token from the Better Auth verification URL
  // Better Auth URL format: http://localhost:38090/api/auth/email-verification?callbackURL=...&token=xxx
  const urlObj = new URL(url);
  const token = urlObj.searchParams.get('token') || '';
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  const displayName = userName || 'User';

  if (isDevMode) {
    console.log(`[Email] ===== DEV MODE: Verification email for ${to} =====`);
    console.log(`[Email] Verification link: ${verificationLink}`);
    console.log(`[Email] Original BA URL: ${url}`);
    console.log(`[Email] =====================================================`);
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - College Major Database</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 24px; text-align: center;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background-color: rgba(255,255,255,0.2); border-radius: 16px; margin-bottom: 16px;">
                <span style="font-size: 28px;">🎓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">
                College Major Database
              </h1>
              <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
                高校毕业生薪资与行业人才分析系统
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 20px; font-weight: 700;">
                Hi ${displayName},
              </h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                Thanks for signing up! Please verify your email address to unlock full access to major comparisons, university maps, and career analytics.
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #2563eb, #1d4ed8);">
                    <a href="${verificationLink}"
                       style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 12px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0; color: #3b82f6; font-size: 13px; word-break: break-all;">
                ${verificationLink}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                College Major Database &copy; 2026. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Verify Your Email - College Major Database
===========================================

Hi ${displayName},

Thanks for signing up! Please verify your email address by clicking the link below:

${verificationLink}

If you didn't create an account, you can safely ignore this email.

College Major Database - 2026
  `.trim();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@collegemajor.edu',
    to,
    subject: 'Verify your email - College Major Database',
    html,
    text,
  });
}

/**
 * Send a password reset email with branded HTML template.
 */
export async function sendResetPasswordEmail(
  transporter: Transporter<SentMessageInfo>,
  isDevMode: boolean,
  to: string,
  resetLink: string,
  _originalUrl?: string,
  userName?: string,
): Promise<void> {
  const displayName = userName || 'User';

  if (isDevMode) {
    console.log(`[Email] ===== DEV MODE: Password reset email for ${to} =====`);
    console.log(`[Email] Reset link: ${resetLink}`);
    console.log(`[Email] =====================================================`);
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - College Major Database</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 24px; text-align: center;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background-color: rgba(255,255,255,0.2); border-radius: 16px; margin-bottom: 16px;">
                <span style="font-size: 28px;">🔒</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">
                College Major Database
              </h1>
              <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
                Password Reset Request
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 20px; font-weight: 700;">
                Hi ${displayName},
              </h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #2563eb, #1d4ed8);">
                    <a href="${resetLink}"
                       style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 12px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0; color: #3b82f6; font-size: 13px; word-break: break-all;">
                ${resetLink}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                College Major Database &copy; 2026. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Reset Your Password - College Major Database
==============================================

Hi ${displayName},

We received a request to reset your password. Click the link below to set a new password. This link expires in 1 hour:

${resetLink}

If you didn't request this, you can safely ignore this email.

College Major Database - 2026
  `.trim();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@collegemajor.edu',
    to,
    subject: 'Reset your password - College Major Database',
    html,
    text,
  });
}
